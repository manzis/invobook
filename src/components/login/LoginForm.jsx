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
    onLogin(email, password); // Pass data up to the parent
  };

  return (
    <div className="p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-gray-400" /></div>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your email" required />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-gray-400" /></div>
            <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your password" required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {showPassword ? <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" /> : <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />}
            </button>
          </div>
        </div>

        {/* Forgot Password and Error */}
        <div className="flex justify-end"><button type="button" className="text-sm text-blue-600 hover:text-blue-700 font-medium">Forgot password?</button></div>
        {error && <div className="text-center text-red-500 text-sm">{error}</div>}

        {/* Submit Button */}
        <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50">
          {isLoading ? (<div className="flex items-center justify-center"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>Signing in...</div>) : ('Sign In')}
        </button>
      </form>

      {/* Divider, Social, and Switch to Signup */}
      <div className="mt-8 mb-6"><div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div><div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-gray-500">Or continue with</span></div></div></div>
      <SocialLoginButtons onSocialLogin={onSocialLogin} />
      <div className="mt-8 text-center"><p className="text-sm text-gray-600">Don't have an account?{' '}<button onClick={onSwitchToSignup} className="text-blue-600 hover:text-blue-700 font-medium">Sign up</button></p></div>
    </div>
  );
};

export default LoginForm;