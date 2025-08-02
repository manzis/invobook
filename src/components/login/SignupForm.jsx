// /pages/components/SignupForm.jsx (or wherever your component is located)

import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import SocialLoginButtons from './SocialLoginButtons';

const SignupForm = ({ onSignup, onSocialLogin, onSwitchToLogin, isLoading, error }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
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
    
    // If the form is not valid, stop the submission
    if (!validateForm()) {
      return;
    }
    
    // The form is valid, so pass the core data up to the parent component.
    // The parent (AuthContainer) will handle switching to the next step.
    onSignup({
      name: formData.name,
      email: formData.email,
      password: formData.password
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear the specific error when the user starts typing again
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-5 w-5 text-gray-400" /></div>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.name ? 'border-red-300' : 'border-gray-200'}`}
              placeholder="Enter your full name"
              required
            />
          </div>
          {validationErrors.name && <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-gray-400" /></div>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.email ? 'border-red-300' : 'border-gray-200'}`}
              placeholder="Enter your email"
              required
            />
          </div>
          {validationErrors.email && <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>}
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-gray-400" /></div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={`block w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.password ? 'border-red-300' : 'border-gray-200'}`}
              placeholder="Create a password (min. 8 characters)"
              required
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {showPassword ? <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" /> : <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />}
            </button>
          </div>
          {validationErrors.password && <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-gray-400" /></div>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className={`block w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.confirmPassword ? 'border-red-300' : 'border-gray-200'}`}
              placeholder="Confirm your password"
              required
            />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" /> : <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />}
            </button>
          </div>
          {validationErrors.confirmPassword && <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>}
        </div>

        {/* Terms */}
        <div className="flex items-start">
          <input id="terms" type="checkbox" required className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
          <label htmlFor="terms" className="ml-3 text-sm text-gray-600">
            I agree to the <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Terms of Service</a> and <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Privacy Policy</a>
          </label>
        </div>
        
        {/* Display any API errors passed down from the parent (e.g., "Email already exists") */}
        {error && <p className="text-center text-sm text-red-600">{error}</p>}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Creating account...
            </div>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      {/* --- Rest of the component is the same --- */}
      <div className="mt-8 mb-6"><div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div><div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-gray-500">Or continue with</span></div></div></div>
      <SocialLoginButtons onSocialLogin={onSocialLogin} />
      <div className="mt-8 text-center"><p className="text-sm text-gray-600">Already have an account?{' '}<button onClick={onSwitchToLogin} className="text-blue-600 hover:text-blue-700 font-medium">Sign in</button></p></div>
    </div>
  );
};

export default SignupForm;