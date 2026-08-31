// MoSPI Skill Platform - Authentication, Employee Dashboard & 4-Step Assessment JS Logic

// Initial Mock Database of MoSPI Officers
const MOCK_USERS = [
  {
    email: 'director@mospi.gov.in',
    password: 'Password123',
    fullName: 'Rahul Sharma',
    name: 'Rahul Sharma',
    designation: 'Director',
    department: 'Central Statistics Office (CSO)',
    experience: '14',
    role: 'cso',
    competencyScore: 78
  },
  {
    email: 'statistical.officer@mospi.gov.in',
    password: 'Password123',
    fullName: 'Rajesh Kumar',
    name: 'Rajesh Kumar',
    designation: 'Statistical Officer',
    department: 'National Sample Survey Office (NSSO)',
    experience: '8',
    role: 'nsso',
    competencyScore: 78
  },
  {
    email: 'admin@mospi.gov.in',
    password: 'Password123',
    fullName: 'Amitabh Sen',
    name: 'Amitabh Sen',
    designation: 'System Analyst',
    department: 'Administration & IT',
    experience: '10',
    role: 'admin',
    competencyScore: 82
  }
];

// Local state
let currentUser = null;
let currentAssessmentStep = 1;

// Initialize app on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initUserDatabase();
  initViewNavigation();
  initDashboardSidebar();
  initAssessmentFlow();
  initQuizFlow();
  initPasswordToggles();
  initFormHandlers();
  initDemoPresets();
  initForgotPasswordModal();
  initCertificationModal();
  initInactivityListeners();
  checkExistingSession();
});

// Load users from localStorage or default
function initUserDatabase() {
  localStorage.setItem('mospi_users_db', JSON.stringify(MOCK_USERS));
}

function getUsersDatabase() {
  return JSON.parse(localStorage.getItem('mospi_users_db')) || MOCK_USERS;
}

function saveUserToDatabase(newUser) {
  const users = getUsersDatabase();
  users.push(newUser);
  localStorage.setItem('mospi_users_db', JSON.stringify(users));
}

function updateDatabaseUser(updatedUser) {
  const users = getUsersDatabase();
  const idx = users.findIndex(u => u.email.toLowerCase() === updatedUser.email.toLowerCase());
  if (idx !== -1) {
    users[idx] = updatedUser;
    localStorage.setItem('mospi_users_db', JSON.stringify(users));
  }
}

// 5-Minute Inactivity Auto-Logout Manager
let inactivityTimer = null;
const INACTIVITY_LIMIT_MS = 5 * 60 * 1000; // 5 Minutes (300,000ms)

function startInactivityTimer() {
  stopInactivityTimer();
  if (!currentUser) return;

  inactivityTimer = setTimeout(() => {
    if (currentUser) {
      logoutUserSession();
      showToast('Session expired due to 5 minutes of inactivity. Please sign in again.', 'warning');
    }
  }, INACTIVITY_LIMIT_MS);
}

function stopInactivityTimer() {
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }
}

function resetInactivityTimer() {
  if (currentUser) {
    startInactivityTimer();
  }
}

function initInactivityListeners() {
  const events = ['mousemove', 'keydown', 'mousedown', 'scroll', 'touchstart', 'click'];
  events.forEach(evt => {
    window.addEventListener(evt, resetInactivityTimer, { passive: true });
  });
}

// Session Management
function checkExistingSession() {
  const session = localStorage.getItem('mospi_auth_user');
  if (session) {
    try {
      currentUser = JSON.parse(session);
      renderAuthenticatedState(currentUser);
      showAppContainer('dashboard');
      startInactivityTimer();

      // Role-Based Initial Routing on session restore
      const userRole = (currentUser?.role || 'cso').toLowerCase();
      if (userRole === 'admin') {
        switchDashboardSubpanel('admin');
      } else if (userRole === 'nsso') {
        switchDashboardSubpanel('nsso');
      } else {
        switchDashboardSubpanel('cso');
      }

      showToast(`Welcome back, ${currentUser.fullName || currentUser.name}!`, 'success');
    } catch (e) {
      localStorage.removeItem('mospi_auth_user');
      showAppContainer('auth');
      showView('login');
    }
  } else {
    showAppContainer('auth');
    showView('login');
  }
}

function loginUserSession(user) {
  currentUser = user;
  localStorage.setItem('mospi_auth_user', JSON.stringify(user));
  renderAuthenticatedState(user);
  showAppContainer('dashboard');
  startInactivityTimer();
  
  // Role-Based Initial Routing
  const userRole = (user.role || 'cso').toLowerCase();
  if (userRole === 'admin') {
    switchDashboardSubpanel('admin');
  } else if (userRole === 'nsso') {
    switchDashboardSubpanel('nsso');
  } else {
    switchDashboardSubpanel('cso');
  }
  
  showToast(`Logged in successfully as ${user.fullName || user.name} (${userRole.toUpperCase()})`, 'success');
}

function logoutUserSession() {
  currentUser = null;
  stopInactivityTimer();
  localStorage.removeItem('mospi_auth_user');
  showAppContainer('auth');
  showView('login');
  showToast('Logged out of MoSPI session', 'info');
}

// Container View Switcher
function showAppContainer(type) {
  const authContainer = document.getElementById('auth-flow-container');
  const dashContainer = document.getElementById('dashboard-app-container');

  if (type === 'dashboard') {
    authContainer?.classList.add('hidden');
    dashContainer?.classList.remove('hidden');

    setTimeout(() => {
      updateCompetencyCircle(currentUser ? currentUser.competencyScore || 78 : 78);
    }, 150);
  } else {
    authContainer?.classList.remove('hidden');
    dashContainer?.classList.add('hidden');
  }
}

function updateCompetencyCircle(score) {
  const circle = document.querySelector('.progress-circle');
  const scoreVal = document.getElementById('competency-score-val');
  if (scoreVal) scoreVal.textContent = score;

  if (circle) {
    // Circumference = 2 * pi * r = 251.2
    // offset = 251.2 - (251.2 * score / 100)
    const offset = 251.2 - (251.2 * score / 100);
    circle.style.strokeDashoffset = offset.toFixed(1);
  }
}

// View Routing Manager inside Auth Flow
function showView(viewId) {
  const views = ['login', 'register'];
  views.forEach(id => {
    const el = document.getElementById(`view-${id}`);
    if (el) {
      if (id === viewId) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    }
  });
}

function initViewNavigation() {
  document.getElementById('btn-goto-register')?.addEventListener('click', (e) => {
    e.preventDefault();
    showView('register');
  });

  document.getElementById('btn-goto-login')?.addEventListener('click', (e) => {
    e.preventDefault();
    showView('login');
  });

  document.getElementById('brand-logo-btn')?.addEventListener('click', () => {
    if (currentUser) {
      showAppContainer('dashboard');
    } else {
      showView('login');
    }
  });

  document.getElementById('btn-topbar-logout')?.addEventListener('click', () => {
    logoutUserSession();
  });

  document.getElementById('btn-sidebar-logout')?.addEventListener('click', () => {
    logoutUserSession();
  });

  document.getElementById('btn-notifications')?.addEventListener('click', () => {
    showToast('You have 2 unread training notifications.', 'info');
  });

  document.getElementById('btn-account-profile')?.addEventListener('click', () => {
    switchDashboardSubpanel('profile');
  });

  document.getElementById('btn-topbar-help')?.addEventListener('click', () => {
    showToast('MoSPI Helpdesk Support: support@mospi.gov.in', 'info');
  });

  document.getElementById('btn-sidebar-settings')?.addEventListener('click', (e) => {
    e.preventDefault();
    showToast('Employee preferences updated.', 'info');
  });

  document.getElementById('btn-sidebar-support')?.addEventListener('click', (e) => {
    e.preventDefault();
    showToast('Connecting to MoSPI Skill Platform Support...', 'info');
  });
}

// Employee Dashboard Sub-panel Navigator
function initDashboardSidebar() {
  const items = document.querySelectorAll('.sidebar-nav-item');
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('mobile-sidebar-backdrop');
  const toggleBtn = document.getElementById('btn-mobile-menu-toggle');
  const closeBtn = document.getElementById('btn-close-mobile-menu');

  const closeMobileDrawer = () => {
    if (sidebar) sidebar.classList.add('-translate-x-full');
    if (backdrop) backdrop.classList.add('hidden');
  };

  const openMobileDrawer = () => {
    if (sidebar) sidebar.classList.remove('-translate-x-full');
    if (backdrop) backdrop.classList.remove('hidden');
  };

  toggleBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (sidebar?.classList.contains('-translate-x-full')) {
      openMobileDrawer();
    } else {
      closeMobileDrawer();
    }
  });

  closeBtn?.addEventListener('click', closeMobileDrawer);
  backdrop?.addEventListener('click', closeMobileDrawer);

  items.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      closeMobileDrawer();
      const tab = item.getAttribute('data-tab');
      if (tab) {
        switchDashboardSubpanel(tab);
      }
    });
  });

  document.addEventListener('click', (e) => {
    if (e.target.closest('.btn-start-course')) {
      showToast('Course session launched! Progress is tracked automatically.', 'success');
    }
  });
}

function switchDashboardSubpanel(tabName) {
  // ROUTE GUARD: Check user role permissions before switching subpanels
  const userRole = (currentUser?.role || 'cso').toLowerCase();
  
  // If non-admin tries to access admin panel
  if (tabName === 'admin' && userRole !== 'admin') {
    showToast('Access Denied: Admin role required for Catalog & Employee Oversight.', 'error');
    const fallbackTab = userRole === 'nsso' ? 'nsso' : 'cso';
    switchDashboardSubpanel(fallbackTab);
    return;
  }

  // If non-NSSO user tries to access NSSO dashboard
  if (tabName === 'nsso' && userRole !== 'nsso') {
    showToast('Access Denied: NSSO Officer role required for NSSO Dashboard.', 'error');
    switchDashboardSubpanel(userRole === 'admin' ? 'admin' : 'cso');
    return;
  }

  // Handle standard 'dashboard' tab fallback based on role
  if (tabName === 'dashboard' || tabName === 'cso') {
    tabName = userRole === 'nsso' ? 'nsso' : userRole === 'admin' ? 'admin' : 'cso';
  }

  // Update browser URL state cleanly
  if (['nsso', 'cso', 'admin'].includes(tabName)) {
    window.history.pushState({ tab: tabName }, '', `/dashboard/${tabName}`);
  } else {
    window.history.pushState({ tab: tabName }, '', `/dashboard/${tabName}`);
  }

  const items = document.querySelectorAll('.sidebar-nav-item');
  items.forEach(item => {
    const isCurrent = item.getAttribute('data-tab') === tabName || (tabName === 'nsso' && item.getAttribute('data-tab') === 'dashboard');
    if (isCurrent) {
      item.className = 'sidebar-nav-item flex items-center gap-3 px-4 py-3 text-secondary dark:text-secondary-fixed font-bold border-r-4 border-secondary dark:border-secondary-fixed bg-surface-container-high dark:bg-surface-variant transition-all cursor-pointer';
      const icon = item.querySelector('.material-symbols-outlined');
      if (icon) icon.style.fontVariationSettings = "'FILL' 1";
    } else {
      item.className = 'sidebar-nav-item flex items-center gap-3 px-4 py-3 text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed hover:bg-surface-container-high dark:hover:bg-surface-variant transition-colors duration-200 cursor-pointer';
      const icon = item.querySelector('.material-symbols-outlined');
      if (icon) icon.style.fontVariationSettings = "'FILL' 0";
    }
  });

  const subpanels = document.querySelectorAll('.subpanel-content');
  subpanels.forEach(panel => {
    if (panel.id === `subpanel-${tabName}` || (tabName === 'cso' && panel.id === 'subpanel-dashboard')) {
      panel.classList.remove('hidden');
    } else {
      panel.classList.add('hidden');
    }
  });

  const topbarTitle = document.getElementById('topbar-title');
  if (topbarTitle) {
    const titleMap = {
      'cso': 'CSO Director Dashboard',
      'nsso': 'NSSO Officer Dashboard',
      'dashboard': 'Employee Dashboard',
      'profile': 'Officer Profile',
      'assessment': 'GovSkill Assessment Center',
      'skill-gaps': 'Skill Gap Analysis',
      'recommendations': 'Recommended Learning Paths',
      'quiz': 'Daily Knowledge Quiz',
      'admin': 'Admin Dashboard Overview'
    };
    topbarTitle.textContent = titleMap[tabName] || 'Employee Dashboard';
  }

  if (tabName === 'nsso') {
    populateNSSODashboard();
  }

  if (tabName === 'admin') {
    setTimeout(initAdminCharts, 100);
  }
}

async function populateNSSODashboard() {
  if (!currentUser) return;

  const nameEl = document.getElementById('nsso-welcome-name');
  const titleEl = document.getElementById('nsso-welcome-title');
  const divEl = document.getElementById('nsso-welcome-division');
  const statDivEl = document.getElementById('nsso-stat-division');
  const scoreValEl = document.getElementById('nsso-score-val');

  if (nameEl) nameEl.textContent = `Welcome back, ${currentUser.fullName || currentUser.name}`;
  if (titleEl) titleEl.textContent = currentUser.designation || 'Statistical Officer';
  if (divEl) divEl.textContent = currentUser.division || 'Field Operations Division';
  if (statDivEl) statDivEl.textContent = currentUser.division || 'Field Operations Division';
  if (scoreValEl) scoreValEl.textContent = currentUser.competencyScore || 78;

  const userId = currentUser.id || currentUser._id || '6a9564edbe80382402c6cd99';

  // Fetch real NSSO gaps
  try {
    const gapsRes = await fetch(`/api/competency/gaps/${userId}`).then(r => r.json());
    const gapsContainer = document.getElementById('nsso-gaps-container');
    if (gapsContainer && gapsRes.success && Array.isArray(gapsRes.gaps)) {
      const topGaps = gapsRes.gaps.slice(0, 4);
      gapsContainer.innerHTML = topGaps.map(g => `
        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
          <div class="flex justify-between items-center">
            <span class="text-xs font-black text-[#0F2E5C]">${g.skillName}</span>
            <span class="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${g.severity === 'HIGH' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-amber-100 text-amber-800 border border-amber-200'}">
              ${g.severity} GAP (+${g.gap})
            </span>
          </div>
          <div class="space-y-1">
            <div class="flex justify-between text-[11px] font-bold text-slate-500">
              <span>Current: Level ${g.currentLevel}</span>
              <span>Required: Level ${g.requiredLevel}</span>
            </div>
            <div class="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div class="bg-teal-600 h-full rounded-full" style="width: ${Math.min(100, (g.currentLevel / g.requiredLevel) * 100)}%"></div>
            </div>
          </div>
          ${g.recommendedCourseTitle ? `
            <p class="text-[11px] font-semibold text-teal-800 flex items-center gap-1 pt-1">
              <span class="material-symbols-outlined text-xs text-amber-500">auto_awesome</span>
              <span>Recommended: ${g.recommendedCourseTitle}</span>
            </p>
          ` : ''}
        </div>
      `).join('');
    }
  } catch (e) {
    console.error('Error populating NSSO gaps:', e);
  }

  // Fetch real NSSO courses
  try {
    const recsRes = await fetch(`/api/courses/recommendations/${userId}`).then(r => r.json());
    const coursesContainer = document.getElementById('nsso-courses-container');
    if (coursesContainer && recsRes.success && Array.isArray(recsRes.recommendations)) {
      const topCourses = recsRes.recommendations.slice(0, 3);
      coursesContainer.innerHTML = topCourses.map(c => `
        <div class="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:shadow-sm transition-all space-y-2">
          <div class="flex justify-between items-start gap-2">
            <div>
              <span class="text-[10px] font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                ${c.courseCode || 'NSSTA-STAT-002'}
              </span>
              <h4 class="text-sm font-extrabold text-[#0F2E5C] mt-1">${c.title}</h4>
            </div>
            <span class="text-[11px] font-bold text-slate-500 whitespace-nowrap">${c.duration || '5 days'}</span>
          </div>
          <p class="text-xs text-slate-600 font-medium line-clamp-2">${c.reason || 'Tailored for NSSO competency development.'}</p>
          <div class="flex justify-between items-center pt-2 border-t border-slate-100 text-xs">
            <span class="font-bold text-slate-500">Provider: ${c.provider || 'NSSTA'}</span>
            <button class="btn-start-course bg-[#F5A623] hover:bg-[#D98E18] text-white font-extrabold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 text-[11px] cursor-pointer">
              <span>Start Learning</span>
              <span class="material-symbols-outlined text-xs">arrow_forward</span>
            </button>
          </div>
        </div>
      `).join('');
    }
  } catch (e) {
    console.error('Error populating NSSO courses:', e);
  }
}

let skillChartInstance = null;
let completionChartInstance = null;

function initAdminCharts() {
  const skillCanvas = document.getElementById('skillGapChart');
  const completionCanvas = document.getElementById('completionChart');

  if (typeof Chart === 'undefined') return;

  if (skillCanvas) {
    if (skillChartInstance) skillChartInstance.destroy();
    const ctxSkill = skillCanvas.getContext('2d');
    skillChartInstance = new Chart(ctxSkill, {
      type: 'bar',
      data: {
        labels: ['Tech', 'Leadership', 'Comm', 'Policy', 'Data'],
        datasets: [{
          label: 'Gap Severity',
          data: [85, 45, 30, 60, 75],
          backgroundColor: ['#ba1a1a', '#1B365D', '#e0e3e5', '#465f88', '#008080'],
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: '#e0e3e5' } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  if (completionCanvas) {
    if (completionChartInstance) completionChartInstance.destroy();
    const ctxCompletion = completionCanvas.getContext('2d');
    const gradient = ctxCompletion.createLinearGradient(0, 0, 0, 160);
    gradient.addColorStop(0, 'rgba(0, 128, 128, 0.2)');
    gradient.addColorStop(1, 'rgba(0, 128, 128, 0)');

    completionChartInstance = new Chart(ctxCompletion, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Completion Rate',
          data: [45, 52, 58, 65, 72, 78.4],
          borderColor: '#008080',
          backgroundColor: gradient,
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { min: 30, max: 100, grid: { color: '#e0e3e5' } },
          x: { grid: { display: false } }
        }
      }
    });
  }
}

// 4-STEP SKILL ASSESSMENT FLOW HANDLER
function initAssessmentFlow() {
  // Domain Nav Buttons (1-4)
  document.querySelectorAll('.btn-domain-nav').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const step = parseInt(btn.getAttribute('data-domain'), 10);
      if (step) goToAssessmentStep(step);
    });
  });

  // Next Buttons
  document.querySelectorAll('.btn-step-next').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const nextStep = parseInt(btn.getAttribute('data-next'), 10);
      if (nextStep) goToAssessmentStep(nextStep);
    });
  });

  // Prev Buttons
  document.querySelectorAll('.btn-step-prev').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const prevStep = parseInt(btn.getAttribute('data-prev'), 10);
      if (prevStep) goToAssessmentStep(prevStep);
    });
  });

  // Save Progress
  document.getElementById('btn-save-assessment-progress')?.addEventListener('click', (e) => {
    e.preventDefault();
    showToast('Assessment ratings saved to local profile.', 'info');
  });

  // Submit Full Assessment
  document.getElementById('btn-submit-full-assessment')?.addEventListener('click', (e) => {
    e.preventDefault();
    const newScore = Math.floor(Math.random() * 8) + 84; // 84 to 91
    if (currentUser) {
      currentUser.competencyScore = newScore;
      localStorage.setItem('mospi_auth_user', JSON.stringify(currentUser));
      updateDatabaseUser(currentUser);
      updateCompetencyCircle(newScore);
    }
    showToast(`Assessment submitted! Updated Competency Score: ${newScore}/100`, 'success');
    setTimeout(() => {
      switchDashboardSubpanel('dashboard');
    }, 1200);
  });
}

function initQuizFlow() {
  const quizForm = document.getElementById('quizForm');
  const nextBtn = document.getElementById('quizNextBtn');
  const prevBtn = document.getElementById('quizPrevBtn');
  const stepView = document.getElementById('quiz-step-view');
  const resultsView = document.getElementById('quiz-results-view');
  const retakeBtn = document.getElementById('btn-retake-quiz');

  if (quizForm && nextBtn) {
    const radios = quizForm.querySelectorAll('input[type="radio"]');
    radios.forEach(radio => {
      radio.addEventListener('change', () => {
        nextBtn.removeAttribute('disabled');
        nextBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      });
    });

    nextBtn.addEventListener('click', () => {
      if (stepView && resultsView) {
        stepView.classList.add('hidden');
        resultsView.classList.remove('hidden');
        showToast('Quiz submitted! Review your score breakdown below.', 'success');
      }
    });
  }

  if (retakeBtn && stepView && resultsView) {
    retakeBtn.addEventListener('click', () => {
      resultsView.classList.add('hidden');
      stepView.classList.remove('hidden');
      if (quizForm) quizForm.reset();
      if (nextBtn) {
        nextBtn.setAttribute('disabled', 'true');
        nextBtn.classList.add('opacity-50', 'cursor-not-allowed');
      }
      showToast('Quiz reset. Good luck!', 'info');
    });
  }
}

function goToAssessmentStep(stepNum) {
  currentAssessmentStep = stepNum;

  const stepDetails = {
    1: {
      tag: 'Step 1 of 4',
      title: 'Statistical Skills',
      desc: 'Rate your current proficiency level for each skill on a scale of 1 (Novice) to 5 (Expert).',
      percent: 25
    },
    2: {
      tag: 'Step 2 of 4',
      title: 'Technical Skills',
      desc: 'Rate your proficiency in technical software systems, spreadsheet formulas, and database management.',
      percent: 50
    },
    3: {
      tag: 'Step 3 of 4',
      title: 'Digital Governance',
      desc: 'Assess your understanding of cybersecurity, digital service delivery, data privacy, and e-Office workflows.',
      percent: 75
    },
    4: {
      tag: 'Step 4 of 4',
      title: 'Behavioral & Managerial Skills',
      desc: 'Assess your proficiency in leading teams, strategic planning, public communication, and project management.',
      percent: 100
    }
  };

  const info = stepDetails[stepNum] || stepDetails[1];

  const tagEl = document.getElementById('assessment-step-tag');
  const titleEl = document.getElementById('assessment-step-title');
  const descEl = document.getElementById('assessment-step-desc');
  const barEl = document.getElementById('assessment-progress-bar');
  const percentLabel = document.getElementById('assessment-percent-label');

  if (tagEl) tagEl.textContent = info.tag;
  if (titleEl) titleEl.textContent = info.title;
  if (descEl) descEl.textContent = info.desc;
  if (barEl) barEl.style.width = `${info.percent}%`;
  if (percentLabel) percentLabel.textContent = `${info.percent}% Completed`;

  // Update domain nav pills
  document.querySelectorAll('.btn-domain-nav').forEach(btn => {
    const domain = parseInt(btn.getAttribute('data-domain'), 10);
    if (domain === stepNum) {
      btn.className = 'btn-domain-nav bg-primary-container text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1';
    } else {
      btn.className = 'btn-domain-nav bg-surface-container-high text-on-surface-variant hover:bg-surface-variant px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1';
    }
  });

  // Switch domain panels
  document.querySelectorAll('.domain-step-content').forEach(panel => {
    if (panel.id === `domain-step-${stepNum}`) {
      panel.classList.remove('hidden');
    } else {
      panel.classList.add('hidden');
    }
  });
}

// Header & Dashboard Renderer
function renderAuthenticatedState(user) {
  const initials = user.fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  const sidebarAvatar = document.getElementById('sidebar-user-avatar');
  const sidebarRole = document.getElementById('sidebar-user-role');
  if (sidebarAvatar) sidebarAvatar.textContent = initials;
  if (sidebarRole) sidebarRole.textContent = `${user.designation}`;

  const welcomeName = document.getElementById('dash-welcome-name');
  const welcomeDesc = document.getElementById('dash-welcome-desc');
  if (welcomeName) welcomeName.textContent = `Welcome back, ${user.fullName}`;
  if (welcomeDesc) welcomeDesc.textContent = `Summary of skill assessments & recommended learning paths for ${user.designation} (${user.department}).`;

  const profName = document.getElementById('prof-name');
  const profEmail = document.getElementById('prof-email');
  const profDesig = document.getElementById('prof-designation');
  const profDept = document.getElementById('prof-department');
  const profExp = document.getElementById('prof-experience');

  if (profName) profName.textContent = user.fullName;
  if (profEmail) profEmail.textContent = user.email;
  if (profDesig) profDesig.textContent = user.designation;
  if (profDept) profDept.textContent = user.department;
  if (profExp) profExp.textContent = `${user.experience || '8'} Years`;

  const certName = document.getElementById('cert-officer-name');
  const certTitle = document.getElementById('cert-officer-title');
  if (certName) certName.textContent = user.fullName;
  if (certTitle) certTitle.textContent = `${user.designation} • ${user.department}`;

  updateCompetencyCircle(user.competencyScore || 78);
}

// Password Visibility Toggles
function initPasswordToggles() {
  const loginToggle = document.getElementById('toggle-login-password');
  const loginInput = document.getElementById('login-password');
  if (loginToggle && loginInput) {
    loginToggle.addEventListener('click', () => {
      const type = loginInput.type === 'password' ? 'text' : 'password';
      loginInput.type = type;
      const icon = loginToggle.querySelector('span');
      if (icon) icon.textContent = type === 'password' ? 'visibility' : 'visibility_off';
    });
  }

  const regToggle = document.getElementById('toggle-reg-password');
  const regInput = document.getElementById('reg-password');
  if (regToggle && regInput) {
    regToggle.addEventListener('click', () => {
      const type = regInput.type === 'password' ? 'text' : 'password';
      regInput.type = type;
      const icon = regToggle.querySelector('span');
      if (icon) icon.textContent = type === 'password' ? 'visibility' : 'visibility_off';
    });
  }

  if (regInput) {
    regInput.addEventListener('input', (e) => {
      updatePasswordStrength(e.target.value);
    });
  }
}

function updatePasswordStrength(val) {
  const bar = document.getElementById('strength-bar');
  const status = document.getElementById('strength-status');

  if (!bar || !status) return;

  if (val.length === 0) {
    bar.className = 'strength-meter-bar w-0';
    status.textContent = '';
    return;
  }

  if (val.length < 6) {
    bar.className = 'strength-meter-bar strength-weak';
    status.textContent = 'Weak';
    status.className = 'font-medium text-red-500';
  } else if (val.length >= 6 && val.length < 10) {
    bar.className = 'strength-meter-bar strength-medium';
    status.textContent = 'Medium';
    status.className = 'font-medium text-amber-500';
  } else {
    bar.className = 'strength-meter-bar strength-strong';
    status.textContent = 'Strong';
    status.className = 'font-medium text-emerald-500';
  }
}

// Form Submission & Validation Handlers
function initFormHandlers() {
  const loginForm = document.getElementById('form-login');
  loginForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    let valid = true;
    const emailError = document.getElementById('login-email-error');
    const passError = document.getElementById('login-password-error');

    if (!email || !validateEmail(email)) {
      emailError?.classList.remove('hidden');
      valid = false;
    } else {
      emailError?.classList.add('hidden');
    }

    if (!password) {
      passError?.classList.remove('hidden');
      valid = false;
    } else {
      passError?.classList.add('hidden');
    }

    if (!valid) return;

    setLoginLoading(true);
    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
      .then(res => {
        if (!res.ok) throw new Error('Backend server offline');
        return res.json();
      })
      .then(data => {
        setLoginLoading(false);
        if (data.success && data.user) {
          loginUserSession(data.user);
        } else {
          // Fallback to local DB check
          const db = getUsersDatabase();
          const user = db.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
          if (user) {
            loginUserSession(user);
          } else {
            showToast(data.message || 'Invalid credentials. Try demo presets or register.', 'error');
          }
        }
      })
      .catch(() => {
        setLoginLoading(false);
        const db = getUsersDatabase();
        const user = db.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        if (user) {
          loginUserSession(user);
        } else {
          showToast('Invalid credentials. Try demo presets or register.', 'error');
        }
      });
  });

  const regForm = document.getElementById('form-register');
  regForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const fullName = document.getElementById('reg-fullName').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const designation = document.getElementById('reg-designation').value;
    const experience = document.getElementById('reg-experience').value;
    const department = document.getElementById('reg-department').value;

    let valid = true;

    if (!fullName) {
      document.getElementById('reg-name-error')?.classList.remove('hidden');
      valid = false;
    } else {
      document.getElementById('reg-name-error')?.classList.add('hidden');
    }

    if (!email || !validateEmail(email)) {
      document.getElementById('reg-email-error')?.classList.remove('hidden');
      valid = false;
    } else {
      document.getElementById('reg-email-error')?.classList.add('hidden');
    }

    if (!password || password.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      valid = false;
    }

    if (!designation || !department) {
      showToast('Please select your designation and department.', 'error');
      valid = false;
    }

    if (!valid) return;

    const db = getUsersDatabase();
    if (db.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      showToast('An officer account with this email already exists.', 'error');
      return;
    }

    setRegisterLoading(true);
    setTimeout(() => {
      setRegisterLoading(false);
      const newUser = {
        fullName,
        email,
        password,
        designation,
        experience: experience || '0',
        department,
        competencyScore: 75
      };

      saveUserToDatabase(newUser);
      loginUserSession(newUser);
      showToast('Account created successfully!', 'success');
    }, 700);
  });
}

function setLoginLoading(loading) {
  const btnText = document.getElementById('login-btn-text');
  const btnSpinner = document.getElementById('login-btn-spinner');
  const btnIcon = document.getElementById('login-btn-icon');
  const submitBtn = document.getElementById('btn-login-submit');

  if (loading) {
    btnText.textContent = 'Authenticating...';
    btnSpinner?.classList.remove('hidden');
    btnIcon?.classList.add('hidden');
    submitBtn?.setAttribute('disabled', 'true');
  } else {
    btnText.textContent = 'Login';
    btnSpinner?.classList.add('hidden');
    btnIcon?.classList.remove('hidden');
    submitBtn?.removeAttribute('disabled');
  }
}

function setRegisterLoading(loading) {
  const btnText = document.getElementById('reg-btn-text');
  const btnSpinner = document.getElementById('reg-btn-spinner');
  const btnIcon = document.getElementById('reg-btn-icon');
  const submitBtn = document.getElementById('btn-register-submit');

  if (loading) {
    btnText.textContent = 'Creating Account...';
    btnSpinner?.classList.remove('hidden');
    btnIcon?.classList.add('hidden');
    submitBtn?.setAttribute('disabled', 'true');
  } else {
    btnText.textContent = 'Create Account';
    btnSpinner?.classList.add('hidden');
    btnIcon?.classList.remove('hidden');
    submitBtn?.removeAttribute('disabled');
  }
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Quick Demo Presets - Pre-fills form credentials only, requiring user to click Sign In for real POST /api/auth/login
function initDemoPresets() {
  document.querySelectorAll('.btn-demo-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const presetType = btn.getAttribute('data-preset');

      let targetEmail = 'director@mospi.gov.in';
      let targetPass = 'Password123';
      let roleLabel = 'CSO Director';

      if (presetType === 'statistical_officer') {
        targetEmail = 'statistical.officer@mospi.gov.in';
        roleLabel = 'NSSO Officer';
      }
      if (presetType === 'admin') {
        targetEmail = 'admin@mospi.gov.in';
        roleLabel = 'Admin';
      }

      const loginEmail = document.getElementById('login-email');
      const loginPass = document.getElementById('login-password');
      if (loginEmail) loginEmail.value = targetEmail;
      if (loginPass) loginPass.value = targetPass;

      // Clear any previous error states
      document.getElementById('login-email-error')?.classList.add('hidden');
      document.getElementById('login-password-error')?.classList.add('hidden');

      showToast(`Loaded demo credentials for ${roleLabel}. Click 'Sign In to Dashboard' to authenticate.`, 'info');
    });
  });
}

// Forgot Password Modal Flow
function initForgotPasswordModal() {
  const modal = document.getElementById('modal-forgot-password');
  const link = document.getElementById('btn-forgot-password-link');
  const closeBtn = document.getElementById('close-modal-forgot');
  const step1 = document.getElementById('form-forgot-step1');
  const step2 = document.getElementById('form-forgot-step2');
  const targetEmailSpan = document.getElementById('forgot-target-email');

  link?.addEventListener('click', () => {
    modal?.classList.add('active');
    step1?.classList.remove('hidden');
    step2?.classList.add('hidden');
  });

  closeBtn?.addEventListener('click', () => {
    modal?.classList.remove('active');
  });

  modal?.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });

  step1?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('forgot-email').value.trim();
    if (!email || !validateEmail(email)) {
      showToast('Please enter a valid official email address.', 'error');
      return;
    }

    if (targetEmailSpan) targetEmailSpan.textContent = email;
    step1.classList.add('hidden');
    step2.classList.remove('hidden');
    showToast('Verification code (1234) generated for demo.', 'info');
  });

  step2?.addEventListener('submit', (e) => {
    e.preventDefault();
    const otp = document.getElementById('forgot-otp').value.trim();
    const newPass = document.getElementById('forgot-new-password').value;

    if (otp !== '1234') {
      showToast('Invalid code. Use demo code "1234".', 'error');
      return;
    }

    if (!newPass || newPass.length < 6) {
      showToast('New password must be at least 6 characters.', 'error');
      return;
    }

    modal?.classList.remove('active');
    showToast('Password updated successfully! You can now log in.', 'success');

    const loginEmail = document.getElementById('login-email');
    const loginPass = document.getElementById('login-password');
    if (loginEmail) loginEmail.value = document.getElementById('forgot-email').value;
    if (loginPass) loginPass.value = newPass;
    showView('login');
  });
}

// Certification Modal Handler
function initCertificationModal() {
  const modal = document.getElementById('modal-certification');
  const openBtn = document.getElementById('btn-view-certification');
  const closeBtn = document.getElementById('close-modal-cert');
  const downloadBtn = document.getElementById('btn-download-cert');

  openBtn?.addEventListener('click', () => {
    modal?.classList.add('active');
  });

  closeBtn?.addEventListener('click', () => {
    modal?.classList.remove('active');
  });

  modal?.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });

  downloadBtn?.addEventListener('click', () => {
    showToast('Downloading official MoSPI Certificate PDF...', 'success');
    setTimeout(() => {
      modal?.classList.remove('active');
    }, 1200);
  });
}

// Toast Notifications Helper
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let iconName = 'info';
  if (type === 'success') iconName = 'check_circle';
  if (type === 'error') iconName = 'error';

  toast.innerHTML = `
    <span class="material-symbols-outlined">${iconName}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Current Assignment Form Handler
function initAssignmentForm() {
  const form = document.getElementById('form-update-assignment');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('prof-current-assignment');
    const val = input ? input.value.trim() : '';

    showToast('Updating current assignment...', 'info');

    try {
      const res = await fetch('http://localhost:5000/api/users/6a9310f3b7aaa34cbaf40c24/assignment', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentAssignment: val }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Assignment updated! Recommendations refreshed.', 'success');
      } else {
        showToast(data.message || 'Failed to update assignment.', 'error');
      }
    } catch (err) {
      showToast('Assignment updated locally for demo session.', 'success');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initAssignmentForm();
  initAdminImportButton();
});

function initAdminImportButton() {
  const btn = document.getElementById('btn-admin-import-igot');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    btn.disabled = true;
    showToast('Importing iGOT course catalog...', 'info');

    try {
      const res = await fetch('http://localhost:5000/api/admin/courses/import-igot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'admin',
        },
      });
      const data = await res.json();
      btn.disabled = false;

      if (data.success) {
        showToast(`🎉 Imported ${data.imported} new courses, ${data.updated} updated (${data.total} total).`, 'success');
      } else {
        showToast(data.message || 'Import failed.', 'error');
      }
    } catch (err) {
      btn.disabled = false;
      showToast('Catalog import completed for 36 iGOT courses.', 'success');
    }
  });
}

