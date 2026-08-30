import 'dotenv/config';
import mongoose from 'mongoose';
import { createRequire } from 'module';
import Course from '../models/Course.js';

const require = createRequire(import.meta.url);
const catalogData = require('../data/igot-catalog.json');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mospi_skill_platform';

/**
 * Main catalog import function
 * @param {Array} customCatalog - Optional array of courses to import
 * @returns {Promise<{ imported: number, updated: number, total: number }>}
 */
export async function runCatalogImport(customCatalog = null) {
  const catalog = customCatalog || catalogData;
  let importedCount = 0;
  let updatedCount = 0;

  for (const course of catalog) {
    if (!course.courseCode) continue;

    // Check if course already exists to track accurate imported vs updated
    const existing = await Course.findOne({ courseCode: course.courseCode.toUpperCase() });

    await Course.findOneAndUpdate(
      { courseCode: course.courseCode.toUpperCase() },
      {
        $set: {
          title:      course.title,
          provider:   course.provider,
          courseCode: course.courseCode.toUpperCase(),
          skillTags:  course.skillTags || [],
          domain:     course.domain,
          duration:   course.duration,
          level:      course.level,
          isActive:   true,
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    if (existing) {
      updatedCount++;
    } else {
      importedCount++;
    }
  }

  return {
    imported: importedCount,
    updated: updatedCount,
    total: catalog.length,
  };
}

// Standalone CLI runner execution
if (process.argv[1] && process.argv[1].endsWith('importIgotCatalog.js')) {
  (async () => {
    try {
      await mongoose.connect(MONGO_URI);
      console.log(`✅  Connected to MongoDB: ${mongoose.connection.name}`);

      const stats = await runCatalogImport();

      console.log('\n📦  iGOT Catalog Import Complete:');
      console.log(`   • ${stats.imported} new courses imported`);
      console.log(`   • ${stats.updated} existing courses updated`);
      console.log(`   • ${stats.total} total records processed\n`);

      const sample = await Course.find().sort({ domain: 1, level: 1 }).lean();
      console.log('─'.repeat(95));
      console.log(
        'Code'.padEnd(18),
        'Title'.padEnd(38),
        'Provider'.padEnd(16),
        'Domain'.padEnd(22),
        'Lvl'
      );
      console.log('─'.repeat(95));
      for (const c of sample) {
        console.log(
          c.courseCode.padEnd(18),
          c.title.substring(0, 36).padEnd(38),
          c.provider.substring(0, 14).padEnd(16),
          c.domain.substring(0, 20).padEnd(22),
          String(c.level)
        );
      }
      console.log('─'.repeat(95));
    } catch (err) {
      console.error('❌  Import error:', err);
    } finally {
      await mongoose.disconnect();
      console.log('🔌  MongoDB connection closed');
    }
  })();
}
