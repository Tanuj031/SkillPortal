import connectDB from '../config/db.js';
import User from '../models/User.js';

async function seedDemoUsers() {
  await connectDB();

  const demoUsers = [
    {
      name: 'Rahul Sharma',
      email: 'director@mospi.gov.in',
      password: 'Password123',
      designation: 'Director',
      department: 'Central Statistics Office (CSO)',
      division: 'National Accounts Division',
      experience: '14',
      role: 'cso',
      competencyScore: 89,
    },
    {
      name: 'Rajesh Kumar',
      email: 'statistical.officer@mospi.gov.in',
      password: 'Password123',
      designation: 'Statistical Officer',
      department: 'National Sample Survey Office (NSSO)',
      division: 'Field Operations Division',
      experience: '8',
      role: 'nsso',
      competencyScore: 78,
    },
    {
      name: 'Amitabh Sen',
      email: 'admin@mospi.gov.in',
      password: 'Password123',
      designation: 'System Analyst',
      department: 'Administration & IT',
      division: '',
      experience: '10',
      role: 'admin',
      competencyScore: 82,
    },
  ];

  for (const u of demoUsers) {
    const doc = await User.findOneAndUpdate(
      { email: u.email },
      { $set: u },
      { upsert: true, new: true }
    );
    console.log(`✅ Seeded/Updated User: ${doc.email} → Role: "${doc.role}" (ID: ${doc._id})`);
  }

  process.exit(0);
}

seedDemoUsers().catch(err => {
  console.error('Error seeding demo users:', err);
  process.exit(1);
});
