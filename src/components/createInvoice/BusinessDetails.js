import React from 'react';
import { Building, Upload, Mail, Phone } from 'lucide-react';

const BusinessDetails = ({
  logoUrl,
  businessName,
  businessAddress,
  businessCity,
  businessEmail,
  businessPhone,
  onFieldChange,
  onLogoUpload,
}) => {
  return (
    <div className="ds-card-static">
      <div className="flex items-center justify-between mb-4">
        <h3 className="ds-card-title text-[20px]">From (Your Business)</h3>
        <Building className="w-4 h-4 text-[var(--ds-gray-400)]" />
      </div>

      <div className="mb-4">
        <label className="ds-form-label">Logo</label>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 ds-surface-muted rounded-lg flex items-center justify-center overflow-hidden">
            {logoUrl ? (
              <img src={logoUrl} alt="Business Logo" className="w-full h-full object-cover" />
            ) : (
              <Building className="w-8 h-8 text-[var(--ds-gray-400)]" />
            )}
          </div>
          <div className="flex-1 ds-surface-muted rounded-lg p-4 text-center ds-shadow-ring hover:shadow-[var(--ds-shadow-card)] transition-shadow">
            <input type="file" accept="image/*" onChange={onLogoUpload} className="hidden" id="logo-upload" />
            <label htmlFor="logo-upload" className="cursor-pointer block">
              <Upload className="w-8 h-8 text-[var(--ds-gray-400)] mx-auto mb-2" />
              <p className="text-sm text-[var(--ds-gray-600)]">{logoUrl ? 'Change Logo' : 'Upload Logo'}</p>
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <input
          type="text"
          placeholder="Business Name"
          value={businessName}
          onChange={(e) => onFieldChange('businessName', e.target.value)}
          className="ds-input"
        />
        <input
          type="text"
          placeholder="Address"
          value={businessAddress}
          onChange={(e) => onFieldChange('businessAddress', e.target.value)}
          className="ds-input"
        />
        <input
          type="text"
          placeholder="City, State ZIP"
          value={businessCity}
          onChange={(e) => onFieldChange('businessCity', e.target.value)}
          className="ds-input"
        />
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ds-gray-400)] pointer-events-none" />
          <input
            type="email"
            placeholder="Email"
            value={businessEmail}
            onChange={(e) => onFieldChange('businessEmail', e.target.value)}
            className="ds-input pl-10"
          />
        </div>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ds-gray-400)] pointer-events-none" />
          <input
            type="tel"
            placeholder="Phone"
            value={businessPhone}
            onChange={(e) => onFieldChange('businessPhone', e.target.value)}
            className="ds-input pl-10"
          />
        </div>
      </div>
    </div>
  );
};

export default BusinessDetails;
