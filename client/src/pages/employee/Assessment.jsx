import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function Assessment() {
  const { user } = useAuth();
  const [domains, setDomains] = useState([]);
  const [ratings, setRatings] = useState({}); // { [competencyId]: level }
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  useEffect(() => {
    const fetchFramework = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/api/competency/framework');
        if (res.data && res.data.success && Array.isArray(res.data.domains)) {
          setDomains(res.data.domains);

          // Initialize default rating (level 3) for each skill using real MongoDB _id
          const initialRatings = {};
          res.data.domains.forEach((d) => {
            d.skills?.forEach((skill) => {
              initialRatings[skill.id] = 3;
            });
          });
          setRatings(initialRatings);
        }
      } catch (err) {
        console.error('Error loading competency framework:', err);
        setMessage('Failed to load competency framework from backend.');
        setMessageType('error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFramework();
  }, []);

  const handleRatingChange = (competencyId, level) => {
    setRatings((prev) => ({
      ...prev,
      [competencyId]: level,
    }));
  };

  const handleSubmitAssessment = async (e) => {
    e.preventDefault();
    if (!user || (!user.id && !user._id)) {
      setMessage('Please sign in to submit your competency assessment.');
      setMessageType('error');
      return;
    }

    const userId = user.id || user._id;
    setIsSubmitting(true);
    setMessage('');

    // Format ratings array with real MongoDB competency IDs
    const ratingsArray = Object.entries(ratings).map(([competencyId, level]) => ({
      competencyId,
      level: Number(level),
    }));

    try {
      const res = await api.post('/api/competency/profile', {
        userId,
        ratings: ratingsArray,
      });

      if (res.data && res.data.success) {
        setMessage('🎉 Competency self-assessment submitted successfully! Profile updated.');
        setMessageType('success');
      } else {
        setMessage(res.data?.message || 'Failed to submit self-assessment.');
        setMessageType('error');
      }
    } catch (err) {
      console.error('Error submitting assessment:', err);
      setMessage(err.response?.data?.message || 'Error saving assessment. Please try again.');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 bg-surface min-h-screen p-4 md:p-8 max-w-[1280px] mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-outline-variant pb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-3xl">fact_check</span>
          Competency Self-Assessment
        </h2>
        <p className="text-xs md:text-sm text-on-surface-variant mt-1">
          Evaluate your current proficiency level across MoSPI’s official 4 competency domains (Level 1 = Basic, Level 5 = Expert).
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            messageType === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <span className="material-symbols-outlined text-base">
            {messageType === 'success' ? 'check_circle' : 'error'}
          </span>
          <span>{message}</span>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 animate-pulse h-48" />
          ))}
        </div>
      ) : (
        <form onSubmit={handleSubmitAssessment} className="space-y-8">
          {domains.map((domainGroup) => (
            <section
              key={domainGroup.domain}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm space-y-6"
            >
              <div className="flex justify-between items-center border-b border-outline-variant pb-3">
                <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider bg-surface-container-high text-primary px-3 py-1 rounded">
                    {domainGroup.domain}
                  </span>
                  <span>Domain Skills ({domainGroup.skills?.length || 0})</span>
                </h3>
              </div>

              <div className="space-y-6">
                {domainGroup.skills?.map((skill) => {
                  const currentLevel = ratings[skill.id] || 3;
                  return (
                    <div
                      key={skill.id}
                      className="p-4 bg-surface border border-outline-variant/70 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                    >
                      <div className="space-y-1 max-w-xl">
                        <h4 className="font-bold text-on-surface text-base">{skill.skillName}</h4>
                        <p className="text-xs text-on-surface-variant">{skill.description}</p>
                      </div>

                      {/* 1-5 Rating Selector */}
                      <div className="flex items-center gap-2 w-full md:w-auto">
                        <span className="text-xs font-semibold text-on-surface-variant mr-2 hidden sm:inline">
                          Proficiency:
                        </span>
                        <div className="flex items-center gap-1.5 flex-1 justify-between md:justify-start">
                          {[1, 2, 3, 4, 5].map((lvl) => (
                            <button
                              key={lvl}
                              type="button"
                              onClick={() => handleRatingChange(skill.id, lvl)}
                              className={`min-w-[44px] min-h-[44px] rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center ${
                                currentLevel === lvl
                                  ? 'bg-secondary text-white shadow-sm ring-2 ring-secondary/30 scale-105'
                                  : 'bg-white border border-outline-variant text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              {lvl}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#F5A623] hover:bg-[#D98E18] text-white font-bold text-sm px-8 py-3 rounded-xl transition-colors shadow-md disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Submitting Assessment...</span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">send</span>
                  <span>Submit Self-Assessment</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
