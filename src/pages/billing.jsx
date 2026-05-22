'use client';

import React, { useState } from 'react';
import Head from 'next/head';
import { Check, ShieldCheck, ArrowRight, Zap, Award, Building } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Billing() {
  const { user } = useAuth();
  const [selectedCycle, setSelectedCycle] = useState('monthly'); // 'monthly' | 'yearly'

  const plans = [
    {
      id: 'hobby',
      name: 'Hobby',
      description: 'Perfect for freelancers and side projects.',
      price: { monthly: 0, yearly: 0 },
      icon: Zap,
      features: [
        'Up to 5 active invoices / month',
        'Up to 3 active clients',
        'Standard PDF rendering & styling',
        'Stateless local data backups',
        'Single member account scope',
      ],
      cta: 'Current Plan',
      isCurrent: true,
      popular: false,
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'Advanced invoicing and reports for small businesses.',
      price: { monthly: 19, yearly: 15 },
      icon: Award,
      features: [
        'Unlimited invoices & drafts',
        'Unlimited clients & tracking profiles',
        'Premium customizable templates',
        'Automatic email updates to clients',
        'Full CSV/JSON exports & database HUD',
        'Priority email response support',
      ],
      cta: 'Upgrade to Pro',
      isCurrent: false,
      popular: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Complete custom compliance and multi-team flows.',
      price: { monthly: 99, yearly: 79 },
      icon: Building,
      features: [
        'Everything in Pro tier included',
        'Custom corporate domain routing',
        'Full REST API credentials key access',
        'Automated database transactions support',
        'Dedicated account representative',
        'SLA 99.9% invoice delivery guarantee',
      ],
      cta: 'Contact Sales',
      isCurrent: false,
      popular: false,
    },
  ];

  return (
    <>
      <Head>
        <title>Pricing & Plans — Invobook</title>
        <meta name="description" content="Choose the invoicing plan that suits your scope." />
      </Head>

      <div className="p-8 max-w-6xl mx-auto space-y-8 select-none">
        {/* Header segment */}
        <div className="text-center space-y-3 mt-4">
          <p className="ds-mono-label justify-center">Invobook Billing</p>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--ds-black)]">
            Upgrade your invoicing limits
          </h1>
          <p className="text-[var(--ds-gray-500)] text-sm max-w-md mx-auto">
            Choose a billing tier configured to suit your volume and automation requirements.
          </p>

          {/* Billing Cycle Toggle Switch */}
          <div className="flex justify-center pt-3">
            <div className="inline-flex items-center gap-1 p-1 bg-[var(--ds-gray-50)] border border-[var(--ds-gray-100)] rounded-full">
              <button
                type="button"
                onClick={() => setSelectedCycle('monthly')}
                className={`px-4 py-1.5 text-xs font-medium rounded-full cursor-pointer transition-all border-0 ${
                  selectedCycle === 'monthly'
                    ? 'bg-white text-[var(--ds-black)]'
                    : 'bg-transparent text-[var(--ds-gray-500)] hover:text-[var(--ds-black)]'
                }`}
                style={{
                  boxShadow: selectedCycle === 'monthly' ? '0px 1px 2px rgba(0,0,0,0.05)' : 'none',
                }}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setSelectedCycle('yearly')}
                className={`px-4 py-1.5 text-xs font-medium rounded-full cursor-pointer transition-all border-0 flex items-center gap-1.5 ${
                  selectedCycle === 'yearly'
                    ? 'bg-white text-[var(--ds-black)]'
                    : 'bg-transparent text-[var(--ds-gray-500)] hover:text-[var(--ds-black)]'
                }`}
                style={{
                  boxShadow: selectedCycle === 'yearly' ? '0px 1px 2px rgba(0,0,0,0.05)' : 'none',
                }}
              >
                Yearly
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 uppercase tracking-tight">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing grids block */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const priceVal = selectedCycle === 'monthly' ? plan.price.monthly : plan.price.yearly;

            return (
              <div
                key={plan.id}
                className="relative flex flex-col justify-between p-6 rounded-xl bg-white transition-all duration-200 border"
                style={{
                  borderColor: plan.popular ? 'var(--ds-black)' : 'var(--ds-gray-100)',
                  boxShadow: plan.popular
                    ? '0px 12px 24px rgba(0,0,0,0.04), 0px 4px 12px rgba(0,0,0,0.02)'
                    : '0px 4px 12px rgba(0,0,0,0.01)',
                }}
              >
                {/* Popular Ribbon badge */}
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--ds-black)] text-[var(--ds-white)] uppercase tracking-wider">
                    Most Popular
                  </span>
                )}

                <div>
                  {/* Plan Identifier */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center border"
                        style={{
                          borderColor: 'var(--ds-gray-100)',
                          background: plan.popular ? 'var(--ds-gray-50)' : 'transparent',
                        }}
                      >
                        <Icon className="w-4 h-4 text-[var(--ds-black)]" />
                      </div>
                      <h3 className="font-bold text-lg text-[var(--ds-black)]">{plan.name}</h3>
                    </div>
                    {plan.isCurrent && (
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        Active Scope
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[var(--ds-gray-500)] mt-3 leading-relaxed">
                    {plan.description}
                  </p>

                  {/* Pricing detail */}
                  <div className="mt-5 pb-5 border-b border-[var(--ds-gray-100)] flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-[var(--ds-black)] tracking-tight">
                      ${priceVal}
                    </span>
                    <span className="text-xs text-[var(--ds-gray-500)]">
                      / month {selectedCycle === 'yearly' && 'billed annually'}
                    </span>
                  </div>

                  {/* Bullet features */}
                  <ul className="mt-5 space-y-3.5 list-none m-0 p-0">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-[var(--ds-gray-600)]">
                        <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pricing CTA Actions */}
                <div className="mt-8">
                  <button
                    type="button"
                    disabled={plan.isCurrent}
                    className={`w-full h-9 rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                      plan.isCurrent
                        ? 'bg-[var(--ds-gray-50)] text-[var(--ds-gray-400)] border-[var(--ds-gray-100)] cursor-not-allowed'
                        : plan.popular
                        ? 'bg-[var(--ds-black)] text-[var(--ds-white)] border-[var(--ds-black)] hover:opacity-90'
                        : 'bg-white text-[var(--ds-black)] border-[var(--ds-gray-100)] hover:bg-[var(--ds-gray-50)]'
                    }`}
                  >
                    <span>{plan.cta}</span>
                    {!plan.isCurrent && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Guarantee and disclaimer footer segment */}
        <div
          className="rounded-xl p-6 border flex flex-col md:flex-row items-center justify-between gap-4 bg-[var(--ds-gray-50)]"
          style={{ borderColor: 'var(--ds-gray-100)' }}
        >
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-[var(--ds-gray-500)]" />
            <div>
              <h4 className="font-semibold text-sm text-[var(--ds-black)]">Secure payment gateway</h4>
              <p className="text-[var(--ds-gray-500)] text-xs mt-0.5">
                All transactions are encrypted and processed securely by Stripe. Cancel anytime.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-[var(--ds-gray-400)] uppercase">
            SSL encrypted connection
          </span>
        </div>
      </div>
    </>
  );
}
