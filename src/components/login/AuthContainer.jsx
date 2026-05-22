// /pages/components/AuthContainer.jsx (Corrected and Final)

import React, { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import BusinessDetailsForm from './BusinessDetailsForm';
import { useAuth } from '../../context/AuthContext';

const stepSubtitle = {
  login: 'Welcome back! Sign in to your account',
  signup: 'Create your account to get started',
  'business-details': 'Complete your business profile',
};

const AuthContainer = () => {
  const { login } = useAuth();
  const [currentStep, setCurrentStep] = useState('login');
  const [signupData, setSignupData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
      login(data.user);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleSignup = (data) => {
    setError('');
    setSignupData(data);
    setCurrentStep('business-details');
  };

  const handleBusinessDetails = async (businessData) => {
    setIsLoading(true);
    setError('');
    if (!signupData) {
      setError('User details are missing. Please go back.');
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
    <div className="ds-auth-shell flex-col gap-8">
      <div className="w-full max-w-lg text-center px-4">
        <h1 className="ds-display-hero">Invobook</h1>
        <p className="ds-body-large mt-4">{stepSubtitle[currentStep]}</p>
      </div>

      <div className="ds-auth-card w-full max-w-md">
        {currentStep === 'login' && (
          <LoginForm
            onLogin={handleLogin}
            isLoading={isLoading}
            error={error}
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

      <p className="text-sm text-[var(--ds-gray-500)] text-center">
        © 2025 Invobook. Secure and reliable invoicing solution.
      </p>
    </div>
  );
};

export default AuthContainer;
