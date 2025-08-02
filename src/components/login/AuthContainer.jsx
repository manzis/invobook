// /pages/components/AuthContainer.jsx (Corrected and Final)

import React, { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import BusinessDetailsForm from './BusinessDetailsForm';
import { Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AuthContainer = () => {
  const { login } = useAuth();
  const [currentStep, setCurrentStep] = useState('login');
  const [signupData, setSignupData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // --- LOGIN LOGIC (NOW LIVES IN THE PARENT) ---
  const handleLogin = async (email, password) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Login failed.');
      }
      login(data.user); // Call context login on success
    } catch (err) {
      setError(err.message);
      setIsLoading(false); // Only set loading to false on error
    }
  };

  // --- REGISTRATION LOGIC ---
  const handleSignup = (data) => {
    setError('');
    setSignupData(data);
    setCurrentStep('business-details');
  };

  const handleBusinessDetails = async (businessData) => {
    setIsLoading(true);
    setError('');
    if (!signupData) {
      setError("User details are missing. Please go back.");
      setIsLoading(false);
      return;
    }
    const fullRegistrationData = { ...signupData, ...businessData };
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullRegistrationData),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed.');
      }
      login(data.user);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    console.log('Social login:', provider);
  };
  
  const switchStep = (step) => {
    setError('');
    setCurrentStep(step);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">InvoiceGen</h1>
          <p className="text-gray-600">
            {currentStep === 'login' && 'Welcome back! Sign in to your account'}
            {currentStep === 'signup' && 'Create your account to get started'}
            {currentStep === 'business-details' && 'Complete your business profile'}
          </p>
        </div>

        {/* Auth Forms */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {currentStep === 'login' && (
            <LoginForm
              onLogin={handleLogin} // Pass the handler function down
              isLoading={isLoading} // Pass the loading state down
              error={error} // Pass the error state down
              onSocialLogin={handleSocialLogin}
              onSwitchToSignup={() => switchStep('signup')}
            />
          )}
          {currentStep === 'signup' && (
            <SignupForm
              onSignup={handleSignup}
              isLoading={isLoading}
              error={error}
              onSocialLogin={handleSocialLogin}
              onSwitchToLogin={() => switchStep('login')}
            />
          )}
          {currentStep === 'business-details' && (
            <BusinessDetailsForm
              onComplete={handleBusinessDetails}
              onBack={() => switchStep('signup')}
              isLoading={isLoading}
              error={error}
            />
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2025 InvoiceGen. Secure and reliable invoicing solution.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthContainer; 