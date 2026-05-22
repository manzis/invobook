// /pages/components/BusinessDetailsForm.jsx (or wherever your component is located)

import React, { useState } from 'react';
import { Building2, MapPin, Phone, Globe, ArrowLeft, Check } from 'lucide-react';

const BusinessDetailsForm = ({ onComplete, onBack, isLoading, error }) => {
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    phone: '',
    website: '',
    taxId: '',
  });

  const businessTypes = [
    'Sole Proprietorship',
    'Partnership',
    'LLC',
    'Corporation',
    'Nonprofit',
    'Freelancer',
    'Other',
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onComplete(formData);
  };

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={onBack}
          className="ds-icon-btn shrink-0"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="ds-card-title">Business Details</h2>
          <p className="text-sm text-[var(--ds-gray-600)] mt-1">
            Complete your profile to start invoicing
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="businessName" className="ds-form-label">
            Business Name *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Building2 className="h-4 w-4 text-[var(--ds-gray-400)]" />
            </div>
            <input
              id="businessName"
              type="text"
              value={formData.businessName}
              onChange={(e) => handleInputChange('businessName', e.target.value)}
              className="ds-input pl-10"
              placeholder="Enter your business name"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="businessType" className="ds-form-label">
            Business Type *
          </label>
          <select
            id="businessType"
            value={formData.businessType}
            onChange={(e) => handleInputChange('businessType', e.target.value)}
            className="ds-select w-full"
            required
          >
            <option value="" disabled>
              Select business type
            </option>
            {businessTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="address" className="ds-form-label">
            Business Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-4 w-4 text-[var(--ds-gray-400)]" />
            </div>
            <input
              id="address"
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="ds-input pl-10"
              placeholder="Street address"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="city" className="ds-form-label">
              City
            </label>
            <input
              id="city"
              type="text"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className="ds-input"
              placeholder="City"
            />
          </div>
          <div>
            <label htmlFor="state" className="ds-form-label">
              State
            </label>
            <input
              id="state"
              type="text"
              value={formData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              className="ds-input"
              placeholder="State / Province"
            />
          </div>
          <div>
            <label htmlFor="zipCode" className="ds-form-label">
              ZIP Code
            </label>
            <input
              id="zipCode"
              type="text"
              value={formData.zipCode}
              onChange={(e) => handleInputChange('zipCode', e.target.value)}
              className="ds-input"
              placeholder="ZIP / Postal"
            />
          </div>
        </div>

        <div>
          <label htmlFor="country" className="ds-form-label">
            Country
          </label>
          <select
            id="country"
            value={formData.country}
            onChange={(e) => handleInputChange('country', e.target.value)}
            className="ds-select w-full"
          >
            <option value="US">Nepal</option>
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="GB">United Kingdom</option>
            <option value="AU">Australia</option>
            <option value="DE">Germany</option>
            <option value="FR">France</option>
            <option value="IN">India</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="phone" className="ds-form-label">
            Phone Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-4 w-4 text-[var(--ds-gray-400)]" />
            </div>
            <input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="ds-input pl-10"
              placeholder="Business phone number"
            />
          </div>
        </div>

        <div>
          <label htmlFor="website" className="ds-form-label">
            Website
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Globe className="h-4 w-4 text-[var(--ds-gray-400)]" />
            </div>
            <input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              className="ds-input pl-10"
              placeholder="https://yourwebsite.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="taxId" className="ds-form-label">
            Tax ID / EIN (Optional)
          </label>
          <input
            id="taxId"
            type="text"
            value={formData.taxId}
            onChange={(e) => handleInputChange('taxId', e.target.value)}
            className="ds-input"
            placeholder="Tax identification number"
          />
        </div>

        {error && (
          <p className="text-center text-sm text-[var(--ds-ship-red)]">{error}</p>
        )}

        <button
          type="submit"
          disabled={isLoading || !formData.businessName || !formData.businessType}
          className="ds-btn-dark w-full"
        >
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <span className="ds-spinner w-4 h-4 border-white/30 border-t-white" />
              Setting up your account...
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              <Check className="h-4 w-4" />
              Complete Setup
            </span>
          )}
        </button>
      </form>

      <div className="mt-6 ds-surface-muted rounded-[var(--ds-radius-card)] p-4">
        <p className="text-sm text-[var(--ds-gray-600)]">
          <strong className="text-[var(--ds-black)]">Note:</strong> You can update these details
          anytime from your account settings. Only business name and type are required to get
          started.
        </p>
      </div>
    </div>
  );
};

export default BusinessDetailsForm;
