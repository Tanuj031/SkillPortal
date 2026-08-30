import { createRequire } from 'module';
import connectDB from '../config/db.js';
import Course from '../models/Course.js';

const require = createRequire(import.meta.url);
const nsstaCatalogData = require('../data/nssta-catalog.json');

/**
 * Upserts NSSTA Training Calendar records into Course collection
 * @param {Array} customRecords - Optional array of custom NSSTA course records
 */
export async function runNsstaCatalogImport(customRecords = null) {
  const recordsToImport = Array.isArray(customRecords) && customRecords.length > 0
    ? customRecords
    : nsstaCatalogData;

  let importedCount = 0;
  let updatedCount = 0;

  for (const item of recordsToImport) {
    const courseDoc = {
      title: item.title,
      provider: item.provider || 'NSSTA',
      courseCode: item.courseCode.toUpperCase(),
      domain: item.domain,
      skillTags: item.skillTags || [],
      duration: item.duration || '5 days',
      level: item.level || 3,
      isActive: true,
      source: item.source || 'MoSPI NSSTA Advance Training Calendar FY2025-26',
    };

    const existing = await Course.findOne({ courseCode: courseDoc.courseCode });

    if (existing) {
      await Course.updateOne({ courseCode: courseDoc.courseCode }, { $set: courseDoc });
      updatedCount++;
    } else {
      await Course.create(courseDoc);
      importedCount++;
    }
  }

  return {
    success: true,
    imported: importedCount,
    updated: updatedCount,
    total: recordsToImport.length,
  };
}

// Allow standalone execution via CLI
if (process.argv[1] && process.argv[1].includes('importNsstaCatalog.js')) {
  (async () => {
    try {
      console.log('📦  Connecting to MongoDB for NSSTA Catalog Import...');
      await connectDB();

      console.log('⏳  Importing MoSPI NSSTA Catalog (FY 2025-26)...');
      const stats = await runNsstaCatalogImport();

      console.log(`✅  NSSTA Catalog Import Completed successfully!`);
      console.log(`    Imported (New): ${stats.imported}`);
      console.log(`    Updated:        ${stats.updated}`);
      console.log(`    Total Courses:  ${stats.total}`);

      process.exit(0);
    } catch (err) {
      console.error('❌  NSSTA Catalog Import Failed:', err);
      process.exit(1);
    }
  })();
}
