const express = require('express');
const Evidence = require('../models/Evidence');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/evidence/:id
// @desc    Get single evidence by ID (full detail)
router.get('/evidence/:id', async (req, res) => {
    try {
        const evidence = await Evidence.findById(req.params.id);
        if (!evidence) return res.status(404).json({ error: 'Evidence not found' });
        res.json(evidence);
    } catch (error) {
        console.error('Get evidence error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   GET /api/evidences
// @desc    Get all evidences with filtering, pagination
router.get('/evidences', async (req, res) => {
    try {
        const { limit = 100, page = 1, verdict, fileType, search, sortBy = 'createdAt', sortDir = 'desc' } = req.query;

        const filter = {};
        if (verdict && verdict !== 'all' && verdict !== 'All') filter.verdict = verdict;
        if (fileType && fileType !== 'all' && fileType !== 'All') filter.fileType = fileType.toLowerCase();
        if (search) filter.originalName = { $regex: search, $options: 'i' };

        const sort = { [sortBy]: sortDir === 'asc' ? 1 : -1 };

        const evidences = await Evidence.find(filter)
            .sort(sort)
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .select('-aiResponse -filePath'); // Exclude large fields from list

        const total = await Evidence.countDocuments(filter);

        res.json({
            evidences,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get evidences error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   GET /api/evidences/stats/summary
// @desc    Get aggregate statistics for dashboard
router.get('/evidences/stats/summary', async (req, res) => {
    try {
        const total = await Evidence.countDocuments();
        const verdictBreakdown = await Evidence.aggregate([
            { $group: { _id: '$verdict', count: { $sum: 1 }, avgConfidence: { $avg: '$confidence' } } }
        ]);
        const typeBreakdown = await Evidence.aggregate([
            { $group: { _id: '$fileType', count: { $sum: 1 } } }
        ]);
        const riskBreakdown = await Evidence.aggregate([
            { $group: { _id: '$riskLevel', count: { $sum: 1 } } }
        ]);

        // Recent 30-day activity
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const recentActivity = await Evidence.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' }
                    },
                    count: { $sum: 1 },
                    tampered: { $sum: { $cond: [{ $eq: ['$verdict', 'Tampered'] }, 1, 0] } }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]);

        const authentic = verdictBreakdown.find(v => v._id === 'Authentic')?.count || 0;
        const suspicious = verdictBreakdown.find(v => v._id === 'Suspicious')?.count || 0;
        const tampered = verdictBreakdown.find(v => v._id === 'Tampered')?.count || 0;
        const pending = verdictBreakdown.find(v => v._id === 'Pending')?.count || 0;

        const avgConfidenceAll = verdictBreakdown.reduce((acc, v) => {
            if (v._id && v.avgConfidence) acc.push(v.avgConfidence);
            return acc;
        }, []);
        const avgConfidence = avgConfidenceAll.length > 0
            ? avgConfidenceAll.reduce((a, b) => a + b, 0) / avgConfidenceAll.length
            : 0;

        res.json({
            total, authentic, suspicious, tampered, pending,
            avgConfidence: Math.round(avgConfidence),
            byVerdict: verdictBreakdown,
            byType: typeBreakdown,
            byRisk: riskBreakdown,
            recentActivity,
            stats: {
                tamperedPercentage: total > 0 ? Math.round((tampered / total) * 100) : 0,
                authenticPercentage: total > 0 ? Math.round((authentic / total) * 100) : 0,
            }
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   GET /api/evidences/export/csv
// @desc    Export all evidences as CSV
router.get('/evidences/export/csv', async (req, res) => {
    try {
        const evidences = await Evidence.find()
            .sort({ createdAt: -1 })
            .select('originalName fileType verdict confidence riskLevel verdictReason fileHash createdAt analyzedAt');

        const rows = [
            ['ID', 'File Name', 'Type', 'Verdict', 'Confidence (%)', 'Risk Level', 'Verdict Reason', 'SHA-256 Hash', 'Analyzed At', 'Created At']
        ];

        for (const e of evidences) {
            rows.push([
                e._id.toString(),
                `"${(e.originalName || '').replace(/"/g, '""')}"`,
                e.fileType || '',
                e.verdict || '',
                e.confidence || 0,
                e.riskLevel || '',
                `"${(e.verdictReason || '').replace(/"/g, '""')}"`,
                e.fileHash || '',
                e.analyzedAt ? new Date(e.analyzedAt).toLocaleString() : '',
                new Date(e.createdAt).toLocaleString()
            ]);
        }

        const csv = rows.map(r => r.join(',')).join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=crisis_guard_evidence_export.csv');
        res.send(csv);
    } catch (error) {
        console.error('CSV export error:', error);
        res.status(500).json({ error: 'Export failed' });
    }
});

// @route   GET /api/evidences/timeline
// @desc    Get evidence items in timeline format (last 50)
router.get('/evidences/timeline', async (req, res) => {
    try {
        const evidences = await Evidence.find({ verdict: { $ne: 'Pending' } })
            .sort({ createdAt: -1 })
            .limit(50)
            .select('originalName fileType verdict confidence riskLevel verdictReason createdAt analyzedAt');

        const timeline = evidences.map(e => ({
            id: e._id,
            fileName: e.originalName,
            fileType: e.fileType,
            verdict: e.verdict,
            confidence: e.confidence,
            riskLevel: e.riskLevel,
            summary: e.verdictReason ? e.verdictReason.substring(0, 120) + '...' : '',
            analyzedAt: e.analyzedAt || e.createdAt,
        }));

        res.json({ timeline });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   DELETE /api/evidence/:id
// @desc    Delete evidence
router.delete('/evidence/:id', protect, async (req, res) => {
    try {
        const evidence = await Evidence.findById(req.params.id);
        if (!evidence) return res.status(404).json({ error: 'Evidence not found' });

        const fs = require('fs');
        if (fs.existsSync(evidence.filePath)) {
            try { fs.unlinkSync(evidence.filePath); } catch (e) {}
        }

        await evidence.deleteOne();
        res.json({ message: 'Evidence deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;