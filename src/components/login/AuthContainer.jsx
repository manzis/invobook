// /pages/components/AuthContainer.jsx (Corrected and Final)

import React, { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import BusinessDetailsForm from './BusinessDetailsForm';
import { useAuth } from '../../context/AuthContext';
import { FileText, CheckCircle2 } from 'lucide-react';

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
    <div className="flex min-h-screen w-full bg-white selection:bg-[var(--ds-black)] selection:text-white">

      {/* Left Column - Graphic/Brand (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 bg-[#FAFAFA] border-r border-gray-200 flex-col relative overflow-hidden">

        {/* Subtle dot pattern background */}
        <div
          className="absolute inset-0 z-0 pointer-events-none opacity-40"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, var(--ds-gray-400) 1px, transparent 0)', backgroundSize: '24px 24px' }}
        ></div>

        <div className="relative z-10 p-12 flex flex-col h-full justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[var(--ds-black)] text-white flex items-center justify-center rounded-lg font-bold text-lg">
              I
            </div>
            <span className="font-bold text-xl tracking-tight text-[var(--ds-black)]">Invobook</span>
          </div>

          {/* Graphic Area (Invoice Creation Mockup) */}
          <div className="flex-1 flex flex-col items-center justify-center my-12 w-full max-w-lg mx-auto">

            {/* Main Mockup Card */}
            <div className="bg-white border border-[var(--ds-gray-200)] rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full p-6 relative">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <div className="w-24 h-4 bg-[var(--ds-gray-200)] rounded mb-2"></div>
                  <div className="w-32 h-3 bg-[var(--ds-gray-100)] rounded"></div>
                </div>
                <div className="w-16 h-6 bg-emerald-50 border border-emerald-100 rounded-md"></div>
              </div>

              {/* Line Items */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center p-3 rounded-lg border border-[var(--ds-gray-100)] bg-[var(--ds-gray-50)]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-white border border-[var(--ds-gray-200)] flex items-center justify-center">
                      <FileText className="w-4 h-4 text-[var(--ds-gray-400)]" />
                    </div>
                    <div>
                      <div className="w-28 h-3 bg-[var(--ds-gray-300)] rounded mb-1"></div>
                      <div className="w-20 h-2 bg-[var(--ds-gray-200)] rounded"></div>
                    </div>
                  </div>
                  <div className="w-16 h-3 bg-[var(--ds-gray-300)] rounded"></div>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg border border-[var(--ds-gray-100)] bg-white opacity-60">
                  <div className="w-48 h-3 bg-[var(--ds-gray-100)] rounded"></div>
                  <div className="w-12 h-3 bg-[var(--ds-gray-100)] rounded"></div>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-end pt-4 border-t border-[var(--ds-gray-100)]">
                <div className="w-24 h-5 bg-[var(--ds-black)] rounded"></div>
              </div>

              {/* Floating success badge */}
              <div className="absolute -bottom-5 -right-5 bg-white border border-[var(--ds-gray-200)] shadow-lg rounded-xl p-3 flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[var(--ds-black)]">Invoice Sent</div>
                  <div className="text-[10px] text-[var(--ds-gray-500)]">Just now</div>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Text */}
          <div className="w-full max-w-lg mx-auto">
            <h2 className="text-3xl font-bold text-[var(--ds-black)] tracking-tight leading-tight mb-3">
              Professional Invoicing, <br /> Effortlessly Simple.
            </h2>
            <p className="text-[var(--ds-gray-500)] text-sm leading-relaxed max-w-sm">
              Create, send, and manage your invoices in one place. Get paid faster with stunning, client-ready templates.
            </p>
          </div>

        </div>
      </div>

      {/* Right Column - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 lg:px-24 py-12 bg-white relative">

        {/* Mobile Header (Hidden on Desktop) */}
        <div className="lg:hidden absolute top-8 left-6 flex items-center gap-2 mb-12">
          <div className="w-6 h-6 bg-[var(--ds-black)] text-white flex items-center justify-center rounded font-bold text-xs">
            I
          </div>
          <span className="font-bold text-lg tracking-tight text-[var(--ds-black)]">Invobook</span>
        </div>

        <div className="w-full sm:max-w-[400px] mx-auto mt-16 lg:mt-0">
          <div className="mb-8 text-left">
            <h1 className="text-2xl font-bold text-[var(--ds-black)] tracking-tight mb-2">
              {currentStep === 'login' ? 'Log In' : currentStep === 'signup' ? 'Create an Account' : 'Business Details'}
            </h1>
            <p className="text-[14px] text-[var(--ds-gray-500)]">{stepSubtitle[currentStep]}</p>
          </div>

          <div className="w-full">
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

          <div className="mt-12 text-left">
            <p className="text-xs text-[var(--ds-gray-400)]">
              © {new Date().getFullYear()} Invobook. Secure and reliable invoicing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthContainer;
