import connectDB from '../config/db.js';
import CompetencyFramework from '../models/CompetencyFramework.js';

export const canonicalCompetencies = [
  // 1. Statistical Domain (10 skills)
  { domain: 'Statistical', skillName: 'Survey Design', description: 'NSSO survey protocols, questionnaire formulation, and sampling frame design', requiredLevel: 4 },
  { domain: 'Statistical', skillName: 'Sampling', description: 'Techniques for multi-stage stratified sampling and probability sample designs', requiredLevel: 4 },
  { domain: 'Statistical', skillName: 'National Accounts', description: 'GDP estimation, NAS frameworks, GVA calculation, and macroeconomic metrics', requiredLevel: 4 },
  { domain: 'Statistical', skillName: 'Price Statistics', description: 'Consumer Price Index (CPI), Wholesale Price Index (WPI), and inflation analytics', requiredLevel: 4 },
  { domain: 'Statistical', skillName: 'Labour Statistics', description: 'Periodic Labour Force Survey (PLFS) methodologies and employment metrics', requiredLevel: 4 },
  { domain: 'Statistical', skillName: 'Agricultural Statistics', description: 'Crop yield estimation, agricultural census methodology, and land use stats', requiredLevel: 4 },
  { domain: 'Statistical', skillName: 'Industrial Statistics', description: 'Annual Survey of Industries (ASI) and Index of Industrial Production (IIP)', requiredLevel: 4 },
  { domain: 'Statistical', skillName: 'SDG Indicators', description: 'National Indicator Framework (NIF) monitoring for UN Sustainable Development Goals', requiredLevel: 4 },
  { domain: 'Statistical', skillName: 'Metadata Standards', description: 'Data documentation, SDMX standards, and statistical microdata archiving', requiredLevel: 4 },
  { domain: 'Statistical', skillName: 'Data Quality Frameworks', description: 'Data validation, error auditing, and quality assurance in official statistics', requiredLevel: 4 },

  // 2. Technical Domain (12 skills)
  { domain: 'Technical', skillName: 'Python', description: 'Python programming for data manipulation, automation, and statistical analysis', requiredLevel: 4 },
  { domain: 'Technical', skillName: 'R', description: 'R statistical computing, econometric modeling, and data visualization', requiredLevel: 4 },
  { domain: 'Technical', skillName: 'SQL', description: 'Relational database querying, join optimizations, and data warehousing', requiredLevel: 4 },
  { domain: 'Technical', skillName: 'Stata', description: 'Statistical software for econometric analysis and survey microdata processing', requiredLevel: 4 },
  { domain: 'Technical', skillName: 'SPSS', description: 'Social science statistical package for survey data tabulation', requiredLevel: 4 },
  { domain: 'Technical', skillName: 'SAS', description: 'Enterprise statistical analytics system for large-scale census datasets', requiredLevel: 4 },
  { domain: 'Technical', skillName: 'GIS', description: 'Geospatial Information Systems for survey mapping and spatial data analysis', requiredLevel: 4 },
  { domain: 'Technical', skillName: 'Data Visualization', description: 'Interactive dashboard design using PowerBI, R Shiny, and Tableau', requiredLevel: 4 },
  { domain: 'Technical', skillName: 'AI/ML', description: 'Artificial intelligence algorithms and machine learning for predictive policy modeling', requiredLevel: 4 },
  { domain: 'Technical', skillName: 'Cloud Computing', description: 'Cloud infrastructure management, scalability, and cloud-native analytics', requiredLevel: 4 },
  { domain: 'Technical', skillName: 'APIs', description: 'RESTful API integration, web services, and automated data exchange protocols', requiredLevel: 4 },
  { domain: 'Technical', skillName: 'Open Data', description: 'Open Government Data (OGD) publishing, FAIR data principles, and data portals', requiredLevel: 4 },

  // 3. Digital Governance Domain (5 skills)
  { domain: 'Digital Governance', skillName: 'Cybersecurity', description: 'Information security principles, threat mitigation, and CERT-In compliance', requiredLevel: 4 },
  { domain: 'Digital Governance', skillName: 'Data Privacy', description: 'Digital Personal Data Protection Act compliance and citizen data privacy protocols', requiredLevel: 4 },
  { domain: 'Digital Governance', skillName: 'Digital Signatures', description: 'e-Sign, PKI infrastructure, and cryptographic document authentication', requiredLevel: 4 },
  { domain: 'Digital Governance', skillName: 'Government Cloud', description: 'MeitY MeghRaj cloud adoption, security clearance, and cloud migration', requiredLevel: 4 },
  { domain: 'Digital Governance', skillName: 'Digital Public Infrastructure', description: 'Aadhaar, DigiLocker, UPI, and India Stack integration for public service delivery', requiredLevel: 4 },

  // 4. Behavioural/Managerial Domain (6 skills)
  { domain: 'Behavioural/Managerial', skillName: 'Leadership', description: 'Strategic leadership, team vision, officer mentoring, and operational alignment', requiredLevel: 4 },
  { domain: 'Behavioural/Managerial', skillName: 'Communication', description: 'Official drafting, press releases, media briefings, and public communication', requiredLevel: 4 },
  { domain: 'Behavioural/Managerial', skillName: 'Project Management', description: 'Public sector program execution, budget tracking, and GFR procurement management', requiredLevel: 4 },
  { domain: 'Behavioural/Managerial', skillName: 'Ethics', description: 'Central Civil Services Conduct Rules, integrity, and anti-corruption standards', requiredLevel: 4 },
  { domain: 'Behavioural/Managerial', skillName: 'Decision Making', description: 'Evidence-based policy decisions, risk evaluation, and executive strategy', requiredLevel: 4 },
  { domain: 'Behavioural/Managerial', skillName: 'Change Management', description: 'Organizational transformation, digital workflow adoption, and stakeholder management', requiredLevel: 4 },
];

export async function seedCompetencyFramework() {
  await connectDB();
  await CompetencyFramework.deleteMany({});
  let count = 0;
  for (const comp of canonicalCompetencies) {
    await CompetencyFramework.create(comp);
    count++;
  }
  console.log(`✅ Seeded ${count} official PS taxonomy skills into CompetencyFramework collection.`);
  return count;
}

if (process.argv[1] && process.argv[1].includes('seedCompetencyFramework.js')) {
  (async () => {
    try {
      await seedCompetencyFramework();
      process.exit(0);
    } catch (err) {
      console.error('❌ Error seeding CompetencyFramework:', err);
      process.exit(1);
    }
  })();
}
