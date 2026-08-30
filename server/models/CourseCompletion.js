import mongoose from 'mongoose';

const courseCompletionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed'],
      default: 'not_started',
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    competencyLevelBefore: {
      type: Number,
      default: 0,
    },
    competencyLevelAfter: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

// Compound unique index per user and course
courseCompletionSchema.index({ userId: 1, courseId: 1 }, { unique: true });

const CourseCompletion = mongoose.model('CourseCompletion', courseCompletionSchema);

export default CourseCompletion;
