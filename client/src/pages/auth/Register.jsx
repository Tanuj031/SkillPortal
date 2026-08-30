import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function Register({ onNavigateToLogin, onRegisterSuccess }) {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'cso',
    division: 'National Accounts Division',
    designation: '',
    experience: '',
    department: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Compute password strength
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: '', width: '0%' };
    if (pass.length < 6) return { score: 1, label: 'Weak', color: 'bg-red-500', width: '33%' };
    if (pass.length < 10) return { score: 2, label: 'Medium', color: 'bg-amber-500', width: '66%' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500', width: '100%' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) {
      setServerError('');
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Official Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email (e.g. name@mospi.gov.in)';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    if (!['cso', 'nsso', 'admin'].includes(formData.role)) {
      newErrors.role = 'Please select a valid role (CSO, NSSO, or Admin)';
    }

    if (!formData.designation) {
      newErrors.designation = 'Please select a designation';
    }

    if (!formData.department) {
      newErrors.department = 'Please select a department / division';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setServerError('');

    const result = await register(formData);
    setIsLoading(false);

    if (result.success) {
      if (onRegisterSuccess) {
        onRegisterSuccess(result.user);
      }
    } else {
      setServerError(result.error || 'Registration failed.');
    }
  };

  return (
    <div className="bg-[#f2f4f6] text-[#191c1e] min-h-screen flex flex-col font-['Inter',sans-serif] antialiased">
      {/* Top Header */}
      <header className="bg-[#f7f9fb] border-b border-[#c4c6cf] w-full top-0 z-50">
        <div className="flex justify-between items-center px-4 md:px-12 py-4 w-full max-w-[1280px] mx-auto">
          <div className="flex items-center gap-3 cursor-pointer">
            <span className="material-symbols-outlined text-[#002046] text-2xl" data-icon="account_balance">
              account_balance
            </span>
            <div className="flex flex-col">
              <span className="text-[20px] md:text-[24px] font-bold text-[#002046] leading-tight">
                MoSPI Skill Platform
              </span>
              <span className="text-[10px] tracking-wider uppercase font-semibold text-[#006a6a]">
                Ministry of Statistics and Programme Implementation
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4 md:p-12 w-full max-w-[1280px] mx-auto">
        <div className="w-full max-w-lg bg-white border border-[#c4c6cf] rounded-xl overflow-hidden shadow-[0px_4px_12px_rgba(27,54,93,0.08)]">
          {/* Banner Header */}
          <div className="px-6 py-8 border-b border-[#c4c6cf] bg-[#eceef0] flex flex-col items-center justify-center text-center">
            <div className="bg-[#d6e3ff] w-16 h-16 rounded-full flex items-center justify-center mb-3 shadow-inner">
              <span className="material-symbols-outlined text-[#002046] text-3xl" data-icon="person_add">
                person_add
              </span>
            </div>
            <h1 className="text-[24px] md:text-[28px] font-bold text-[#191c1e] mb-1">Create Account</h1>
            <p className="text-[14px] text-[#44474e]">Register to access institutional training resources.</p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5" noValidate>
            {serverError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-red-600">error</span>
                <span>{serverError}</span>
              </div>
            )}

            {/* Full Name */}
            <div className="space-y-1">
              <label className="block text-[14px] font-semibold text-[#191c1e]" htmlFor="fullName">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-[#74777f] text-[18px]" data-icon="person">
                    person
                  </span>
                </div>
                <input
                  className={`block w-full pl-10 pr-3 py-2.5 bg-white border ${
                    errors.fullName ? 'border-[#ba1a1a] ring-1 ring-[#ba1a1a]/20' : 'border-[#E2E8F0]'
                  } rounded-md text-[15px] text-[#191c1e] placeholder-[#44474e]/50 focus:border-[#006a6a] focus:ring-2 focus:ring-[#006a6a]/20 focus:outline-none transition-all`}
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Rahul Sharma"
                  type="text"
                  autoComplete="name"
                />
              </div>
              {errors.fullName && <p className="text-[12px] text-[#ba1a1a] mt-0.5">{errors.fullName}</p>}
            </div>

            {/* Email Field */}
            <div className="space-y-1">
              <label className="block text-[14px] font-semibold text-[#191c1e]" htmlFor="email">
                Official Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-[#74777f] text-[18px]" data-icon="mail">
                    mail
                  </span>
                </div>
                <input
                  className={`block w-full pl-10 pr-3 py-2.5 bg-white border ${
                    errors.email ? 'border-[#ba1a1a] ring-1 ring-[#ba1a1a]/20' : 'border-[#E2E8F0]'
                  } rounded-md text-[15px] text-[#191c1e] placeholder-[#44474e]/50 focus:border-[#006a6a] focus:ring-2 focus:ring-[#006a6a]/20 focus:outline-none transition-all`}
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@mospi.gov.in"
                  type="email"
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="text-[12px] text-[#ba1a1a] mt-0.5">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="block text-[14px] font-semibold text-[#191c1e]" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-[#74777f] text-[18px]" data-icon="lock">
                    lock
                  </span>
                </div>
                <input
                  className={`block w-full pl-10 pr-10 py-2.5 bg-white border ${
                    errors.password ? 'border-[#ba1a1a] ring-1 ring-[#ba1a1a]/20' : 'border-[#E2E8F0]'
                  } rounded-md text-[15px] text-[#191c1e] placeholder-[#44474e]/50 focus:border-[#006a6a] focus:ring-2 focus:ring-[#006a6a]/20 focus:outline-none transition-all`}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                />
                <button
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#74777f] hover:text-[#191c1e] transition-colors focus:outline-none cursor-pointer"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="space-y-1 pt-1">
                  <div className="w-full bg-[#e0e3e5] h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: passwordStrength.width }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-[#44474e]">
                    <span>Must be at least 8 characters long.</span>
                    <span className="font-semibold">{passwordStrength.label}</span>
                  </div>
                </div>
              )}
              {errors.password && <p className="text-[12px] text-[#ba1a1a] mt-0.5">{errors.password}</p>}
            </div>

            {/* Role Selection Field (Required: CSO / NSSO / Admin) */}
            <div className="space-y-1.5">
              <label className="block text-[14px] font-semibold text-[#191c1e]" htmlFor="role">
                User Role <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleChange({ target: { name: 'role', value: 'cso' } });
                    handleChange({ target: { name: 'division', value: 'National Accounts Division' } });
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    formData.role === 'cso'
                      ? 'bg-[#0F2E5C] text-white border-[#0F2E5C] shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">workspace_premium</span>
                  <span>CSO</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleChange({ target: { name: 'role', value: 'nsso' } });
                    handleChange({ target: { name: 'division', value: 'Field Operations Division' } });
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    formData.role === 'nsso'
                      ? 'bg-teal-800 text-white border-teal-800 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">analytics</span>
                  <span>NSSO</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleChange({ target: { name: 'role', value: 'admin' } });
                    handleChange({ target: { name: 'division', value: '' } });
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    formData.role === 'admin'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                  <span>Admin</span>
                </button>
              </div>
              {errors.role && <p className="text-[12px] text-[#ba1a1a] mt-0.5">{errors.role}</p>}
            </div>

            {/* Conditional Division Field (CSO / NSSO Specific) */}
            {formData.role !== 'admin' && (
              <div className="space-y-1">
                <label className="block text-[14px] font-semibold text-[#191c1e]" htmlFor="division">
                  Division <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-[#74777f] text-[18px]">
                      account_tree
                    </span>
                  </div>
                  <select
                    className="block w-full pl-10 pr-10 py-2.5 bg-white border border-[#E2E8F0] rounded-md text-[15px] text-[#191c1e] appearance-none focus:border-[#006a6a] focus:ring-2 focus:ring-[#006a6a]/20 focus:outline-none transition-all cursor-pointer font-medium"
                    id="division"
                    name="division"
                    value={formData.division}
                    onChange={handleChange}
                  >
                    {formData.role === 'cso' && (
                      <>
                        <option value="National Accounts Division">National Accounts Division</option>
                        <option value="Industrial Statistics Division">Industrial Statistics Division</option>
                        <option value="Economic Census Division">Economic Census Division</option>
                        <option value="Social and Miscellaneous Statistics Division">Social and Miscellaneous Statistics Division</option>
                      </>
                    )}
                    {formData.role === 'nsso' && (
                      <>
                        <option value="Survey Design and Research Division">Survey Design and Research Division</option>
                        <option value="Field Operations Division">Field Operations Division</option>
                        <option value="Data Processing Division">Data Processing Division</option>
                        <option value="Coordination and Publication Division">Coordination and Publication Division</option>
                      </>
                    )}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-[#74777f]">
                    <span className="material-symbols-outlined text-[20px]">
                      expand_more
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Designation and Experience Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Designation Field */}
              <div className="space-y-1">
                <label className="block text-[14px] font-semibold text-[#191c1e]" htmlFor="designation">
                  Designation
                </label>
                <div className="relative">
                  <select
                    className={`block w-full pl-3 pr-10 min-h-[44px] py-2.5 bg-white border ${
                      errors.designation ? 'border-[#ba1a1a]' : 'border-[#E2E8F0]'
                    } rounded-md text-[15px] text-[#191c1e] appearance-none focus:border-[#006a6a] focus:ring-2 focus:ring-[#006a6a]/20 focus:outline-none transition-all cursor-pointer`}
                    id="designation"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                  >
                    <option disabled value="">
                      Select Title
                    </option>
                    <option value="director">Director</option>
                    <option value="deputy_director">Deputy Director</option>
                    <option value="assistant_director">Assistant Director</option>
                    <option value="statistical_officer">Statistical Officer</option>
                    <option value="other">Other</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-[#74777f]">
                    <span className="material-symbols-outlined text-[20px]" data-icon="expand_more">
                      expand_more
                    </span>
                  </div>
                </div>
                {errors.designation && <p className="text-[12px] text-[#ba1a1a] mt-0.5">{errors.designation}</p>}
              </div>

              {/* Experience Field */}
              <div className="space-y-1">
                <label className="block text-[14px] font-semibold text-[#191c1e]" htmlFor="experience">
                  Experience (Years)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-[#74777f] text-[18px]" data-icon="timeline">
                      timeline
                    </span>
                  </div>
                  <input
                    className="block w-full pl-10 pr-3 py-2.5 bg-white border border-[#E2E8F0] rounded-md text-[15px] text-[#191c1e] placeholder-[#44474e]/50 focus:border-[#006a6a] focus:ring-2 focus:ring-[#006a6a]/20 focus:outline-none transition-all"
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    max="50"
                    min="0"
                    placeholder="0"
                    type="number"
                  />
                </div>
              </div>
            </div>

            {/* Department Field */}
            <div className="space-y-1">
              <label className="block text-[14px] font-semibold text-[#191c1e]" htmlFor="department">
                Department / Division
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-[#74777f] text-[18px]" data-icon="corporate_fare">
                    corporate_fare
                  </span>
                </div>
                <select
                  className={`block w-full pl-10 pr-10 py-2.5 bg-white border ${
                    errors.department ? 'border-[#ba1a1a]' : 'border-[#E2E8F0]'
                  } rounded-md text-[15px] text-[#191c1e] appearance-none focus:border-[#006a6a] focus:ring-2 focus:ring-[#006a6a]/20 focus:outline-none transition-all cursor-pointer`}
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                >
                  <option disabled value="">
                    Select Division
                  </option>
                  <option value="csd">Central Statistics Office (CSO)</option>
                  <option value="nsso">National Sample Survey Office (NSSO)</option>
                  <option value="pi">Programme Implementation Wing</option>
                  <option value="admin">Administration</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-[#74777f]">
                  <span className="material-symbols-outlined text-[20px]" data-icon="expand_more">
                    expand_more
                  </span>
                </div>
              </div>
              {errors.department && <p className="text-[12px] text-[#ba1a1a] mt-0.5">{errors.department}</p>}
            </div>

            {/* Submit Action Area */}
            <div className="pt-3 border-t border-[#c4c6cf] mt-6 flex flex-col items-center gap-3">
              <button
                className="w-full bg-[#1b365d] text-white font-semibold text-[14px] py-3 px-6 rounded-md hover:bg-[#002046] transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-70 active:scale-[0.99]"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Create Account</span>
                    <span className="material-symbols-outlined text-[18px]" data-icon="arrow_forward">
                      arrow_forward
                    </span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="text-[14px] text-[#1b365d] hover:text-[#002046] underline hover:no-underline transition-all cursor-pointer"
              >
                Already have an account? Login here
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#c4c6cf] w-full bottom-0">
        <div className="flex flex-col md:flex-row justify-between items-center px-4 md:px-12 py-5 w-full max-w-[1280px] mx-auto gap-4 md:gap-0">
          <p className="text-[13px] text-[#191c1e] text-center md:text-left">
            © 2026 Ministry of Statistics and Programme Implementation (MoSPI). All rights reserved.
          </p>
          <div className="flex gap-4 items-center">
            <a className="text-[13px] text-[#44474e] hover:text-[#006a6a] transition-colors cursor-pointer" href="#support">
              Support
            </a>
            <span className="text-[#c4c6cf]">|</span>
            <a className="text-[13px] text-[#44474e] hover:text-[#006a6a] transition-colors cursor-pointer" href="#privacy">
              Privacy Policy
            </a>
            <span className="text-[#c4c6cf]">|</span>
            <a className="text-[13px] text-[#44474e] hover:text-[#006a6a] transition-colors cursor-pointer" href="#terms">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
