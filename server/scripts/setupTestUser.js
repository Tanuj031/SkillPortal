import connectDB from '../config/db.js';
import User from '../models/User.js';
import UserCompetencyProfile from '../models/UserCompetencyProfile.js';
import CompetencyFramework from '../models/CompetencyFramework.js';

async function setupTestUser() {
  await connectDB();
  const user = await User.findOne({});
  if (!user) {
    console.error('No user found in database.');
    process.exit(1);
  }

  user.designation = 'Director';
  await user.save();

  const samplingSkill = await CompetencyFramework.findOne({ skillName: 'Sampling' }).lean();
  const surveySkill = await CompetencyFramework.findOne({ skillName: 'Survey Design' }).lean();
  const accountsSkill = await CompetencyFramework.findOne({ skillName: 'National Accounts' }).lean();

  const sampleCompetencies = [
    { competencyId: samplingSkill?._id, skillName: 'Sampling', domain: 'Statistical', level: 2 },
    { competencyId: surveySkill?._id, skillName: 'Survey Design', domain: 'Statistical', level: 3 },
    { competencyId: accountsSkill?._id, skillName: 'National Accounts', domain: 'Statistical', level: 3.5 },
  ];

  const profile = await UserCompetencyProfile.findOneAndUpdate(
    { userId: user._id.toString() },
    {
      $set: {
        userId: user._id.toString(),
        overallScore: 65,
        competencies: sampleCompetencies,
      },
    },
    { upsert: true, new: true }
  );

  console.log('✅ User updated:', {
    userId: user._id.toString(),
    email: user.email,
    designation: user.designation,
    profileCompetencies: profile.competencies,
  });

  process.exit(0);
}

setupTestUser();
