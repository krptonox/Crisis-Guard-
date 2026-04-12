const mongoose = require('mongoose');

// ── Sub-schema: Individual Finding ────────────────────────────────────────────
const findingSchema = new mongoose.Schema({
    type: { type: String, required: true },
    severity: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'], required: true },
    details: { type: String, required: true },
    reason: { type: String, default: '' },     // WHY this finding matters
    technical: { type: String, default: '' },   // Technical detail for experts
}, { _id: false });

// ── Sub-schema: Analysis Module Score ─────────────────────────────────────────
const moduleScoreSchema = new mongoose.Schema({
    moduleName: String,
    score: Number,
    interpretation: String,
    description: String,
    status: String,
}, { _id: false });

// ── Main Evidence Schema ───────────────────────────────────────────────────────
const evidenceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    fileName: { type: String, required: true },
    originalName: { type: String, required: true },
    fileType: {
        type: String,
        enum: ['image', 'video', 'document', 'chat', 'other'],
        required: true
    },
    fileSize: { type: Number, required: true },
    filePath: { type: String, required: true },
    fileHash: { type: String, required: true, index: true },
    mimeType: { type: String, required: true },

    // ── Verdict & Confidence ──
    verdict: {
        type: String,
        enum: ['Authentic', 'Suspicious', 'Tampered', 'Pending'],
        default: 'Pending',
        index: true
    },
    confidence: { type: Number, min: 0, max: 100, default: 0 },

    // ── NEW: Plain-english verdict explanation ──
    verdictReason: { type: String, default: '' },

    // ── NEW: Risk level (derived from verdict + confidence) ──
    riskLevel: {
        type: String,
        enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'NONE'],
        default: 'NONE'
    },

    // ── Findings (with reason + technical fields) ──
    findings: [findingSchema],

    // ── NEW: Analyst recommendations ──
    recommendations: [{ type: String }],

    // ── NEW: Module-level scores breakdown (ELA, DCT, Noise, etc.) ──
    analysisBreakdown: { type: mongoose.Schema.Types.Mixed, default: {} },

    // ── NEW: File-type-specific metadata from AI ── 
    forensicMetadata: { type: mongoose.Schema.Types.Mixed, default: {} },

    // Full raw AI response
    aiResponse: { type: mongoose.Schema.Types.Mixed },

    // ── Engine Info ──
    engineVersion: { type: String, default: '2.0.0' },
    analyzedAt: { type: Date },

    // ── Re-analysis count ──
    reanalysisCount: { type: Number, default: 0 },
    lastReanalyzedAt: { type: Date },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Update timestamp on save
evidenceSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    // Compute riskLevel from verdict
    if (this.verdict === 'Tampered' && this.confidence >= 85) this.riskLevel = 'CRITICAL';
    else if (this.verdict === 'Tampered') this.riskLevel = 'HIGH';
    else if (this.verdict === 'Suspicious') this.riskLevel = 'MEDIUM';
    else if (this.verdict === 'Authentic') this.riskLevel = 'LOW';
    else this.riskLevel = 'NONE';
    next();
});

// Index for dashboard queries
evidenceSchema.index({ createdAt: -1 });
evidenceSchema.index({ verdict: 1, createdAt: -1 });

module.exports = mongoose.model('Evidence', evidenceSchema);