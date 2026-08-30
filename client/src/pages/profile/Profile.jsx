import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function Profile() {
  const { user } = useAuth();
  const [assignment, setAssignment] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  useEffect(() => {
    if (user && user.currentAssignment) {
      setAssignment(user.currentAssignment);
    }
  }, [user]);

  const handleSaveAssignment = async (e) => {
    e.preventDefault();
    if (!user || (!user.id && !user._id)) {
      setMessage('Please sign in to update your current assignment.');
      setMessageType('error');
      return;
    }

    const userId = user.id || user._id;
    setIsSaving(true);
    setMessage('');

    try {
      const res = await api.patch(`/api/users/${userId}/assignment`, {
        currentAssignment: assignment,
      });

      if (res.data && res.data.success) {
        setMessage('Current assignment updated successfully! Recommendation rankings updated.');
        setMessageType('success');
      } else {
        setMessage('Failed to update assignment.');
        setMessageType('error');
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error saving assignment. Please try again.');
      setMessageType('error');
    } finally {
      setIsSaving(false);
    }
  };

  const userName = user?.name || user?.fullName || 'Rahul Sharma';
  const userRole = user?.designation || 'Director';
  const userDept = user?.department || 'Central Statistics Office (CSO)';
  const userEmail = user?.email || 'director@mospi.gov.in';

  return (
    <div className="flex-1 bg-surface min-h-screen p-4 md:p-8 max-w-[1024px] mx-auto space-y-8">
      {/* Profile Header */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-2xl border-2 border-secondary shadow-md">
          {userName.split(' ').map((n) => n[0]).join('')}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl font-bold text-primary">{userName}</h2>
          <p className="text-sm font-semibold text-secondary mt-0.5">{userRole}</p>
          <p className="text-xs text-on-surface-variant mt-1">{userDept} • {userEmail}</p>
        </div>
        <div className="bg-teal-50 border border-teal-200 text-teal-800 px-4 py-2 rounded-lg text-xs font-semibold">
          Active Officer Profile
        </div>
      </div>

      {/* Current Assignment Section */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 md:p-8 shadow-sm space-y-6">
        <div className="border-b border-outline-variant pb-4">
          <h3 className="text-xl font-bold text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">assignment_ind</span>
            Current Assignment & Project Focus
          </h3>
          <p className="text-xs md:text-sm text-on-surface-variant mt-1">
            Specify your ongoing project assignment to receive tailored, assignment-aware course recommendations.
          </p>
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg text-xs font-semibold flex items-center gap-2 ${
              messageType === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            <span className="material-symbols-outlined text-sm">
              {messageType === 'success' ? 'check_circle' : 'error'}
            </span>
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSaveAssignment} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-on-surface" htmlFor="currentAssignment">
              Current Official Assignment
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">
                work
              </span>
              <input
                id="currentAssignment"
                name="currentAssignment"
                type="text"
                value={assignment}
                onChange={(e) => setAssignment(e.target.value)}
                placeholder="e.g. Census Analysis Project, GST Policy Review, e-Office Audit..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-outline-variant rounded-lg text-sm text-on-surface focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
              />
            </div>
            <p className="text-xs text-on-surface-variant">
              💡 <span className="font-semibold">Recommendation Tip:</span> Keywords like <code className="bg-slate-100 px-1 py-0.5 rounded text-primary">Census</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-primary">Policy</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-primary">Cyber</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-primary">Data</code>, or <code className="bg-slate-100 px-1 py-0.5 rounded text-primary">GST</code> will automatically boost matching course rankings.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-primary text-white font-semibold text-sm px-6 py-2.5 rounded-lg hover:bg-primary-container transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? (
                <span>Updating...</span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">save</span>
                  <span>Update Assignment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Basic Profile Details Section */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 md:p-8 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-primary border-b border-outline-variant pb-3">
          Officer Account Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-xs text-on-surface-variant font-semibold block">Full Name</span>
            <span className="font-medium text-on-surface">{userName}</span>
          </div>
          <div>
            <span className="text-xs text-on-surface-variant font-semibold block">Designation</span>
            <span className="font-medium text-on-surface">{userRole}</span>
          </div>
          <div>
            <span className="text-xs text-on-surface-variant font-semibold block">Department / Cadre</span>
            <span className="font-medium text-on-surface">{userDept}</span>
          </div>
          <div>
            <span className="text-xs text-on-surface-variant font-semibold block">Official Email</span>
            <span className="font-medium text-on-surface">{userEmail}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
