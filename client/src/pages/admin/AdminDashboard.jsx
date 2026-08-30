import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import api from '../../services/api';

const INITIAL_EMPLOYEES = [
  {
    id: 'EMP-4029',
    name: 'Sarah Jenkins',
    department: 'Data Analysis',
    score: 92,
    scoreColor: 'bg-emerald-600',
    lastActive: '2 hours ago',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'EMP-3188',
    name: 'Michael Ross',
    department: 'Policy Planning',
    score: 64,
    scoreColor: 'bg-amber-600',
    lastActive: '1 day ago',
    initials: 'MR'
  },
  {
    id: 'EMP-5521',
    name: 'David Chen',
    department: 'IT Infrastructure',
    score: 88,
    scoreColor: 'bg-blue-900',
    lastActive: 'Just now',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'EMP-2901',
    name: 'Anita Patel',
    department: 'Human Resources',
    score: 76,
    scoreColor: 'bg-teal-600',
    lastActive: '3 days ago',
    initials: 'AP'
  }
];

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [isImporting, setIsImporting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const skillChartRef = useRef(null);
  const completionChartRef = useRef(null);
  const skillChartInstance = useRef(null);
  const completionChartInstance = useRef(null);

  const handleImportIgotCatalog = async () => {
    setIsImporting(true);
    setToastMessage('');

    try {
      const response = await api.post(
        '/api/admin/courses/import-igot',
        {},
        {
          headers: {
            'x-user-role': 'admin',
          },
        }
      );

      if (response.data && response.data.success) {
        const { imported, updated, total } = response.data;
        setToastMessage(
          `🎉 iGOT Catalog Imported! ${imported} new courses imported, ${updated} updated (${total} total in catalog).`
        );
        setToastType('success');
      } else {
        setToastMessage('Failed to import iGOT catalog.');
        setToastType('error');
      }
    } catch (err) {
      console.error('Import error:', err);
      const msg = err.response?.data?.message || 'Error connecting to backend import service.';
      setToastMessage(msg);
      setToastType('error');
    } finally {
      setIsImporting(false);
    }
  };

  useEffect(() => {
    // 1. Skill Gap Chart
    if (skillChartRef.current) {
      if (skillChartInstance.current) skillChartInstance.current.destroy();

      const ctxSkill = skillChartRef.current.getContext('2d');
      skillChartInstance.current = new Chart(ctxSkill, {
        type: 'bar',
        data: {
          labels: ['Tech', 'Leadership', 'Comm', 'Policy', 'Data'],
          datasets: [{
            label: 'Gap Severity',
            data: [85, 45, 30, 60, 75],
            backgroundColor: [
              '#ba1a1a', // High gap red
              '#1B365D',
              '#e0e3e5',
              '#465f88',
              '#008080'
            ],
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

    // 2. Completion Rate Line Chart
    if (completionChartRef.current) {
      if (completionChartInstance.current) completionChartInstance.current.destroy();

      const ctxCompletion = completionChartRef.current.getContext('2d');
      const gradient = ctxCompletion.createLinearGradient(0, 0, 0, 160);
      gradient.addColorStop(0, 'rgba(0, 128, 128, 0.25)');
      gradient.addColorStop(1, 'rgba(0, 128, 128, 0)');

      completionChartInstance.current = new Chart(ctxCompletion, {
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

    return () => {
      if (skillChartInstance.current) skillChartInstance.current.destroy();
      if (completionChartInstance.current) completionChartInstance.current.destroy();
    };
  }, []);

  const filteredEmployees = INITIAL_EMPLOYEES.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = departmentFilter === 'All' || emp.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="flex-1 bg-surface min-h-screen">
      {/* Top Header */}
      <header className="hidden md:flex justify-between items-center w-full px-8 h-20 sticky top-0 z-30 bg-surface/90 backdrop-blur-sm border-b border-outline-variant">
        <h2 className="text-2xl font-bold text-on-surface">Dashboard Overview</h2>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleImportIgotCatalog}
            disabled={isImporting}
            className="bg-[#006a6a] text-white font-semibold text-xs px-4 py-2 rounded-lg hover:bg-[#004f4f] transition-colors flex items-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">cloud_download</span>
            <span>{isImporting ? 'Importing iGOT...' : 'Import iGOT Catalog'}</span>
          </button>
          <div className="relative w-56">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">search</span>
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search employees..."
              className="w-full pl-10 pr-3 py-1.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all"
            />
          </div>
          <div className="flex items-center gap-3 pl-3 border-l border-outline-variant">
            <div className="w-10 h-10 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-sm">
              AS
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-semibold text-on-surface">Amitabh Sen</p>
              <p className="text-xs text-on-surface-variant">System Administrator</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-4 md:p-8 max-w-[1280px] mx-auto space-y-8">
        {toastMessage && (
          <div
            className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 shadow-sm ${
              toastType === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base">
                {toastType === 'success' ? 'check_circle' : 'error'}
              </span>
              <span>{toastMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage('')}
              className="text-slate-500 hover:text-slate-800"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        )}
        {/* Analytics Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Skill Gap Distribution */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Skill Gap Distribution</h3>
                <p className="text-xl font-bold text-on-surface mt-1">High Priority</p>
              </div>
              <div className="p-2 bg-red-100 text-red-700 rounded-lg">
                <span className="material-symbols-outlined">warning</span>
              </div>
            </div>
            <div className="flex-1 relative min-h-[160px] w-full">
              <canvas ref={skillChartRef}></canvas>
            </div>
          </div>

          {/* Card 2: Assessment Completion */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Assessment Completion</h3>
                <p className="text-xl font-bold text-on-surface mt-1">78.4%</p>
              </div>
              <div className="p-2 bg-teal-100 text-teal-800 rounded-lg">
                <span className="material-symbols-outlined">trending_up</span>
              </div>
            </div>
            <div className="flex-1 relative min-h-[160px] w-full">
              <canvas ref={completionChartRef}></canvas>
            </div>
          </div>

          {/* Card 3: Avg Competency Score */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col justify-between relative overflow-hidden shadow-sm">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-200/40 rounded-full blur-2xl pointer-events-none"></div>
            <div>
              <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Avg Competency Score</h3>
              <div className="flex items-baseline gap-2 mt-2">
                <p className="text-5xl font-bold text-primary">82</p>
                <span className="text-sm text-on-surface-variant">/ 100</span>
              </div>
            </div>
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2 text-xs text-on-surface-variant font-medium">
                <span>Target: 85</span>
                <span className="text-teal-700 font-semibold">+2 pts this month</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: '82%' }}></div>
              </div>
            </div>
          </div>
        </section>

        {/* Employee Oversight Table */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="p-6 border-b border-outline-variant flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-xl font-bold text-on-surface">Employee Oversight</h3>
              <p className="text-xs text-on-surface-variant mt-1">Manage and review employee competency progress across divisions.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <select 
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="min-h-[44px] px-3 py-2 border border-outline-variant bg-surface-container-lowest rounded-lg text-xs font-semibold text-primary focus:outline-none cursor-pointer"
              >
                <option value="All">All Departments</option>
                <option value="Data Analysis">Data Analysis</option>
                <option value="Policy Planning">Policy Planning</option>
                <option value="IT Infrastructure">IT Infrastructure</option>
                <option value="Human Resources">Human Resources</option>
              </select>
              <button 
                type="button" 
                className="min-h-[44px] px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-container transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">download</span> Export List
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant text-xs font-semibold text-on-surface-variant uppercase">
                  <th className="p-4">Employee Name</th>
                  <th className="p-4">Department</th>
                  <th className="p-4 w-1/3">Overall Skill Score</th>
                  <th className="p-4">Last Active</th>
                  <th className="p-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant text-sm">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {emp.avatar ? (
                          <img src={emp.avatar} alt={emp.name} className="w-10 h-10 rounded-full object-cover border" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center">
                            {emp.initials}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-on-surface">{emp.name}</p>
                          <p className="text-xs text-on-surface-variant">ID: {emp.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-on-surface">{emp.department}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-on-surface w-6">{emp.score}</span>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${emp.scoreColor}`} style={{ width: `${emp.score}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-on-surface-variant text-xs">{emp.lastActive}</td>
                    <td className="p-4 text-right pr-6">
                      <button type="button" className="text-primary hover:text-secondary font-semibold text-xs py-1 px-2 rounded hover:bg-slate-100 transition-colors">
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-outline-variant flex justify-between items-center text-xs text-on-surface-variant">
            <span>Showing {filteredEmployees.length} of {INITIAL_EMPLOYEES.length} entries</span>
            <div className="flex gap-2">
              <button disabled className="p-1 border border-outline-variant rounded opacity-50 cursor-not-allowed">
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <button className="p-1 border border-outline-variant rounded hover:bg-surface-container">
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
