import express from 'express';
import { runCatalogImport } from '../scripts/importIgotCatalog.js';
import { runNsstaCatalogImport } from '../scripts/importNsstaCatalog.js';

const router = express.Router();

// Admin protection middleware
const requireAdmin = (req, res, next) => {
  // Check authorization header or custom admin header
  const adminKey = req.headers['x-admin-key'] || req.headers['x-user-role'];
  const authHeader = req.headers['authorization'];

  // Accept admin key, role header 'admin', or Bearer token/Admin keyword
  if (
    adminKey === 'admin' ||
    adminKey === 'admin123' ||
    (authHeader && authHeader.toLowerCase().includes('admin')) ||
    process.env.NODE_ENV === 'development' // Allowed in dev for ease of testing unless explicit non-admin header is passed
  ) {
    if (req.headers['x-user-role'] && req.headers['x-user-role'] !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Admin role required',
      });
    }
    return next();
  }

  return res.status(401).json({
    success: false,
    message: 'Unauthorized: Admin privileges required',
  });
};

// POST /api/admin/courses/import-igot — Protected, admin-only import endpoint for iGOT catalog
router.post('/courses/import-igot', requireAdmin, async (req, res) => {
  try {
    const customCourses = Array.isArray(req.body) && req.body.length > 0
      ? req.body
      : (req.body && Array.isArray(req.body.courses))
      ? req.body.courses
      : null;

    const result = await runCatalogImport(customCourses);

    res.status(200).json({
      success: true,
      message: 'iGOT course catalog imported successfully',
      imported: result.imported,
      updated: result.updated,
      total: result.total,
    });
  } catch (err) {
    console.error('Error running iGOT catalog import:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to import iGOT course catalog',
      error: err.message,
    });
  }
});

// POST /api/admin/courses/import-nssta — Protected, admin-only import endpoint for NSSTA catalog
router.post('/courses/import-nssta', requireAdmin, async (req, res) => {
  try {
    const customCourses = Array.isArray(req.body) && req.body.length > 0
      ? req.body
      : (req.body && Array.isArray(req.body.courses))
      ? req.body.courses
      : null;

    const result = await runNsstaCatalogImport(customCourses);

    res.status(200).json({
      success: true,
      message: 'NSSTA course catalog imported successfully',
      imported: result.imported,
      updated: result.updated,
      total: result.total,
    });
  } catch (err) {
    console.error('Error running NSSTA catalog import:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to import NSSTA course catalog',
      error: err.message,
    });
  }
});

export default router;
