import mongoose from 'mongoose';

const userCompetencyProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    competencies: [
      {
        competencyId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'CompetencyFramework',
          required: true,
        },
        skillName: { type: String, required: true },
        domain: { type: String, required: true },
        level: { type: Number, required: true, min: 1, max: 5 },
      },
    ],
    overallScore: {
      type: Number,
      default: 70,
    },
  },
  { timestamps: true }
);

const UserCompetencyProfile = mongoose.model('UserCompetencyProfile', userCompetencyProfileSchema);

export default UserCompetencyProfile;
