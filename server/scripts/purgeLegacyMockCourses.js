import connectDB from '../config/db.js';
import Course from '../models/Course.js';

(async () => {
  try {
    await connectDB();
    const result = await Course.deleteMany({
      courseCode: { $in: ['IGOT-TECH-205', 'NSSTA-STAT-301', 'IGOT-DG-301'] },
    });
    console.log(`✅ Deleted ${result.deletedCount} legacy mock course documents from MongoDB.`);
    process.exit(0);
  } catch (err) {
    console.error('Error purging legacy mock courses:', err);
    process.exit(1);
  }
})();
