// /pages/components/LoginForm.jsx

import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import SocialLoginButtons from './SocialLoginButtons';

const LoginForm = ({ onLogin, onSocialLogin, onSwitchToSignup, isLoading, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="p-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="email" className="ds-form-label">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-4 w-4 text-[var(--ds-gray-400)]" />
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="ds-input pl-10"
              placeholder="Enter your email"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="ds-form-label">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-[var(--ds-gray-400)]" />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="ds-input pl-10 pr-12"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="ds-icon-btn absolute inset-y-0 right-1 my-auto"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="button" className="ds-link border-0 bg-transparent cursor-pointer p-0">
            Forgot password?
          </button>
        </div>

        {error && (
          <p className="text-center text-sm text-[var(--ds-ship-red)]">{error}</p>
        )}

        <button type="submit" disabled={isLoading} className="ds-btn-dark w-full">
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <span className="ds-spinner w-4 h-4 border-white/30 border-t-white" />
              Signing in...
            </span>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div className="mt-8 mb-6">
        <hr className="ds-divider" />
        <p className="text-center text-sm text-[var(--ds-gray-500)] -mt-3">
          <span className="bg-[var(--ds-white)] px-4">Or continue with</span>
        </p>
      </div>
      <SocialLoginButtons onSocialLogin={onSocialLogin} />
      <div className="mt-8 text-center">
        <p className="text-sm text-[var(--ds-gray-600)]">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="ds-link border-0 bg-transparent cursor-pointer p-0 inline"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
