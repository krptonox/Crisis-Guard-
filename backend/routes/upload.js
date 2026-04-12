const express = require('express');
const upload = require('../middleware/upload');
const Evidence = require('../models/Evidence');
const { analyzeWithAI, calculateFileHash, detectFileType } = require('../services/aiClient');

const router = express.Router();

// @route   POST /api/upload
// @desc    Upload and analyze evidence file
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const file = req.file;
        const fileHash = calculateFileHash(file.path);
        const fileType = detectFileType(file.mimetype);

        // Check duplicate
        const existingEvidence = await Evidence.findOne({ fileHash });
        if (existingEvidence) {
            return res.json({
                message: 'File already analyzed — returning cached result',
                evidenceId: existingEvidence._id,
                isDuplicate: true,
                result: {
                    verdict: existingEvidence.verdict,
                    confidence: existingEvidence.confidence,
                    verdictReason: existingEvidence.verdictReason,
                    riskLevel: existingEvidence.riskLevel,
                    findings: existingEvidence.findings,
                    recommendations: existingEvidence.recommendations,
                    analysisBreakdown: existingEvidence.analysisBreakdown,
                }
            });
        }

        const userId = req.user ? req.user._id : null;

        // Create evidence record in Pending state
        const evidence = new Evidence({
            userId,
            fileName: file.filename,
            originalName: file.originalname,
            fileType,
            fileSize: file.size,
            filePath: file.path,
            fileHash,
            mimeType: file.mimetype,
            verdict: 'Pending',
            confidence: 0,
            findings: [],
            verdictReason: '',
            recommendations: [],
            analysisBreakdown: {},
            forensicMetadata: {}
        });

        await evidence.save();

        // Send to AI service
        const aiResult = await analyzeWithAI(file.path, fileType, evidence._id);

        // Update evidence with full AI results
        evidence.verdict = aiResult.verdict;
        evidence.confidence = aiResult.confidence;
        evidence.findings = aiResult.findings || [];
        evidence.verdictReason = aiResult.verdict_reason || '';
        evidence.recommendations = aiResult.recommendations || [];
        evidence.analysisBreakdown = aiResult.analysis_breakdown || {};
        evidence.forensicMetadata = aiResult.image_metadata || aiResult.video_metadata || aiResult.document_metadata || aiResult.chat_metadata || {};
        evidence.aiResponse = aiResult;
        evidence.engineVersion = aiResult.engineVersion || '2.0.0';
        evidence.analyzedAt = new Date();

        await evidence.save();

        res.json({
            message: 'Analysis complete',
            evidenceId: evidence._id,
            isDuplicate: false,
            result: {
                verdict: evidence.verdict,
                confidence: evidence.confidence,
                riskLevel: evidence.riskLevel,
                verdictReason: evidence.verdictReason,
                findings: evidence.findings,
                recommendations: evidence.recommendations,
                analysisBreakdown: evidence.analysisBreakdown,
                forensicMetadata: evidence.forensicMetadata,
            }
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            error: 'Analysis failed',
            message: error.message
        });
    }
});

// @route   POST /api/reanalyze/:id
// @desc    Re-run analysis on existing evidence
router.post('/reanalyze/:id', async (req, res) => {
    try {
        const evidence = await Evidence.findById(req.params.id);
        if (!evidence) return res.status(404).json({ error: 'Evidence not found' });

        const fs = require('fs');
        if (!fs.existsSync(evidence.filePath)) {
            return res.status(410).json({ error: 'Original file no longer available for re-analysis.' });
        }

        const aiResult = await analyzeWithAI(evidence.filePath, evidence.fileType, evidence._id);

        evidence.verdict = aiResult.verdict;
        evidence.confidence = aiResult.confidence;
        evidence.findings = aiResult.findings || [];
        evidence.verdictReason = aiResult.verdict_reason || '';
        evidence.recommendations = aiResult.recommendations || [];
        evidence.analysisBreakdown = aiResult.analysis_breakdown || {};
        evidence.forensicMetadata = aiResult.image_metadata || aiResult.video_metadata || aiResult.document_metadata || aiResult.chat_metadata || {};
        evidence.aiResponse = aiResult;
        evidence.reanalysisCount = (evidence.reanalysisCount || 0) + 1;
        evidence.lastReanalyzedAt = new Date();

        await evidence.save();

        res.json({
            message: 'Re-analysis complete',
            evidenceId: evidence._id,
            result: {
                verdict: evidence.verdict,
                confidence: evidence.confidence,
                riskLevel: evidence.riskLevel,
                verdictReason: evidence.verdictReason,
                findings: evidence.findings,
                recommendations: evidence.recommendations,
            }
        });
    } catch (error) {
        console.error('Re-analysis error:', error);
        res.status(500).json({ error: 'Re-analysis failed', message: error.message });
    }
});

module.exports = router;