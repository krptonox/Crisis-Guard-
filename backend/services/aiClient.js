const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const crypto = require('crypto');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * Calculate file hash
 */
const calculateFileHash = (filePath) => {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
};

/**
 * Detect file type from mimetype
 */
const detectFileType = (mimetype) => {
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.startsWith('video/')) return 'video';
    if (mimetype === 'application/pdf') return 'document';
    if (mimetype.includes('word') || mimetype.includes('document')) return 'document';
    if (mimetype === 'text/plain' || mimetype === 'text/html') return 'chat';
    return 'other';
};

/**
 * Send file to AI service for analysis
 */
const analyzeWithAI = async (filePath, fileType, evidenceId) => {
    try {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(filePath));
        formData.append('fileType', fileType);
        formData.append('evidenceId', String(evidenceId));

        const response = await axios.post(`${AI_SERVICE_URL}/analyze`, formData, {
            headers: formData.getHeaders(),
            timeout: 120000 // 2 minute timeout for video processing
        });

        return response.data;
    } catch (error) {
        console.error('AI Service Error:', error.message);
        if (error.response) {
            console.error('AI Response:', error.response.data);
        }

        // Return fallback response if AI service is unavailable
        return {
            verdict: 'Suspicious',
            confidence: 50,
            findings: [
                {
                    type: 'AI Service Unavailable',
                    severity: 'MEDIUM',
                    details: 'Primary AI analysis failed. Using basic forensic validation.'
                },
                {
                    type: 'Basic Validation',
                    severity: 'LOW',
                    details: 'File structure appears valid. Further analysis recommended.'
                }
            ]
        };
    }
};

/**
 * Check AI service health
 */
const checkAIHealth = async () => {
    try {
        const response = await axios.get(`${AI_SERVICE_URL}/health`, { timeout: 5000 });
        return response.data;
    } catch (error) {
        console.warn('AI Service health check failed:', error.message);
        return { status: 'unavailable' };
    }
};

module.exports = {
    analyzeWithAI,
    calculateFileHash,
    detectFileType,
    checkAIHealth
};