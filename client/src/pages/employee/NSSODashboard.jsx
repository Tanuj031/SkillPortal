import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function NSSODashboard() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [gaps, setGaps] = useState([]);
  const [impactData, setImpactData] = useState({
    averageGain: 0,
    totalCompleted: 0,
    completions: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNSSODashboardData = async () => {
      if (!user || (!user.id && !user._id)) {
        setIsLoading(false);
        return;
      }
      const userId = user.id || user._id;
      setIsLoading(true);

      try {
        const [gapsRes, recsRes, impactRes] = await Promise.all([
          api.get(`/api/competency/gaps/${userId}`).catch(() => ({ data: null })),
          api.get(`/api/courses/recommendations/${userId}`).catch(() => ({ data: null })),
          api.get(`/api/analytics/impact/${userId}`).catch(() => ({ data: null })),
        ]);

        if (gapsRes.data && gapsRes.data.success && Array.isArray(gapsRes.data.gaps)) {
          setGaps(gapsRes.data.gaps.slice(0, 4));
        }

        if (recsRes.data && recsRes.data.success && Array.isArray(recsRes.data.recommendations)) {
          setRecommendations(recsRes.data.recommendations.slice(0, 3));
        }

        if (impactRes.data && impactRes.data.success) {
          setImpactData({
            averageGain: impactRes.data.averageGain || 0,
            totalCompleted: impactRes.data.totalCompleted || impactRes.data.completions?.length || 0,
            completions: impactRes.data.completions || [],
          });
        }
      } catch (err) {
        console.error('Error loading NSSO dashboard API data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNSSODashboardData();
  }, [user]);

  const userName = user?.name || user?.fullName || 'Rajesh Kumar';
  const userDesignation = user?.designation || 'Statistical Officer';
  const userDivision = user?.division || 'Field Operations Division';
  const userScore = user?.competencyScore || 78;

  return (
    <div className="flex-1 bg-[#F8FAFC] min-h-screen space-y-6">
      {/* 1. Header/Welcome Section tailored specifically for NSSO */}
      <section className="bg-gradient-to-r from-teal-900 via-teal-800 to-[#0F2E5C] text-white rounded-2xl p-6 md:p-8 shadow-md relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
        <div className="relative z-10 space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-400/40 text-amber-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-sm">analytics</span>
            <span>National Sample Survey Office (NSSO) Dashboard</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-extrabold text-white leading-tight">
            Welcome back, {userName}
          </h2>
          <p className="text-xs md:text-sm text-teal-100 leading-relaxed font-medium">
            Summary of skill assessments & recommended learning paths for <strong className="text-white">{userDesignation}</strong> (National Sample Survey Office — <span className="text-amber-300 font-bold">{userDivision}</span>)
          </p>
        </div>
      </section>

      {/* 2. Overall Competency Card & Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Ring Score Overview */}
        <article className="col-span-1 md:col-span-8 bg-white border border-slate-200/90 rounded-2xl p-6 flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-teal-800">NSSO Competency Index</span>
              <h3 className="text-xl font-extrabold text-[#0F2E5C] mb-1">Survey & Field Competency Score</h3>
              <p className="text-xs text-slate-500 font-medium">
                Calculated from your verified NSSO competency profile & division requirements.
              </p>
            </div>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 flex items-center gap-1">
              Active FY25 Cycle
              <span className="material-symbols-outlined text-sm text-teal-600">verified</span>
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-8 py-2">
            {/* SVG Ring Meter */}
            <div className="relative w-36 h-36 flex items-center justify-center flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#E2E8F0" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#0D9488"
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * userScore) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-black text-[#0F2E5C]">{userScore}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">out of 100</span>
              </div>
            </div>

            <div className="space-y-3 flex-1 w-full">
              <div className="flex justify-between items-center text-xs font-extrabold border-b border-slate-100 pb-2">
                <span className="text-slate-600">Division Focus</span>
                <span className="text-teal-800">{userDivision}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-extrabold border-b border-slate-100 pb-2">
                <span className="text-slate-600">Key Target Skill</span>
                <span className="text-[#0F2E5C]">Survey Design & Sampling (Level 5)</span>
              </div>
              <div className="flex justify-between items-center text-xs font-extrabold pb-1">
                <span className="text-slate-600">Certification Status</span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-black">Verified Officer</span>
              </div>
            </div>
          </div>
        </article>

        {/* Priority Action Card */}
        <article className="col-span-1 md:col-span-4 bg-gradient-to-br from-slate-900 to-[#0F2E5C] text-white rounded-2xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="space-y-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center">
              <span class="material-symbols-outlined text-xl">biotech</span>
            </div>
            <h4 className="text-lg font-black text-white">NSSO Assessment Center</h4>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Complete your 4-step survey methodology self-assessment to update your competency gap profile.
            </p>
          </div>

          <Link
            to="/assessment"
            className="mt-6 w-full bg-[#F5A623] hover:bg-[#D98E18] text-white font-extrabold text-xs py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 text-center"
          >
            <span>Take Skill Assessment</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </article>
      </div>

      {/* 3. Priority Skill Gaps (NSSO Division-Relevant) */}
      <section className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-teal-800">Targeted Improvements</span>
            <h3 className="text-xl font-black text-[#0F2E5C]">NSSO Priority Skill Gaps</h3>
          </div>
          <Link
            to="/skill-gaps"
            className="text-xs font-extrabold text-teal-700 hover:text-teal-900 flex items-center gap-1 transition-colors"
          >
            <span>View Full Analysis</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </Link>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-xs font-semibold text-slate-400">Loading NSSO skill gaps...</div>
        ) : gaps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gaps.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 hover:border-teal-300 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-[#0F2E5C]">{item.skillName}</span>
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      item.severity === 'HIGH'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {item.severity} GAP ({item.gap > 0 ? `+${item.gap}` : item.gap})
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-slate-500">
                    <span>Current: Level {item.currentLevel}</span>
                    <span>Required: Level {item.requiredLevel}</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-teal-600 h-full rounded-full"
                      style={{ width: `${(item.currentLevel / item.requiredLevel) * 100}%` }}
                    />
                  </div>
                </div>

                {item.recommendedCourseTitle && (
                  <p className="text-[11px] font-semibold text-teal-800 flex items-center gap-1 pt-1">
                    <span className="material-symbols-outlined text-xs text-amber-500">auto_awesome</span>
                    <span>Recommended: {item.recommendedCourseTitle}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-xs font-bold text-slate-500">No active skill gaps identified.</div>
        )}
      </section>

      {/* 4. Training Impact & Skill Progression (Real NSSTA Courses) & 5. Recommended Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recommended Courses Column */}
        <section className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-teal-800">Matched to your Division</span>
              <h3 className="text-xl font-black text-[#0F2E5C]">Recommended NSSTA Courses</h3>
            </div>
            <Link
              to="/recommendations"
              className="text-xs font-extrabold text-teal-700 hover:text-teal-900 flex items-center gap-1"
            >
              <span>View Catalog</span>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </Link>
          </div>

          <div className="space-y-3">
            {recommendations.length > 0 ? (
              recommendations.map((course) => (
                <div
                  key={course._id || course.id}
                  className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:shadow-sm transition-all space-y-2"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        {course.courseCode || 'NSSTA-STAT-002'}
                      </span>
                      <h4 className="text-sm font-extrabold text-[#0F2E5C] mt-1">{course.title}</h4>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">
                      {course.duration || '5 days'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 font-medium line-clamp-2">
                    {course.reason || `Tailored for ${userDivision} competency development.`}
                  </p>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-xs">
                    <span className="font-bold text-slate-500">Provider: {course.provider || 'NSSTA'}</span>
                    <a
                      href="#igot-portal"
                      className="bg-[#F5A623] hover:bg-[#D98E18] text-white font-extrabold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 text-[11px]"
                    >
                      <span>Start Learning</span>
                      <span className="material-symbols-outlined text-xs">arrow_forward</span>
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs font-bold text-slate-400">Loading recommended courses...</div>
            )}
          </div>
        </section>

        {/* Skill Progression & Completions */}
        <section className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-[11px] font-black uppercase tracking-wider text-teal-800">Verified Certifications</span>
            <h3 className="text-xl font-black text-[#0F2E5C]">Training Impact & History</h3>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-200/80 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-extrabold uppercase text-teal-800">Completed Course</span>
                <p className="text-xs font-extrabold text-[#0F2E5C]">Sampling Techniques & Survey Methods</p>
                <span className="text-[10px] text-slate-500 font-semibold">NSSTA Certificate Issued • Level 4</span>
              </div>
              <span className="material-symbols-outlined text-teal-600 text-2xl">verified</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-extrabold uppercase text-slate-500">Completed Course</span>
                <p className="text-xs font-extrabold text-[#0F2E5C]">Data Collection Quality Frameworks</p>
                <span className="text-[10px] text-slate-500 font-semibold">NSSTA Certificate Issued • Level 3</span>
              </div>
              <span className="material-symbols-outlined text-slate-400 text-2xl">verified</span>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
