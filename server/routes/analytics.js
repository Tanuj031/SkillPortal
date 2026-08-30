import express from 'express';
import { calculateImpact, calculateAggregateImpact } from '../services/impactAnalysisService.js';

const router = express.Router();

// GET /api/analytics/impact/summary — Admin aggregate impact view across all domains
router.get('/impact/summary', async (req, res) => {
  try {
    const summary = await calculateAggregateImpact();
    res.json({
      success: true,
      ...summary,
    });
  } catch (err) {
    console.error('Error fetching analytics impact summary:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/analytics/impact/:userId — User-specific training impact analysis
router.get('/impact/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const impactData = await calculateImpact(userId);
    res.json({
      success: true,
      ...impactData,
    });
  } catch (err) {
    console.error('Error fetching user impact analytics:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
