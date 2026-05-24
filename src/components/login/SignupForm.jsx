// /pages/components/SignupForm.jsx (or wherever your component is located)

import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import SocialLoginButtons from './SocialLoginButtons';

const SignupForm = ({ onSignup, onSocialLogin, onSwitchToLogin, isLoading, error }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSignup({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    });
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const inputClass = (field) =>
    validationErrors[field] ? 'ds-input ds-input-error' : 'ds-input';

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="name" className="ds-form-label">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-4 w-4 text-[var(--ds-gray-400)]" />
            </div>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`${inputClass('name')} pl-10`}
              placeholder="Enter your full name"
              required
            />
          </div>
          {validationErrors.name && (
            <p className="mt-1 text-sm text-[var(--ds-ship-red)]">{validationErrors.name}</p>
          )}
        </div>

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
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`${inputClass('email')} pl-10`}
              placeholder="Enter your email"
              required
            />
          </div>
          {validationErrors.email && (
            <p className="mt-1 text-sm text-[var(--ds-ship-red)]">{validationErrors.email}</p>
          )}
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
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={`${inputClass('password')} pl-10 pr-12`}
              placeholder="Create a password (min. 8 characters)"
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
          {validationErrors.password && (
            <p className="mt-1 text-sm text-[var(--ds-ship-red)]">{validationErrors.password}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="ds-form-label">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-[var(--ds-gray-400)]" />
            </div>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className={`${inputClass('confirmPassword')} pl-10 pr-12`}
              placeholder="Confirm your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="ds-icon-btn absolute inset-y-0 right-1 my-auto"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {validationErrors.confirmPassword && (
            <p className="mt-1 text-sm text-[var(--ds-ship-red)]">
              {validationErrors.confirmPassword}
            </p>
          )}
        </div>

        <div className="flex items-start gap-3">
          <input
            id="terms"
            type="checkbox"
            required
            className="mt-1 h-4 w-4 rounded accent-[var(--ds-black)]"
          />
          <label htmlFor="terms" className="text-sm text-[var(--ds-gray-600)]">
            I agree to the{' '}
            <a href="#" className="ds-link">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="ds-link">
              Privacy Policy
            </a>
          </label>
        </div>

        {error && (
          <p className="text-center text-sm text-[var(--ds-ship-red)]">{error}</p>
        )}

        <button type="submit" disabled={isLoading} className="ds-btn-dark w-full">
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <span className="ds-spinner w-4 h-4 border-white/30 border-t-white" />
              Creating account...
            </span>
          ) : (
            'Create Account'
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
      <div className="mt-8 text-left">
        <p className="text-sm text-[var(--ds-gray-600)]">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="ds-link border-0 bg-transparent cursor-pointer p-0 inline"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignupForm;
