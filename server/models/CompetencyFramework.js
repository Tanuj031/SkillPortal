import mongoose from 'mongoose';

const competencyFrameworkSchema = new mongoose.Schema(
  {
    domain: {
      type: String,
      required: true,
      enum: ['Statistical', 'Technical', 'Digital Governance', 'Behavioural/Managerial'],
      index: true,
    },
    skillName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    requiredLevel: {
      type: Number,
      default: 4,
      min: 1,
      max: 5,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const CompetencyFramework = mongoose.model('CompetencyFramework', competencyFrameworkSchema);

export default CompetencyFramework;
