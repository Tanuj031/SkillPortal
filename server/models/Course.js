import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    title:      { type: String, required: true, trim: true },
    provider:   { type: String, required: true, trim: true },
    courseCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    skillTags:  [{ type: String, trim: true }],
    domain: {
      type: String,
      required: true,
      trim: true,
    },
    duration:   { type: String, required: true },            // e.g. "5 days", "12 hours"
    level:      { type: Number, required: true, min: 1, max: 5 },
    isActive:   { type: Boolean, default: true },
    source:     { type: String, default: 'MoSPI NSSTA Training Calendar FY2025-26' },
    participants: { type: String, default: '' },
    batchSize:  { type: String, default: '' },
    venue:      { type: String, default: 'NSSTA' },
  },
  { timestamps: true }
);

// Text index for search functionality
courseSchema.index({ title: 'text', skillTags: 'text' });

const Course = mongoose.model('Course', courseSchema);

export default Course;
