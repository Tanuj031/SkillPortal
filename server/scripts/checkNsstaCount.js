import connectDB from '../config/db.js';
import Course from '../models/Course.js';
import { runNsstaCatalogImport } from './importNsstaCatalog.js';

(async () => {
  try {
    await connectDB();
    let count = await Course.countDocuments({ source: 'MoSPI NSSTA Advance Training Calendar FY2025-26' });
    console.log(`db.courses.find({ source: "MoSPI NSSTA Advance Training Calendar FY2025-26" }).count() -> Initial: ${count}`);

    if (count === 0) {
      console.log('Running importNsstaCatalog.js import script now...');
      const result = await runNsstaCatalogImport();
      console.log('Import result:', result);
      count = await Course.countDocuments({ source: 'MoSPI NSSTA Advance Training Calendar FY2025-26' });
    }

    console.log(`RESULT_COUNT=${count}`);
    process.exit(0);
  } catch (err) {
    console.error('Error checking count:', err);
    process.exit(1);
  }
})();
