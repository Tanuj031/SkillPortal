import User from '../models/User.js';
import Course from '../models/Course.js';
import UserCompetencyProfile from '../models/UserCompetencyProfile.js';
import CompetencyFramework from '../models/CompetencyFramework.js';
import RoleCompetencyRequirement from '../models/RoleCompetencyRequirement.js';

export function resolveDivisionRequiredLevel(skillName, domain, role = 'cso', division = '', baseLevel = 4) {
  const normRole = (role || 'cso').toLowerCase();
  const normDiv = (division || '').trim();

  // NSSO Field Operations Division Focus: High Survey Design, Sampling, Data Collection (Level 5)
  if (normRole === 'nsso' && normDiv.includes('Field Operations')) {
    if (skillName.includes('Survey Design') || skillName.includes('Data Collection') || skillName.includes('Sampling')) {
      return 5;
    }
    if (['Python', 'R', 'SQL', 'Data Visualization', 'AI/ML'].includes(skillName)) {
      return 2;
    }
  }

  // NSSO Data Processing Division Focus: High Python, R, SQL, Data Visualization (Level 5)
  if (normRole === 'nsso' && normDiv.includes('Data Processing')) {
    if (['Python', 'R', 'SQL', 'Data Visualization', 'Data Quality Frameworks'].includes(skillName)) {
      return 5;
    }
    if (skillName.includes('Survey Design') || skillName.includes('Sampling') || skillName.includes('Data Collection')) {
      return 2;
    }
  }

  // CSO National Accounts Division Focus: High National Accounts & Price Statistics (Level 5)
  if (normRole === 'cso' && normDiv.includes('National Accounts')) {
    if (skillName.includes('National Accounts') || skillName.includes('Price Statistics')) {
      return 5;
    }
  }

  return baseLevel;
}

/**
 * Dynamic Skill Gap Analysis Engine
 * Calculates gap = requiredLevel (from RoleCompetencyRequirement by user role & division) - currentLevel (from UserCompetencyProfile)
 * assigns severity (HIGH if gap >= 2, MEDIUM if gap >= 1, LOW if gap <= 0),
 * and matches real NSSTA course from Course database collection via skillTags.
 * @param {String} userId - Target User ID
 */
export async function calculateUserSkillGaps(userId) {
  try {
    const user = await User.findById(userId).lean();
    const designation = user?.designation || 'Director';
    const role = (user?.role || 'cso').toLowerCase();
    const division = user?.division || '';

    const userProfile = await UserCompetencyProfile.findOne({ userId }).lean();
    const allCompetencies = await CompetencyFramework.find({ isActive: true }).lean();
    const roleRequirements = await RoleCompetencyRequirement.find({
      $or: [
        { role, division },
        { role, division: '' },
        { designation }
      ]
    }).lean();
    const allCourses = await Course.find({ isActive: true }).lean();

    const roleReqMap = {};
    roleRequirements.forEach((req) => {
      roleReqMap[req.skillName] = req.requiredLevel;
      if (req.skillId) roleReqMap[req.skillId.toString()] = req.requiredLevel;
    });

    const userRatingsMap = {};
    if (userProfile && Array.isArray(userProfile.competencies)) {
      userProfile.competencies.forEach((c) => {
        if (c.skillName) userRatingsMap[c.skillName] = Number(c.level);
        if (c.competencyId) userRatingsMap[c.competencyId.toString()] = Number(c.level);
      });
    }

    const gaps = allCompetencies.map((comp) => {
      const skillName = comp.skillName;
      const compIdStr = comp._id.toString();

      const currentLevel =
        userRatingsMap[skillName] !== undefined
          ? userRatingsMap[skillName]
          : userRatingsMap[compIdStr] !== undefined
          ? userRatingsMap[compIdStr]
          : 2.0;

      // Check DB requirement map first, then factor in division override logic
      const dbRequired =
        roleReqMap[skillName] !== undefined
          ? roleReqMap[skillName]
          : roleReqMap[compIdStr] !== undefined
          ? roleReqMap[compIdStr]
          : comp.requiredLevel || 4.0;

      const requiredLevel = resolveDivisionRequiredLevel(
        skillName,
        comp.domain,
        role,
        division,
        dbRequired
      );

      const gap = Number((requiredLevel - currentLevel).toFixed(1));

      let severity = 'LOW';
      if (gap >= 2.0) {
        severity = 'HIGH';
      } else if (gap >= 1.0) {
        severity = 'MEDIUM';
      } else {
        severity = 'LOW';
      }

      // Prioritize exact skillTag match, then partial match, then title match, then domain match
      const matchingCourse =
        allCourses.find(
          (course) =>
            course.skillTags &&
            course.skillTags.some(
              (tag) => tag.toLowerCase() === skillName.toLowerCase()
            )
        ) ||
        allCourses.find(
          (course) =>
            course.skillTags &&
            course.skillTags.some(
              (tag) =>
                tag.toLowerCase().includes(skillName.toLowerCase()) ||
                skillName.toLowerCase().includes(tag.toLowerCase())
            )
        ) ||
        allCourses.find((c) =>
          c.title.toLowerCase().includes(skillName.toLowerCase())
        ) ||
        allCourses.find((c) => c.domain === comp.domain) ||
        allCourses[0];

      const recommendedCourse = matchingCourse
        ? {
            id: matchingCourse._id,
            courseCode: matchingCourse.courseCode,
            title: matchingCourse.title,
            provider: matchingCourse.provider,
            domain: matchingCourse.domain,
          }
        : null;

      return {
        skillId: comp._id,
        skillName,
        domain: comp.domain,
        designation,
        currentLevel,
        requiredLevel,
        gap,
        severity,
        recommendedCourse,
        recommendedCourseTitle: matchingCourse
          ? `${matchingCourse.courseCode}: ${matchingCourse.title}`
          : 'NSSTA-STAT-002: Sampling Techniques & Large Scale Sample Surveys',
      };
    });

    const gappedSkills = gaps.filter((g) => g.gap > 0);

    return {
      userId,
      designation,
      totalGapsCount: gappedSkills.length > 0 ? gappedSkills.length : gaps.length,
      highSeverityCount: gaps.filter((g) => g.severity === 'HIGH').length,
      mediumSeverityCount: gaps.filter((g) => g.severity === 'MEDIUM').length,
      gaps: gappedSkills.length > 0 ? gappedSkills : gaps,
    };
  } catch (err) {
    console.error('Error in calculateUserSkillGaps:', err);
    throw err;
  }
}
