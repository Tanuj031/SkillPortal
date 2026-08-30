import connectDB from '../config/db.js';
import UserCompetencyProfile from '../models/UserCompetencyProfile.js';

(async () => {
  try {
    await connectDB();
    const profiles = await UserCompetencyProfile.find({}).lean();
    console.log(`Total UserCompetencyProfile records: ${profiles.length}`);
    profiles.forEach((p, idx) => {
      console.log(`\nDocument #${idx + 1} (userId: ${p.userId}):`);
      console.log(JSON.stringify(p, null, 2));
    });
    process.exit(0);
  } catch (err) {
    console.error('Error querying profiles:', err);
    process.exit(1);
  }
})();
