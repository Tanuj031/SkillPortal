import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function Login({ onNavigateToRegister, onNavigateToForgotPassword, onLoginSuccess }) {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) {
      setServerError('');
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setServerError('');

    const result = await login(formData.email, formData.password);
    setIsLoading(false);

    if (result.success) {
      if (onLoginSuccess) {
        onLoginSuccess(result.user);
      }
    } else {
      setServerError(result.error || 'Login failed. Please check credentials.');
    }
  };

  return (
    <div className="bg-[#f2f4f6] text-[#191c1e] min-h-screen flex flex-col font-['Inter',sans-serif] antialiased">
      {/* Top Header */}
      <header className="bg-[#f7f9fb] border-b border-[#c4c6cf] w-full top-0">
        <div className="flex justify-between items-center px-4 md:px-12 py-4 w-full max-w-[1280px] mx-auto">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-[#002046] text-2xl" data-icon="account_balance">
              account_balance
            </span>
            <div className="flex flex-col">
              <h1 className="text-[20px] md:text-[24px] font-bold text-[#002046] leading-tight">
                MoSPI Skill Platform
              </h1>
              <span className="text-[10px] tracking-wider uppercase font-semibold text-[#006a6a]">
                Ministry of Statistics and Programme Implementation
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4 md:p-12">
        <div className="w-full max-w-md bg-white rounded-lg border border-[#c4c6cf] p-6 shadow-[0px_4px_12px_rgba(27,54,93,0.08)] flex flex-col gap-6 relative overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-32 h-32 bg-[#d6e3ff] rounded-full opacity-30 pointer-events-none blur-3xl" />

          {/* Heading */}
          <div className="text-center flex flex-col gap-2 pt-2">
            <span
              className="material-symbols-outlined text-[48px] text-[#002046] mx-auto mb-1"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              lock_person
            </span>
            <h2 className="text-[24px] md:text-[30px] font-bold text-[#002046]">Sign In</h2>
            <p className="text-[14px] text-[#44474e]">Access your learning and development dashboard.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            {serverError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-red-600">error</span>
                <span>{serverError}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="flex flex-col gap-1">
              <label className="text-[14px] font-semibold text-[#191c1e]" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#74777f] text-[20px] pointer-events-none">
                  mail
                </span>
                <input
                  className={`w-full pl-10 pr-3 min-h-[44px] py-2.5 bg-white border ${
                    errors.email ? 'border-[#ba1a1a] ring-1 ring-[#ba1a1a]/20' : 'border-[#c4c6cf]'
                  } rounded text-[15px] text-[#191c1e] placeholder:text-[#74777f]/60 focus:border-[#006a6a] focus:ring-2 focus:ring-[#006a6a]/20 focus:outline-none transition-all`}
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@mospi.gov.in"
                  type="email"
                  autoComplete="email"
                />
              </div>
              {errors.email && <span className="text-[12px] text-[#ba1a1a] mt-0.5">{errors.email}</span>}
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label className="text-[14px] font-semibold text-[#191c1e]" htmlFor="password">
                  Password
                </label>
                <button
                  type="button"
                  onClick={onNavigateToForgotPassword}
                  className="text-[12px] font-medium text-[#006a6a] hover:underline focus:outline-none cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#74777f] text-[20px] pointer-events-none">
                  key
                </span>
                <input
                  className={`w-full pl-10 pr-10 min-h-[44px] py-2.5 bg-white border ${
                    errors.password ? 'border-[#ba1a1a] ring-1 ring-[#ba1a1a]/20' : 'border-[#c4c6cf]'
                  } rounded text-[15px] text-[#191c1e] placeholder:text-[#74777f]/60 focus:border-[#006a6a] focus:ring-2 focus:ring-[#006a6a]/20 focus:outline-none transition-all`}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                />
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#74777f] hover:text-[#191c1e] focus:outline-none cursor-pointer p-1"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {errors.password && <span className="text-[12px] text-[#ba1a1a] mt-0.5">{errors.password}</span>}
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2 py-1">
              <input
                className="w-4 h-4 text-[#002046] bg-white border-[#c4c6cf] rounded focus:ring-[#006a6a]/20 cursor-pointer"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                type="checkbox"
              />
              <label className="text-[14px] text-[#44474e] cursor-pointer" htmlFor="rememberMe">
                Remember me for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <button
              className="w-full mt-2 min-h-[44px] py-3 bg-[#1b365d] text-white font-semibold text-[14px] rounded hover:bg-[#002046] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-70 active:scale-[0.99]"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Login</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Registration Redirect */}
          <div className="text-center mt-1 pb-1 border-t border-[#c4c6cf]/60 pt-4">
            <p className="text-[14px] text-[#44474e]">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onNavigateToRegister}
                className="text-[14px] font-semibold text-[#006a6a] hover:underline ml-1 focus:outline-none cursor-pointer"
              >
                Register here
              </button>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#c4c6cf] w-full bottom-0">
        <div className="flex flex-col md:flex-row justify-between items-center px-4 md:px-12 py-5 w-full max-w-[1280px] mx-auto gap-4 md:gap-0">
          <span className="text-[13px] text-[#44474e] text-center md:text-left">
            © 2026 Ministry of Statistics and Programme Implementation (MoSPI). All rights reserved.
          </span>
          <div className="flex gap-6">
            <a className="text-[13px] text-[#44474e] hover:text-[#006a6a] transition-colors cursor-pointer" href="#support">
              Support
            </a>
            <a className="text-[13px] text-[#44474e] hover:text-[#006a6a] transition-colors cursor-pointer" href="#privacy">
              Privacy Policy
            </a>
            <a className="text-[13px] text-[#44474e] hover:text-[#006a6a] transition-colors cursor-pointer" href="#terms">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
