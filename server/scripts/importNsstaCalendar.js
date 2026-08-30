import connectDB from '../config/db.js';
import Course from '../models/Course.js';

const nsstaCatalogData = [
  {
    "title": "Survey Methodology and Data Analysis",
    "provider": "NSSTA",
    "courseCode": "NSSTA-STAT-001",
    "domain": "Statistical",
    "skillTags": ["Survey Methodology", "Data Interpretation"],
    "duration": "5 days",
    "level": 3,
    "source": "MoSPI NSSTA Advance Training Calendar FY2025-26"
  },
  {
    "title": "Sampling Techniques & Large Scale Sample Surveys",
    "provider": "NSSTA",
    "courseCode": "NSSTA-STAT-002",
    "domain": "Statistical",
    "skillTags": ["Survey Methodology", "Statistical Reasoning"],
    "duration": "5 days",
    "level": 4,
    "source": "MoSPI NSSTA Advance Training Calendar FY2025-26"
  },
  {
    "title": "Time Series and Applied Econometrics",
    "provider": "NSSTA",
    "courseCode": "NSSTA-STAT-003",
    "domain": "Statistical",
    "skillTags": ["Statistical Analysis", "Statistical Reasoning"],
    "duration": "5 days",
    "level": 4,
    "source": "MoSPI NSSTA Advance Training Calendar FY2025-26"
  },
  {
    "title": "National Accounts Statistics",
    "provider": "NSSTA",
    "courseCode": "NSSTA-STAT-004",
    "domain": "Statistical",
    "skillTags": ["Data Interpretation", "Statistical Analysis"],
    "duration": "5 days",
    "level": 3,
    "source": "MoSPI NSSTA Advance Training Calendar FY2025-26"
  },
  {
    "title": "Data Analysis, its Interpretation and Visualization using R",
    "provider": "NSSTA",
    "courseCode": "NSSTA-STAT-005",
    "domain": "Statistical",
    "skillTags": ["Data Interpretation", "Statistical Software"],
    "duration": "5 days",
    "level": 3,
    "source": "MoSPI NSSTA Advance Training Calendar FY2025-26"
  },
  {
    "title": "Poverty & Inequality Estimation",
    "provider": "NSSTA",
    "courseCode": "NSSTA-STAT-006",
    "domain": "Statistical",
    "skillTags": ["Statistical Analysis", "Data Interpretation"],
    "duration": "5 days",
    "level": 4,
    "source": "MoSPI NSSTA Advance Training Calendar FY2025-26"
  },
  {
    "title": "Big Data, Data Mining, Data Warehousing, Data Analytics, AI, Python, Hadoop",
    "provider": "NSSTA",
    "courseCode": "NSSTA-TECH-001",
    "domain": "Technical",
    "skillTags": ["Data Analytics", "Programming"],
    "duration": "5 days",
    "level": 4,
    "source": "MoSPI NSSTA Advance Training Calendar FY2025-26"
  },
  {
    "title": "Foundation Course on Machine Learning using Python",
    "provider": "NSSTA",
    "courseCode": "NSSTA-TECH-002",
    "domain": "Technical",
    "skillTags": ["Programming", "Data Analytics"],
    "duration": "5 days",
    "level": 3,
    "source": "MoSPI NSSTA Advance Training Calendar FY2025-26"
  },
  {
    "title": "Foundation Course on Artificial Intelligence and Big Data",
    "provider": "NSSTA",
    "courseCode": "NSSTA-TECH-003",
    "domain": "Technical",
    "skillTags": ["Data Analytics", "Database Management"],
    "duration": "5 days",
    "level": 4,
    "source": "MoSPI NSSTA Advance Training Calendar FY2025-26"
  },
  {
    "title": "Big Data, Artificial Intelligence with Python, ML",
    "provider": "NSSTA",
    "courseCode": "NSSTA-TECH-004",
    "domain": "Technical",
    "skillTags": ["Programming", "Data Analytics"],
    "duration": "5 days",
    "level": 4,
    "source": "MoSPI NSSTA Advance Training Calendar FY2025-26"
  },
  {
    "title": "Advance IT, Data Visualization",
    "provider": "NSSTA",
    "courseCode": "NSSTA-TECH-005",
    "domain": "Technical",
    "skillTags": ["Statistical Software", "Data Analytics"],
    "duration": "5 days",
    "level": 3,
    "source": "MoSPI NSSTA Advance Training Calendar FY2025-26"
  },
  {
    "title": "Technological Skills: Basic & Advance IT including NSS Data Extraction",
    "provider": "NSSTA",
    "courseCode": "NSSTA-DIGI-001",
    "domain": "Digital Governance",
    "skillTags": ["Digital Tools", "Technology Adoption"],
    "duration": "5 days",
    "level": 2,
    "source": "MoSPI NSSTA Advance Training Calendar FY2025-26"
  },
  {
    "title": "e-Office with Special Emphasis on Hands-on Practice",
    "provider": "NSSTA",
    "courseCode": "NSSTA-DIGI-002",
    "domain": "Digital Governance",
    "skillTags": ["Digital Tools", "Digital Governance"],
    "duration": "5 days",
    "level": 2,
    "source": "MoSPI NSSTA Advance Training Calendar FY2025-26"
  },
  {
    "title": "Cyber Security",
    "provider": "NSSTA",
    "courseCode": "NSSTA-DIGI-003",
    "domain": "Digital Governance",
    "skillTags": ["Data Security"],
    "duration": "0.5 days",
    "level": 2,
    "source": "MoSPI NSSTA Advance Training Calendar FY2025-26"
  },
  {
    "title": "Overview of Big Data & AI/ML",
    "provider": "NSSTA",
    "courseCode": "NSSTA-DIGI-004",
    "domain": "Digital Governance",
    "skillTags": ["Technology Adoption", "Digital Tools"],
    "duration": "0.5 days",
    "level": 2,
    "source": "MoSPI NSSTA Advance Training Calendar FY2025-26"
  },
  {
    "title": "Application of GIS, Forest Statistics & Data Tools",
    "provider": "NSSTA",
    "courseCode": "NSSTA-DIGI-005",
    "domain": "Digital Governance",
    "skillTags": ["Digital Tools"],
    "duration": "5 days",
    "level": 3,
    "source": "MoSPI NSSTA Advance Training Calendar FY2025-26"
  },
  {
    "title": "Leadership and Management Training Programme",
    "provider": "NSSTA",
    "courseCode": "NSSTA-BEH-001",
    "domain": "Behavioural/Managerial",
    "skillTags": ["Leadership"],
    "duration": "5 days",
    "level": 3,
    "source": "MoSPI NSSTA Advance Training Calendar FY2025-26"
  },
  {
    "title": "Communication & Presentation Skills",
    "provider": "NSSTA",
    "courseCode": "NSSTA-BEH-002",
    "domain": "Behavioural/Managerial",
    "skillTags": ["Communication"],
    "duration": "5 days",
    "level": 2,
    "source": "MoSPI NSSTA Advance Training Calendar FY2025-26"
  },
  {
    "title": "Team Building and Leadership through Adventure Sports Activities",
    "provider": "NSSTA",
    "courseCode": "NSSTA-BEH-003",
    "domain": "Behavioural/Managerial",
    "skillTags": ["Leadership", "Teamwork"],
    "duration": "5 days",
    "level": 2,
    "source": "MoSPI NSSTA Advance Training Calendar FY2025-26"
  },
  {
    "title": "Soft Skills, Personality Development & Professional Excellence",
    "provider": "NSSTA",
    "courseCode": "NSSTA-BEH-004",
    "domain": "Behavioural/Managerial",
    "skillTags": ["Communication", "Teamwork"],
    "duration": "5 days",
    "level": 2,
    "source": "MoSPI NSSTA Advance Training Calendar FY2025-26"
  },
  {
    "title": "Monitoring & Evaluation",
    "provider": "NSSTA",
    "courseCode": "NSSTA-BEH-005",
    "domain": "Behavioural/Managerial",
    "skillTags": ["Problem Solving"],
    "duration": "5 days",
    "level": 3,
    "source": "MoSPI NSSTA Advance Training Calendar FY2025-26"
  },
  {
    "title": "Design, Evaluation and Execution of Projects",
    "provider": "NSSTA",
    "courseCode": "NSSTA-BEH-006",
    "domain": "Behavioural/Managerial",
    "skillTags": ["Problem Solving", "Leadership"],
    "duration": "5 days",
    "level": 4,
    "source": "MoSPI NSSTA Advance Training Calendar FY2025-26"
  },
  {
    "title": "Ethics, Data Governance and Integrity in Public Service",
    "provider": "NSSTA",
    "courseCode": "NSSTA-DIGI-006",
    "domain": "Digital Governance",
    "skillTags": ["Data Security", "Digital Governance"],
    "duration": "5 days",
    "level": 2,
    "source": "MoSPI NSSTA Advance Training Calendar FY2025-26"
  },
  {
    "title": "Statistical Literacy and Storytelling",
    "provider": "NSSTA",
    "courseCode": "NSSTA-STAT-007",
    "domain": "Statistical",
    "skillTags": ["Data Interpretation", "Statistical Reasoning"],
    "duration": "5 days",
    "level": 2,
    "source": "MoSPI NSSTA Advance Training Calendar FY2025-26"
  }
];

/**
 * Upserts NSSTA Training Calendar records into Course collection
 */
export async function runNsstaCalendarImport(customRecords = null) {
  const recordsToImport = Array.isArray(customRecords) && customRecords.length > 0
    ? customRecords
    : nsstaCatalogData;

  let importedCount = 0;
  let updatedCount = 0;

  for (const item of recordsToImport) {
    const courseDoc = {
      title: item.title,
      provider: item.provider || 'NSSTA',
      courseCode: item.courseCode.toUpperCase(),
      domain: item.domain,
      skillTags: item.skillTags || [],
      duration: item.duration || '5 days',
      level: item.level || 3,
      isActive: true,
      source: item.source || 'MoSPI NSSTA Advance Training Calendar FY2025-26',
    };

    const existing = await Course.findOne({ courseCode: courseDoc.courseCode });

    if (existing) {
      await Course.updateOne({ courseCode: courseDoc.courseCode }, { $set: courseDoc });
      updatedCount++;
    } else {
      await Course.create(courseDoc);
      importedCount++;
    }
  }

  return {
    success: true,
    imported: importedCount,
    updated: updatedCount,
    total: recordsToImport.length,
  };
}

// Allow standalone execution via CLI
if (process.argv[1] && process.argv[1].includes('importNsstaCalendar.js')) {
  (async () => {
    try {
      console.log('📦  Connecting to MongoDB for NSSTA Training Calendar Import...');
      await connectDB();

      console.log('⏳  Importing MoSPI NSSTA Advance Training Calendar (FY 2025-26)...');
      const stats = await runNsstaCalendarImport();

      console.log(`✅  NSSTA Calendar Import Completed successfully!`);
      console.log(`    Imported (New): ${stats.imported}`);
      console.log(`    Updated:        ${stats.updated}`);
      console.log(`    Total Courses:  ${stats.total}`);

      process.exit(0);
    } catch (err) {
      console.error('❌  NSSTA Calendar Import Failed:', err);
      process.exit(1);
    }
  })();
}
