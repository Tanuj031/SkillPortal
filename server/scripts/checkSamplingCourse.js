import connectDB from '../config/db.js';
import Course from '../models/Course.js';

async function checkCourses() {
  await connectDB();
  const samplingCourses = await Course.find({
    $or: [
      { title: { $regex: 'Sampling', $options: 'i' } },
      { skillTags: { $regex: 'Sampling', $options: 'i' } },
    ],
  }).lean();

  console.log('Courses matching Sampling:');
  samplingCourses.forEach((c) => {
    console.log(`- [${c.courseCode}] ${c.title} (Tags: ${c.skillTags.join(', ')})`);
  });

  process.exit(0);
}

checkCourses();
