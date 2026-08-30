import express from 'express';
import User from '../models/User.js';
import { getRecommendedCourses } from '../services/recommendationService.js';

const router = express.Router();

// PATCH /api/users/:userId/assignment — Update user's current assignment
router.patch('/:userId/assignment', async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentAssignment } = req.body;

    if (currentAssignment === undefined) {
      return res.status(400).json({
        success: false,
        message: 'currentAssignment field is required in request body',
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { currentAssignment: currentAssignment.trim() } },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      message: 'Current assignment updated successfully',
      user: updatedUser,
    });
  } catch (err) {
    console.error('Error updating user assignment:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/users/:userId/recommendations — Assignment-aware course recommendations for a user
router.get('/:userId/recommendations', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await getRecommendedCourses(userId);
    res.json({
      success: true,
      ...result,
    });
  } catch (err) {
    console.error('Error generating recommendations:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
