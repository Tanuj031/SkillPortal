import connectDB from '../config/db.js';
import CompetencyFramework from '../models/CompetencyFramework.js';
import RoleCompetencyRequirement from '../models/RoleCompetencyRequirement.js';

export async function seedRoleCompetencyRequirements() {
  await connectDB();
  await RoleCompetencyRequirement.deleteMany({});

  const allSkills = await CompetencyFramework.find({}).lean();
  if (allSkills.length === 0) {
    throw new Error('No CompetencyFramework skills found. Run seedCompetencyFramework.js first.');
  }

  const designations = ['Director', 'Deputy Director', 'Statistical Officer', 'Data Entry Operator'];
  let count = 0;

  for (const skill of allSkills) {
    for (const designation of designations) {
      let requiredLevel = 3;

      if (designation === 'Director') {
        if (skill.domain === 'Behavioural/Managerial' || skill.skillName === 'Sampling' || skill.skillName === 'Survey Design' || skill.skillName === 'National Accounts') {
          requiredLevel = 5;
        } else {
          requiredLevel = 4;
        }
      } else if (designation === 'Deputy Director') {
        if (skill.domain === 'Statistical' || skill.domain === 'Technical') {
          requiredLevel = 4;
        } else {
          requiredLevel = 3;
        }
      } else if (designation === 'Statistical Officer') {
        if (skill.domain === 'Statistical') {
          requiredLevel = 3;
        } else if (skill.domain === 'Technical') {
          requiredLevel = 3;
        } else {
          requiredLevel = 2;
        }
      } else if (designation === 'Data Entry Operator') {
        if (skill.skillName === 'Data Processing' || skill.skillName === 'SQL' || skill.skillName === 'Python') {
          requiredLevel = 3;
        } else {
          requiredLevel = 2;
        }
      }

      await RoleCompetencyRequirement.create({
        designation,
        skillId: skill._id,
        skillName: skill.skillName,
        domain: skill.domain,
        requiredLevel,
      });

      count++;
    }
  }

  console.log(`✅ Seeded ${count} role competency requirement rules across ${designations.length} designations.`);
  return count;
}

if (process.argv[1] && process.argv[1].includes('seedRoleCompetencyRequirements.js')) {
  (async () => {
    try {
      await seedRoleCompetencyRequirements();
      process.exit(0);
    } catch (err) {
      console.error('❌ Error seeding RoleCompetencyRequirements:', err);
      process.exit(1);
    }
  })();
}
