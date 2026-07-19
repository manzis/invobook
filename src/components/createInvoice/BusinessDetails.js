import React from 'react';
import { Building, Mail, Phone, Lock } from 'lucide-react';

const BusinessDetails = ({
  logoUrl,
  businessName,
  businessAddress,
  businessCity,
  businessEmail,
  businessPhone,
  invoiceType,
}) => {
  return (
    <div className="ds-card-static">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="ds-card-title text-[20px] flex items-center gap-2">
            {invoiceType === 'PURCHASE' ? 'To (Your Business)' : 'From (Your Business)'} <Lock className="w-3.5 h-3.5 text-[var(--ds-gray-400)]" />
          </h3>
          <p className="text-xs text-[var(--ds-gray-500)] mt-1">Edit these details in your settings.</p>
        </div>
        <Building className="w-4 h-4 text-[var(--ds-gray-400)]" />
      </div>

      <div className="mb-4">
        <label className="ds-form-label">Logo</label>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 ds-surface-muted rounded-lg flex items-center justify-center overflow-hidden border border-[var(--ds-gray-200)]">
            {logoUrl ? (
              <img src={logoUrl} alt="Business Logo" className="w-full h-full object-cover" />
            ) : (
              <Building className="w-8 h-8 text-[var(--ds-gray-400)]" />
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <input
          type="text"
          placeholder="Business Name"
          value={businessName || ''}
          readOnly
          className="ds-input opacity-70 bg-[var(--ds-gray-50)] cursor-not-allowed focus:!shadow-[var(--ds-shadow-ring)]"
        />
        <input
          type="text"
          placeholder="Address"
          value={businessAddress || ''}
          readOnly
          className="ds-input opacity-70 bg-[var(--ds-gray-50)] cursor-not-allowed focus:!shadow-[var(--ds-shadow-ring)]"
        />
        <input
          type="text"
          placeholder="City, State ZIP"
          value={businessCity || ''}
          readOnly
          className="ds-input opacity-70 bg-[var(--ds-gray-50)] cursor-not-allowed focus:!shadow-[var(--ds-shadow-ring)]"
        />
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ds-gray-400)] pointer-events-none" />
          <input
            type="email"
            placeholder="Email"
            value={businessEmail || ''}
            readOnly
            className="ds-input pl-10 opacity-70 bg-[var(--ds-gray-50)] cursor-not-allowed focus:!shadow-[var(--ds-shadow-ring)]"
          />
        </div>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ds-gray-400)] pointer-events-none" />
          <input
            type="tel"
            placeholder="Phone"
            value={businessPhone || ''}
            readOnly
            className="ds-input pl-10 opacity-70 bg-[var(--ds-gray-50)] cursor-not-allowed focus:!shadow-[var(--ds-shadow-ring)]"
          />
        </div>
      </div>
    </div>
  );
};

export default BusinessDetails;
