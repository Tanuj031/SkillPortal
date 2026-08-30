import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [impactData, setImpactData] = useState({
    averageGain: 0,
    totalCompleted: 0,
    completions: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user || (!user.id && !user._id)) {
        setIsLoading(false);
        return;
      }
      const userId = user.id || user._id;
      setIsLoading(true);

      try {
        const [impactRes, recsRes] = await Promise.all([
          api.get(`/api/analytics/impact/${userId}`).catch((err) => ({ data: null })),
          api.get(`/api/courses/recommendations/${userId}`).catch((err) => ({ data: null })),
        ]);

        if (impactRes.data && impactRes.data.success) {
          setImpactData({
            averageGain: impactRes.data.averageGain || 0,
            totalCompleted: impactRes.data.totalCompleted || impactRes.data.completions?.length || 0,
            completions: impactRes.data.completions || [],
          });
        }

        if (recsRes.data && recsRes.data.success && Array.isArray(recsRes.data.recommendations)) {
          setRecommendations(recsRes.data.recommendations.slice(0, 3));
        }
      } catch (err) {
        console.error('Error loading dashboard API data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const userName = user?.name || user?.fullName || 'Officer';
  const userScore = user?.competencyScore || 78;

  return (
    <div className="flex-1 bg-[#F8FAFC] min-h-screen space-y-6">
      {/* Karmayogi iGOT Style Deep Navy Hero / Welcome Banner */}
      <section className="bg-gradient-to-r from-[#0F2E5C] via-[#1B365D] to-[#0A1F3F] text-white rounded-2xl p-6 md:p-8 shadow-md relative overflow-hidden">
        {/* Subtle Low-Opacity Geometric Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
        <div className="relative z-10 space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-[#F5A623]/20 border border-[#F5A623]/40 text-[#F5A623] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-sm">verified</span>
            <span>Karmayogi Bharat Integrated Platform</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-extrabold text-white leading-tight">
            Welcome back, {userName}
          </h2>
          <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
            Here is a summary of your verified competency scores, course completions, and training impact.
          </p>
        </div>
      </section>

      {/* Competency Score Overview & Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Ring Score Overview */}
        <article className="col-span-1 md:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold text-primary mb-1">Overall Competency</h3>
              <p className="text-xs md:text-sm text-on-surface-variant">
                Aggregate score across verified MoSPI skill modules.
              </p>
            </div>
            <span className="text-xs font-semibold text-secondary flex items-center gap-1">
              Active FY24 Cycle
              <span className="material-symbols-outlined text-sm">verified</span>
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 mt-auto">
            {/* SVG Competency Ring */}
            <div className="relative w-32 h-32 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  className="text-surface-container-highest"
                  cx="50"
                  cy="50"
                  fill="transparent"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                />
                <circle
                  className="text-secondary transition-all duration-1000"
                  cx="50"
                  cy="50"
                  fill="transparent"
                  r="40"
                  stroke="currentColor"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * userScore) / 100}
                  strokeLinecap="round"
                  strokeWidth="8"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-primary">{userScore}</span>
                <span className="text-xs text-on-surface-variant">/100</span>
              </div>
            </div>

            {/* Breakdown List */}
            <div className="flex flex-col gap-3 flex-1 w-full text-sm">
              <div className="flex justify-between items-center border-b border-outline-variant pb-2">
                <span className="text-on-surface-variant">Data Governance</span>
                <span className="font-bold text-primary">Advanced (Level 4)</span>
              </div>
              <div className="flex justify-between items-center border-b border-outline-variant pb-2">
                <span className="text-on-surface-variant">Statistical Methodology</span>
                <span className="font-bold text-primary">Intermediate (Level 3)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant">Digital Procurement</span>
                <span className="font-bold text-secondary">In Progress (Level 2.5)</span>
              </div>
            </div>
          </div>
        </article>

        {/* Summary Stat Card: Training Impact Average Gain */}
        <article className="col-span-1 md:col-span-4 bg-primary-container text-white border border-outline-variant rounded-xl p-6 flex flex-col justify-between relative overflow-hidden shadow-sm">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-secondary/30 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider opacity-80">
                Training Impact Stat
              </h3>
              <span className="material-symbols-outlined text-secondary bg-white/10 p-1.5 rounded-lg text-lg">
                trending_up
              </span>
            </div>
            <p className="text-xs opacity-90">Average Skill Gain per Completed Course</p>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-5xl font-extrabold text-white">
                +{impactData.averageGain || 0}
              </span>
              <span className="text-sm font-semibold opacity-90">Proficiency Levels</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center text-xs">
            <span className="opacity-90">Courses Completed</span>
            <span className="font-bold bg-white/20 px-2.5 py-1 rounded-full text-white">
              {impactData.totalCompleted} Completed
            </span>
          </div>
        </article>
      </div>

      {/* RECOMMENDED FOR YOU SECTION (FETCHED FROM API) */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-2xl">auto_awesome</span>
              Recommended for You
            </h3>
            <p className="text-xs md:text-sm text-on-surface-variant">
              Top course recommendations matched against your competency gaps and active project assignment.
            </p>
          </div>
          <Link
            to="/dashboard/recommendations"
            className="min-h-[44px] px-3 py-2 text-xs font-semibold text-secondary hover:underline flex items-center justify-center gap-1"
          >
            <span>View All</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 animate-pulse h-48" />
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendations.map((course) => (
              <div
                key={course._id || course.courseCode}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wide bg-surface-container-high text-primary px-2.5 py-0.5 rounded">
                      {course.domain || 'Statistical'}
                    </span>
                    <span className="text-[11px] font-bold text-primary bg-primary-container/10 px-2 py-0.5 rounded-full border border-primary/20">
                      {course.recommendationScore || 80}% Match
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-on-surface leading-snug mb-1">
                    {course.title}
                  </h4>
                  <p className="text-xs text-on-surface-variant font-mono mb-3">
                    {course.courseCode} • {course.provider} • {course.duration}
                  </p>
                  {course.reason && (
                    <p className="text-xs text-slate-700 bg-teal-50/80 border border-teal-200/80 p-2.5 rounded-lg leading-relaxed">
                      💡 {course.reason}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-outline-variant/60 flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant font-medium">Level {course.level || 3}</span>
                  <Link
                    to="/dashboard/recommendations"
                    className="bg-[#F5A623] hover:bg-[#D98E18] text-white font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors shadow-xs"
                  >
                    <span>Start Learning</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-surface-container-lowest border border-outline-variant rounded-xl text-xs text-on-surface-variant">
            No course recommendations found. Update your current assignment in your Profile to generate tailored recommendations.
          </div>
        )}
      </section>

      {/* TRAINING IMPACT & SKILL PROGRESSION SECTION (FETCHED FROM API) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h3 className="text-xl font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-2xl">auto_graph</span>
              Training Impact & Skill Progression
            </h3>
            <p className="text-xs md:text-sm text-on-surface-variant">
              Before and after proficiency level snapshots from completed iGOT and NSSTA certifications.
            </p>
          </div>
          <span className="text-xs font-semibold text-secondary bg-teal-50 px-3 py-1.5 rounded-md border border-teal-200">
            {impactData.completions.length} Verified Modules
          </span>
        </div>

        {/* Impact Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 animate-pulse h-48" />
            ))}
          </div>
        ) : impactData.completions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {impactData.completions.map((item) => {
              const beforeLevel = item.levelBefore || 2;
              const afterLevel = item.levelAfter || 4;
              const gain = item.gain || (afterLevel - beforeLevel);
              const beforePercent = Math.min((beforeLevel / 5) * 100, 100);
              const afterPercent = Math.min((afterLevel / 5) * 100, 100);

              return (
                <div
                  key={item.completionId || item.courseCode}
                  className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
                >
                  <div>
                    {/* Top Badge Row */}
                    <div className="flex justify-between items-start mb-3 gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wide bg-surface-container-high text-primary px-2.5 py-1 rounded">
                        {item.domain || 'Statistical'}
                      </span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">arrow_upward</span>
                        +{gain} Gain
                      </span>
                    </div>

                    {/* Course Title & Code */}
                    <h4 className="text-base font-bold text-on-surface leading-snug mb-1">
                      {item.courseTitle}
                    </h4>
                    <p className="text-xs text-on-surface-variant font-mono mb-4">
                      {item.courseCode} • {item.skillName}
                    </p>
                  </div>

                  {/* Before / After Progress Bars */}
                  <div className="space-y-3 pt-3 border-t border-outline-variant/60 text-xs">
                    {/* Before Bar */}
                    <div>
                      <div className="flex justify-between items-center mb-1 text-on-surface-variant">
                        <span>Level Before Training</span>
                        <span className="font-semibold text-on-surface">Level {beforeLevel} / 5</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-slate-400 h-full rounded-full"
                          style={{ width: `${beforePercent}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* After Bar */}
                    <div>
                      <div className="flex justify-between items-center mb-1 font-semibold text-primary">
                        <span>Level After Completion</span>
                        <span className="text-emerald-600 font-bold">Level {afterLevel} / 5</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full transition-all duration-700"
                          style={{ width: `${afterPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-surface-container-lowest border border-outline-variant rounded-xl text-xs text-on-surface-variant">
            No course completions logged yet. Complete courses on iGOT to build your verified training impact score.
          </div>
        )}
      </section>
    </div>
  );
}
