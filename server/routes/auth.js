import express from 'express';
import crypto from 'crypto';
import User from '../models/User.js';

const router = express.Router();

const ALLOWED_ROLES = ['cso', 'nsso', 'admin'];

// Helper token generator
const generateToken = (user) => {
  const payload = `${user._id}:${user.email}:${Date.now()}`;
  return crypto.createHash('sha256').update(payload).digest('hex');
};

// POST /api/auth/register — Register new officer user
router.post('/register', async (req, res) => {
  try {
    const { name, fullName, email, password, designation, department, division, experience, role } = req.body;
    const userName = name || fullName;

    if (!userName || !email || !password || !designation || !department) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name (or fullName), email, password, designation, department',
      });
    }

    const selectedRole = (role || 'cso').toString().toLowerCase().trim();
    if (!ALLOWED_ROLES.includes(selectedRole)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role '${role}'. Role must be one of: cso, nsso, admin`,
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An officer account with this email address already exists.',
      });
    }

    const newUser = await User.create({
      name: userName,
      email: email.toLowerCase(),
      password, // Simple storage or hash
      designation,
      department,
      division: division || '',
      experience: experience || '0',
      role: selectedRole,
      competencyScore: 78,
    });

    const token = generateToken(newUser);

    const userObj = {
      id: newUser._id,
      name: newUser.name,
      fullName: newUser.name,
      email: newUser.email,
      designation: newUser.designation,
      department: newUser.department,
      division: newUser.division,
      experience: newUser.experience,
      role: newUser.role,
      competencyScore: newUser.competencyScore,
    };

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: userObj,
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration', error: err.message });
  }
});

// POST /api/auth/login — Authenticate officer user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter both email and password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Fallback demo users if database user not found
    if (!user) {
      const demoUsers = [
        {
          email: 'director@mospi.gov.in',
          password: 'Password123',
          name: 'Rahul Sharma',
          designation: 'Director',
          department: 'Central Statistics Office (CSO)',
          experience: '14',
          role: 'cso',
          competencyScore: 89,
        },
        {
          email: 'statistical.officer@mospi.gov.in',
          password: 'Password123',
          name: 'Rajesh Kumar',
          designation: 'Statistical Officer',
          department: 'National Sample Survey Office (NSSO)',
          experience: '8',
          role: 'nsso',
          competencyScore: 78,
        },
        {
          email: 'admin@mospi.gov.in',
          password: 'Password123',
          name: 'Amitabh Sen',
          designation: 'System Analyst',
          department: 'Administration & IT',
          experience: '10',
          role: 'admin',
          competencyScore: 82,
        },
      ];

      const demo = demoUsers.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (demo) {
        const token = crypto.createHash('sha256').update(`${demo.email}:${Date.now()}`).digest('hex');
        return res.json({
          success: true,
          message: 'Login successful (Demo Officer Account)',
          token,
          user: {
            id: 'demo-' + demo.role,
            name: demo.name,
            fullName: demo.name,
            email: demo.email,
            designation: demo.designation,
            department: demo.department,
            experience: demo.experience,
            role: demo.role,
            competencyScore: demo.competencyScore,
          },
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Check email and password.',
      });
    }

    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Password incorrect.',
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        fullName: user.name,
        email: user.email,
        designation: user.designation,
        department: user.department,
        division: user.division || '',
        experience: user.experience,
        role: user.role,
        competencyScore: user.competencyScore,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login', error: err.message });
  }
});

// GET /api/auth/me — Return currently authenticated user profile & role
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const userIdHeader = req.headers['x-user-id'];

    if (!authHeader && !userIdHeader) {
      return res.status(401).json({ success: false, message: 'No authorization token provided' });
    }

    // Try finding by user ID header first if present
    if (userIdHeader) {
      if (userIdHeader.startsWith('demo-')) {
        const demoRole = userIdHeader.replace('demo-', '');
        return res.json({
          success: true,
          user: {
            id: userIdHeader,
            name: demoRole.toUpperCase() + ' Officer',
            fullName: demoRole.toUpperCase() + ' Officer',
            email: `${demoRole}@mospi.gov.in`,
            role: demoRole,
            designation: demoRole.toUpperCase() + ' Lead',
            department: 'MoSPI Wing',
            division: 'Field Operations Division',
          },
        });
      }

      const user = await User.findById(userIdHeader);
      if (user) {
        return res.json({
          success: true,
          user: {
            id: user._id,
            name: user.name,
            fullName: user.name,
            email: user.email,
            designation: user.designation,
            department: user.department,
            division: user.division || '',
            experience: user.experience,
            role: user.role,
            competencyScore: user.competencyScore,
          },
        });
      }
    }

    // Fallback: return the first user or default error
    return res.status(401).json({ success: false, message: 'Invalid token or user not found' });
  } catch (err) {
    console.error('Auth /me error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching user profile', error: err.message });
  }
});

export default router;
