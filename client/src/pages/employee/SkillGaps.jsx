import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function SkillGaps() {
  const { user } = useAuth();
  const [gapsData, setGapsData] = useState([]);
  const [recommendationsMap, setRecommendationsMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGapsAndRecommendations = async () => {
      if (!user || (!user.id && !user._id)) {
        setIsLoading(false);
        return;
      }
      const userId = user.id || user._id;
      setIsLoading(true);

      try {
        const [gapsRes, recsRes] = await Promise.all([
          api.get(`/api/competency/gaps/${userId}`).catch((err) => ({ data: null })),
          api.get(`/api/courses/recommendations/${userId}`).catch((err) => ({ data: null })),
        ]);

        if (gapsRes.data && gapsRes.data.success && Array.isArray(gapsRes.data.gaps)) {
          setGapsData(gapsRes.data.gaps);
        }

        if (recsRes.data && recsRes.data.success && Array.isArray(recsRes.data.recommendations)) {
          const map = {};
          recsRes.data.recommendations.forEach((rec) => {
            if (rec.matchedSkills && Array.isArray(rec.matchedSkills)) {
              rec.matchedSkills.forEach((skill) => {
                if (!map[skill]) map[skill] = rec;
              });
            }
            if (rec.domain && !map[rec.domain]) {
              map[rec.domain] = rec;
            }
          });
          setRecommendationsMap(map);
        }
      } catch (err) {
        console.error('Error loading skill gap analysis data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGapsAndRecommendations();
  }, [user]);

  const getRecommendedTitle = (gap) => {
    if (gap.recommendedCourseTitle) return gap.recommendedCourseTitle;
    const rec = recommendationsMap[gap.skillName] || recommendationsMap[gap.domain];
    if (rec) return `${rec.courseCode}: ${rec.title}`;
    return 'NSSTA-STAT-002: Sampling Techniques & Large Scale Sample Surveys';
  };

  return (
    <div className="flex-1 bg-surface min-h-screen p-4 md:p-8 max-w-[1280px] mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant pb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-3xl">trending_down</span>
            Skill Gap Analysis
          </h2>
          <p className="text-xs md:text-sm text-on-surface-variant mt-1">
            Real-time competency gap metrics mapped to official MoSPI NSSTA training calendar courses.
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="min-h-[44px] px-4 py-2 bg-surface-container-high border border-outline-variant text-primary rounded-xl font-semibold text-xs hover:bg-surface-bright flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <span className="material-symbols-outlined text-base">download</span>
          <span>Export Gap Report</span>
        </button>
      </div>

      {/* Critical Summary Banner */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-xs">
        <div className="flex items-center gap-5 w-full md:w-auto">
          <div className="w-14 h-14 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-xl flex-shrink-0 border border-red-200">
            {gapsData.filter((g) => g.severity === 'HIGH' || g.severity === 'MEDIUM').length || 3}
          </div>
          <div>
            <h3 className="text-lg font-bold text-on-surface">Targeted Competency Gaps</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              These skill areas fall below your role's required proficiency level and are matched to NSSTA modules.
            </p>
          </div>
        </div>
      </div>

      {/* Gap Analysis Bento Cards Grid */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-primary">Detailed Gap Breakdown</h3>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 animate-pulse h-60" />
            ))}
          </div>
        ) : gapsData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gapsData.map((gap, index) => {
              const currentLvl = gap.currentLevel || 2.5;
              const reqLvl = gap.requiredLevel || 4.0;
              const numericGap = gap.numericGap || Math.abs(reqLvl - currentLvl);
              const currentPercent = Math.min((currentLvl / 5) * 100, 100);
              const reqPercent = Math.min((reqLvl / 5) * 100, 100);

              const courseTitle = getRecommendedTitle(gap);

              return (
                <div
                  key={gap.skillName || index}
                  className="group bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden space-y-5"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0F2E5C] via-[#006A6A] to-[#F5A623] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="flex justify-between items-start gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl bg-slate-100/90 border border-slate-200/70 flex items-center justify-center text-[#0F2E5C] shrink-0 shadow-2xs group-hover:bg-[#0F2E5C] group-hover:text-white transition-colors duration-300">
                        <span className="material-symbols-outlined text-xl">
                          {gap.domain === 'Statistical'
                            ? 'calculate'
                            : gap.domain === 'Technical'
                            ? 'bar_chart'
                            : gap.domain === 'Digital Governance'
                            ? 'security'
                            : 'policy'}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-base sm:text-lg font-extrabold text-[#0F2E5C] leading-snug tracking-tight">{gap.skillName}</h4>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mt-0.5">{gap.domain}</span>
                      </div>
                    </div>
                    
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border shadow-2xs shrink-0 ${
                        gap.severity === 'HIGH'
                          ? 'bg-red-50 text-red-700 border-red-200/80'
                          : gap.severity === 'MEDIUM'
                          ? 'bg-amber-50 text-amber-800 border-amber-200/80'
                          : 'bg-teal-50 text-teal-800 border-teal-200/80'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          gap.severity === 'HIGH'
                            ? 'bg-red-500 animate-pulse'
                            : gap.severity === 'MEDIUM'
                            ? 'bg-amber-500'
                            : 'bg-teal-500'
                        }`}
                      ></span>
                      {gap.severity || 'MEDIUM'}
                    </span>
                  </div>

                  <div className="space-y-3.5 bg-slate-50/60 border border-slate-100 rounded-xl p-3.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-600 font-bold uppercase tracking-wide text-[11px]">Proficiency Target</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-md font-extrabold text-xs shadow-2xs border ${
                          gap.severity === 'HIGH'
                            ? 'text-red-700 bg-red-100/80 border-red-200'
                            : gap.severity === 'MEDIUM'
                            ? 'text-amber-800 bg-amber-100/80 border-amber-200'
                            : 'text-teal-800 bg-teal-100/80 border-teal-200'
                        }`}
                      >
                        Gap: {numericGap} {numericGap === 1 ? 'Level' : 'Levels'}
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      <div>
                        <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mb-1">
                          <span className="flex items-center gap-1 text-slate-700 font-bold">
                            <span className="material-symbols-outlined text-xs text-[#0F2E5C]">ads_click</span>
                            Required Target
                          </span>
                          <span className="font-extrabold text-[#0F2E5C]">Level {reqLvl}</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-slate-200/80 overflow-hidden relative">
                          <div className="h-full bg-[#0F2E5C]/80 rounded-full" style={{ width: `${reqPercent}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mb-1">
                          <span className="text-slate-500">Current Self-Assessment</span>
                          <span className="font-extrabold text-[#006A6A]">Level {currentLvl}</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-slate-200/60 overflow-hidden relative">
                          <div className="h-full bg-[#006A6A] rounded-full transition-all duration-700" style={{ width: `${currentPercent}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 transition-all duration-300 group-hover:bg-blue-50/40 group-hover:border-blue-200/70">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-extrabold text-[#0F2E5C] flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-base text-[#F5A623]">lightbulb</span>
                        Recommended Course
                      </span>
                      {courseTitle.includes(':') && (
                        <span className="bg-white border border-slate-200/80 text-[#0F2E5C] px-2 py-0.5 rounded-md text-[11px] font-mono font-bold shadow-2xs">
                          {courseTitle.split(':')[0]}
                        </span>
                      )}
                    </div>
                    
                    <h5 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-[#0F2E5C] transition-colors">
                      {courseTitle.includes(':') ? courseTitle.split(':').slice(1).join(':').trim() : courseTitle}
                    </h5>

                    <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex items-center justify-between">
                      <span className="text-[11px] font-medium text-slate-500">MoSPI NSSTA Calendar</span>
                      <span className="text-xs font-extrabold text-[#F5A623] group-hover:text-[#D98E18] flex items-center gap-1 transition-colors">
                        Start Learning
                        <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center bg-surface-container-lowest border border-outline-variant rounded-xl text-sm text-on-surface-variant">
            No skill gaps identified. Your current competency levels match or exceed all required standards!
          </div>
        )}
      </div>
    </div>
  );
}
