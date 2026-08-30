import express from 'express';
import Course from '../models/Course.js';
import CourseCompletion from '../models/CourseCompletion.js';
import User from '../models/User.js';

const router = express.Router();

// GET /api/courses — list all courses with optional filters
router.get('/', async (req, res) => {
  try {
    const { domain, provider, level, search, duration } = req.query;
    const filter = { isActive: true };

    if (domain)   filter.domain = domain;
    if (provider) filter.provider = provider;
    if (level)    filter.level = { $gte: Number(level) };

    // Duration filter: short (<10h), medium (10-40h), long (40h+/weeks)
    if (duration === 'short')  filter.duration = { $regex: /^\d+\s*hours?$/i };
    if (duration === 'medium') filter.duration = { $regex: /^(1[0-9]|[2-3]\d|40)\s*hours?$/i };
    if (duration === 'long')   filter.duration = { $regex: /weeks?/i };

    if (search) {
      filter.$text = { $search: search };
    }

    const courses = await Course.find(filter).sort({ domain: 1, level: 1 }).lean();

    res.json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/courses/recommendations/:userId — list of course recommendations with reasons
router.get('/recommendations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { getRecommendedCourses } = await import('../services/recommendationService.js');
    const result = await getRecommendedCourses(userId);
    res.json({
      success: true,
      ...result,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/courses/completions/:userId — list of a user's course completions
router.get('/completions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const completions = await CourseCompletion.find({ userId })
      .populate('courseId', 'title courseCode provider domain duration level skillTags')
      .sort({ updatedAt: -1 })
      .lean();

    res.json({
      success: true,
      count: completions.length,
      data: completions,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/courses/:courseCode — single course by code
router.get('/:courseCode', async (req, res) => {
  try {
    const course = await Course.findOne({
      courseCode: req.params.courseCode.toUpperCase(),
      isActive: true,
    }).lean();

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    res.json({ success: true, data: course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/courses/domain/:domain — courses by domain
router.get('/domain/:domain', async (req, res) => {
  try {
    const courses = await Course.find({
      domain: req.params.domain,
      isActive: true,
    })
      .sort({ level: 1 })
      .lean();

    res.json({ success: true, count: courses.length, data: courses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/courses/:courseId/start — creates/updates CourseCompletion, snapshots current competency level
router.post('/:courseId/start', async (req, res) => {
  try {
    const { courseId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required in request body' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const user = await User.findById(userId);
    const levelBefore = user ? user.competencyScore || 75 : 75;

    const completion = await CourseCompletion.findOneAndUpdate(
      { userId, courseId },
      {
        $set: {
          status: 'in_progress',
          startedAt: new Date(),
          competencyLevelBefore: levelBefore,
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: `Course "${course.title}" started`,
      completion,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/courses/:courseId/complete — marks completed, snapshots competency level again
router.post('/:courseId/complete', async (req, res) => {
  try {
    const { courseId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required in request body' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const existing = await CourseCompletion.findOne({ userId, courseId });
    const levelBefore = existing ? existing.competencyLevelBefore : 75;
    const levelAfter = levelBefore + (course.level || 1) * 2; // Skill gain snapshot boost

    const completion = await CourseCompletion.findOneAndUpdate(
      { userId, courseId },
      {
        $set: {
          status: 'completed',
          completedAt: new Date(),
          competencyLevelBefore: levelBefore,
          competencyLevelAfter: levelAfter,
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: `Course "${course.title}" marked as completed`,
      completion,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
