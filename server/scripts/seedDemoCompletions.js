import connectDB from '../config/db.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import CourseCompletion from '../models/CourseCompletion.js';

export async function runDemoCompletionsSeed() {
  await connectDB();

  // 1. Find or create demo user "Rahul Sharma" / director@mospi.gov.in
  let user = await User.findOne({
    $or: [
      { email: 'director@mospi.gov.in' },
      { name: 'Rahul Sharma' },
      { fullName: 'Rahul Sharma' },
    ],
  });

  if (!user) {
    console.log('👤 Demo user not found, creating Rahul Sharma (director@mospi.gov.in)...');
    user = await User.create({
      name: 'Rahul Sharma',
      email: 'director@mospi.gov.in',
      password: 'Password123',
      designation: 'Director',
      department: 'Central Statistics Office (CSO)',
      competencyScore: 78,
      currentAssignment: 'Census Analysis Project',
    });
  }

  console.log(`✅ Using demo user: ${user.name} (${user._id})`);

  // 2. Target real courses from the Course collection (imported from nssta-catalog.json)
  const targetCourseCodes = ['NSSTA-STAT-005', 'NSSTA-TECH-005', 'NSSTA-DIGI-003'];
  const targetCourses = await Course.find({ courseCode: { $in: targetCourseCodes } });

  if (targetCourses.length === 0) {
    console.error('❌ No matching NSSTA courses found in database. Please run importNsstaCatalog.js first.');
    return { success: false, reason: 'No courses found' };
  }

  console.log(`📚 Found ${targetCourses.length} real NSSTA courses in Course collection:`);
  targetCourses.forEach((c) => console.log(`   - ${c.courseCode}: "${c.title}"`));

  // 3. Define completion details with realistic before/after competency levels
  const completionConfigs = [
    {
      courseCode: 'NSSTA-STAT-005',
      levelBefore: 2.0,
      levelAfter: 4.0,
      daysAgoStart: 14,
      daysAgoComplete: 7,
    },
    {
      courseCode: 'NSSTA-TECH-005',
      levelBefore: 2.5,
      levelAfter: 4.0,
      daysAgoStart: 20,
      daysAgoComplete: 10,
    },
    {
      courseCode: 'NSSTA-DIGI-003',
      levelBefore: 3.0,
      levelAfter: 4.0,
      daysAgoStart: 30,
      daysAgoComplete: 15,
    },
  ];

  let seededCount = 0;

  for (const config of completionConfigs) {
    const courseDoc = targetCourses.find(
      (c) => c.courseCode.toUpperCase() === config.courseCode.toUpperCase()
    );

    if (!courseDoc) {
      console.warn(`⚠️ Course code ${config.courseCode} not found in database, skipping.`);
      continue;
    }

    const now = new Date();
    const startedAt = new Date(now.getTime() - config.daysAgoStart * 24 * 60 * 60 * 1000);
    const completedAt = new Date(now.getTime() - config.daysAgoComplete * 24 * 60 * 60 * 1000);

    const completionDoc = {
      userId: user._id,
      courseId: courseDoc._id,
      status: 'completed',
      startedAt,
      completedAt,
      competencyLevelBefore: config.levelBefore,
      competencyLevelAfter: config.levelAfter,
    };

    await CourseCompletion.findOneAndUpdate(
      { userId: user._id, courseId: courseDoc._id },
      { $set: completionDoc },
      { upsert: true, new: true }
    );

    console.log(
      `🏆 Seeded completion for "${courseDoc.title}" (${courseDoc.courseCode}): Level ${config.levelBefore} → ${config.levelAfter}`
    );
    seededCount++;
  }

  console.log(`✨ Successfully seeded ${seededCount} CourseCompletion records for ${user.name}.`);

  return {
    success: true,
    userId: user._id,
    userEmail: user.email,
    seededCount,
  };
}

// Standalone CLI execution
if (process.argv[1] && process.argv[1].includes('seedDemoCompletions.js')) {
  (async () => {
    try {
      console.log('🚀 Running seedDemoCompletions.js...');
      await runDemoCompletionsSeed();
      process.exit(0);
    } catch (err) {
      console.error('❌ Error seeding demo completions:', err);
      process.exit(1);
    }
  })();
}
