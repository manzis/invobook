import React from 'react';
import { Building, Upload, Mail, Phone } from 'lucide-react';

// Accept the new logoUrl prop
const BusinessDetails = ({ logoUrl, businessName, businessAddress, businessCity, businessEmail, businessPhone, onFieldChange, onLogoUpload }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">From (Your Business)</h3>
        <Building className="w-4 h-4 text-gray-400" />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
        <div className="flex items-center space-x-4">
            {/* --- THIS IS THE KEY VISUAL CHANGE --- */}
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                {logoUrl ? (
                    <img src={logoUrl} alt="Business Logo" className="w-full h-full object-cover rounded-lg" />
                ) : (
                    <Building className="w-8 h-8 text-gray-400" />
                )}
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400">
                <input type="file" accept="image/*" onChange={onLogoUpload} className="hidden" id="logo-upload" />
                <label htmlFor="logo-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">{logoUrl ? 'Change Logo' : 'Upload Logo'}</p>
                </label>
            </div>
        </div>
      </div>

      <div className="space-y-3">
        {/* The value props are already correctly bound, no changes needed here */}
        <input type="text" placeholder="Business Name" value={businessName} onChange={(e) => onFieldChange('businessName', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
        <input type="text" placeholder="Address" value={businessAddress} onChange={(e) => onFieldChange('businessAddress', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
        <input type="text" placeholder="City, State ZIP" value={businessCity} onChange={(e) => onFieldChange('businessCity', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="email" placeholder="Email" value={businessEmail} onChange={(e) => onFieldChange('businessEmail', e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg" />
        </div>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="tel" placeholder="Phone" value={businessPhone} onChange={(e) => onFieldChange('businessPhone', e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export default BusinessDetails;