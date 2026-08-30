import mongoose from 'mongoose';

const roleCompetencyRequirementSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['cso', 'nsso', 'admin', 'all'],
      default: 'all',
      lowercase: true,
      trim: true,
      index: true,
    },
    division: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    designation: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    skillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CompetencyFramework',
      required: true,
    },
    skillName: {
      type: String,
      required: true,
    },
    domain: {
      type: String,
      enum: ['Statistical', 'Technical', 'Digital Governance', 'Behavioural/Managerial'],
      required: true,
    },
    requiredLevel: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

roleCompetencyRequirementSchema.index({ designation: 1, skillId: 1 }, { unique: true });

const RoleCompetencyRequirement = mongoose.model(
  'RoleCompetencyRequirement',
  roleCompetencyRequirementSchema
);

export default RoleCompetencyRequirement;
