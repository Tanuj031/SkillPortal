import { createRequire } from 'module';
import Course from '../models/Course.js';
import User from '../models/User.js';

const require = createRequire(import.meta.url);
const assignmentSkillMap = require('../data/assignmentSkillMap.json');

// Known competency gap profiles mapping skills to current/required levels and severity
const skillGapDefinitions = {
  'Data Visualization': { current: 2, required: 4, severity: 'HIGH' },
  'Statistical Sampling': { current: 2.5, required: 4, severity: 'MEDIUM' },
  'Policy Analysis': { current: 3, required: 4, severity: 'MODERATE' },
  'Regression Modeling': { current: 2, required: 4, severity: 'HIGH' },
  'Cybersecurity': { current: 3, required: 4, severity: 'MODERATE' },
  'Data Analysis': { current: 2.5, required: 4, severity: 'MEDIUM' },
  'Public Policy': { current: 3, required: 4, severity: 'MODERATE' },
  'DPDP Act': { current: 2, required: 4, severity: 'HIGH' },
};

/**
 * Extracts mapped skill tags from an assignment string by keyword matching
 * @param {String} assignmentText - e.g. "Census Analysis Project"
 * @returns {Set<String>} Set of mapped skill tags
 */
export function getMappedSkillsForAssignment(assignmentText) {
  if (!assignmentText || typeof assignmentText !== 'string') {
    return new Set();
  }

  const textLower = assignmentText.toLowerCase();
  const mappedSkills = new Set();

  for (const [keyword, skills] of Object.entries(assignmentSkillMap)) {
    if (textLower.includes(keyword)) {
      skills.forEach((s) => mappedSkills.add(s));
    }
  }

  return mappedSkills;
}

/**
 * Ranks courses by primary skill-gap match and secondary assignment relevance boost, generating a detailed reason string
 * @param {String} userId - User ID
 * @param {String} assignmentOverride - Optional assignment string override
 */
export async function getRecommendedCourses(userId, assignmentOverride = null) {
  let currentAssignment = assignmentOverride;

  if (!currentAssignment && userId) {
    const user = await User.findById(userId).lean();
    if (user) {
      currentAssignment = user.currentAssignment || '';
    }
  }

  const mappedAssignmentSkills = getMappedSkillsForAssignment(currentAssignment || '');
  const allCourses = await Course.find({ isActive: true }).lean();

  const rankedCourses = allCourses.map((course) => {
    let gapScore = 50; // Base score

    // Find matched skill gaps for this course
    const matchedSkills = course.skillTags.filter((tag) =>
      Object.keys(skillGapDefinitions).some((gapSkill) => gapSkill.toLowerCase() === tag.toLowerCase())
    );

    const primaryMatchedSkill = matchedSkills.length > 0 ? matchedSkills[0] : course.skillTags[0] || course.domain;
    const gapInfo = skillGapDefinitions[primaryMatchedSkill] || { current: 2.5, required: 4, severity: 'MEDIUM' };

    if (matchedSkills.length > 0) {
      gapScore += 30; // High gap match boost
    }

    let assignmentBoost = 0;
    let isAssignmentMatch = false;

    if (mappedAssignmentSkills.size > 0) {
      const hasAssignmentOverlap = course.skillTags.some((tag) =>
        Array.from(mappedAssignmentSkills).some(
          (mappedSkill) => mappedSkill.toLowerCase() === tag.toLowerCase()
        )
      );

      if (hasAssignmentOverlap) {
        assignmentBoost = 20; // Secondary assignment relevance boost
        isAssignmentMatch = true;
      }
    }

    const finalScore = gapScore + assignmentBoost;

    // Construct clear recommendation reason string
    let reason = `Recommended because of a ${gapInfo.severity} gap in ${primaryMatchedSkill} (${gapInfo.current}/5 → required ${gapInfo.required}/5)`;
    if (isAssignmentMatch && currentAssignment) {
      reason += `, relevant to your ${currentAssignment} work.`;
    } else {
      reason += `.`;
    }

    return {
      ...course,
      matchedSkills: matchedSkills.length > 0 ? matchedSkills : [primaryMatchedSkill],
      gapSeverity: gapInfo.severity,
      recommendationScore: finalScore,
      gapScore,
      assignmentBoost,
      isAssignmentMatch,
      reason,
    };
  });

  // Sort descending by final recommendation score, then by level
  rankedCourses.sort((a, b) => b.recommendationScore - a.recommendationScore || b.level - a.level);

  return {
    userId,
    currentAssignment: currentAssignment || 'None',
    matchedAssignmentSkills: Array.from(mappedAssignmentSkills),
    totalCount: rankedCourses.length,
    recommendations: rankedCourses,
  };
}
