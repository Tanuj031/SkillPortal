import connectDB from '../config/db.js';
import Course from '../models/Course.js';

async function updateSamplingCourse() {
  await connectDB();
  const course = await Course.findOneAndUpdate(
    { courseCode: 'NSSTA-STAT-002' },
    { $addToSet: { skillTags: 'Sampling' } },
    { new: true }
  );

  console.log('✅ Updated NSSTA-STAT-002:', {
    code: course.courseCode,
    title: course.title,
    skillTags: course.skillTags,
  });

  process.exit(0);
}

updateSamplingCourse();
