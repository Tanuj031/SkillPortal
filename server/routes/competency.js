import express from 'express';
import CompetencyFramework from '../models/CompetencyFramework.js';
import UserCompetencyProfile from '../models/UserCompetencyProfile.js';
import { calculateUserSkillGaps } from '../services/gapAnalysisService.js';
import { generateGapExplanation } from '../services/aiService.js';

const router = express.Router();

// GET /api/competency/framework — Returns all canonical MoSPI skills grouped by domain
router.get('/framework', async (req, res) => {
  try {
    const competencies = await CompetencyFramework.find({ isActive: true }).lean();

    const domainsMap = {
      Statistical: [],
      Technical: [],
      'Digital Governance': [],
      'Behavioural/Managerial': [],
    };

    competencies.forEach((comp) => {
      if (domainsMap[comp.domain]) {
        domainsMap[comp.domain].push({
          id: comp._id,
          skillName: comp.skillName,
          description: comp.description,
          domain: comp.domain,
          requiredLevel: comp.requiredLevel || 4,
        });
      }
    });

    res.json({
      success: true,
      domains: Object.keys(domainsMap).map((domainName) => ({
        domain: domainName,
        skills: domainsMap[domainName],
      })),
      totalSkills: competencies.length,
    });
  } catch (err) {
    console.error('Error fetching competency framework:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/competency/profile — Save/update user competency profile self-assessment ratings
router.post('/profile', async (req, res) => {
  try {
    const { userId, ratings } = req.body;

    if (!userId || !Array.isArray(ratings) || ratings.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payload. userId and non-empty ratings array are required.',
      });
    }

    // Resolve competency details for each rating
    const profileCompetencies = await Promise.all(
      ratings.map(async (r) => {
        const compDoc = await CompetencyFramework.findById(r.competencyId || r.id).lean();
        return {
          competencyId: r.competencyId || r.id,
          skillName: compDoc ? compDoc.skillName : r.skillName || 'Skill',
          domain: compDoc ? compDoc.domain : r.domain || 'Statistical',
          level: Number(r.level) || 3,
        };
      })
    );

    const totalLevel = profileCompetencies.reduce((acc, curr) => acc + curr.level, 0);
    const avgScore = Math.round((totalLevel / (profileCompetencies.length * 5)) * 100);

    const updatedProfile = await UserCompetencyProfile.findOneAndUpdate(
      { userId },
      {
        $set: {
          competencies: profileCompetencies,
          overallScore: avgScore,
        },
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Competency self-assessment profile saved successfully.',
      profile: updatedProfile,
    });
  } catch (err) {
    console.error('Error saving user competency profile:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/competency/gaps/:userId — Competency skill gap analysis with optional AI explanation (?explain=true)
router.get('/gaps/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const shouldExplain = req.query.explain === 'true';

    const gapResult = await calculateUserSkillGaps(userId);

    if (shouldExplain) {
      const explainedGaps = await Promise.all(
        gapResult.gaps.map(async (gap) => {
          const aiExplanation = await generateGapExplanation(
            gap.skillName,
            gap.currentLevel,
            gap.requiredLevel,
            gap.severity
          );
          return {
            ...gap,
            aiExplanation,
          };
        })
      );

      return res.json({
        success: true,
        isExplained: true,
        ...gapResult,
        gaps: explainedGaps,
      });
    }

    res.json({
      success: true,
      isExplained: false,
      ...gapResult,
    });
  } catch (err) {
    console.error('Error fetching competency gaps:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
