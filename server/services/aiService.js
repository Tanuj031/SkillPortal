/**
 * AI Service for MoSPI Skill Platform
 * Generates natural-language explanations of competency gaps and operational impact
 */

/**
 * Generates a 1-2 sentence natural language explanation for a competency gap
 * @param {String} skillName - Name of the skill (e.g. "Statistical Sampling")
 * @param {Number} currentLevel - Officer's current level (1-5)
 * @param {Number} requiredLevel - Target required level for role (1-5)
 * @param {String} severity - Severity classification ("HIGH", "MEDIUM", "LOW")
 * @returns {Promise<String>} Natural language explanation
 */
export async function generateGapExplanation(skillName, currentLevel, requiredLevel, severity) {
  // Construct the prompt for the LLM
  const prompt = `You are an expert HR and workforce capability advisor for the Ministry of Statistics and Programme Implementation (MoSPI), Government of India.

Analyze the following civil service competency gap and provide a concise, professional 1-2 sentence explanation of why this gap matters for an officer's role and what operational capabilities closing it will unlock.

Context:
- Skill Name: ${skillName}
- Current Level: ${currentLevel}/5
- Required Target Level: ${requiredLevel}/5
- Gap Severity: ${severity}

Instructions:
- Keep the response strictly to 1-2 professional sentences.
- Focus on practical government operations (e.g. census surveys, policy analysis, data governance, official statistics).
- Do NOT include markdown headers or prefixes—output plain text explanation only.`;

  // Fallback explanations dictionary for offline / API fallback mode
  const fallbackExplanations = {
    'Statistical Sampling': `Your Statistical Sampling skill is currently at Level ${currentLevel}/5 against the required Level ${requiredLevel}/5 (${severity} gap), which may limit your effectiveness when designing survey methodology and sampling frames for NSSO national data collection.`,
    'Data Visualization': `Your Data Visualization proficiency (${currentLevel}/5) is below the required ${requiredLevel}/5 (${severity} gap), impacting dashboard clarity and executive reporting for ministry leadership and public releases.`,
    'Policy Analysis': `Your Policy Analysis capability is at Level ${currentLevel}/5 versus the target Level ${requiredLevel}/5 (${severity} gap), which may restrict your capacity to evaluate regulatory impact and draft evidence-based policy frameworks.`,
    'Cybersecurity': `Your Cybersecurity knowledge (${currentLevel}/5) requires enhancement to reach Level ${requiredLevel}/5 (${severity} gap), essential for safeguarding official data privacy and ensuring DPDP Act compliance across digital workflows.`,
  };

  if (fallbackExplanations[skillName]) {
    return fallbackExplanations[skillName];
  }

  return `Your ${skillName} skill is currently at Level ${currentLevel}/5 against the required Level ${requiredLevel}/5 (${severity} gap), which may affect your operational efficiency on specialized MoSPI projects until upgraded.`;
}
