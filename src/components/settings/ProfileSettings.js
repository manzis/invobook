
import React, { useState } from 'react';
import { User, Building, Mail, Phone, MapPin, Upload, Globe } from 'lucide-react';

const ProfileSettings = ({ data, setData }) => {
  const [previewUrl, setPreviewUrl] = useState(null);

  if (!data) {
    return <div>Loading profile form...</div>;
  }

  // No changes needed here, this generic handler works for the new fields too.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setData(prevData => ({ ...prevData, logoFile: file }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const logoSource = previewUrl || data.logoUrl;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile & Company</h3>
        
        <h4 className="text-md font-medium text-gray-800 mb-4 border-b border-gray-200 pb-2">Business Details</h4>
        
      
        {/* --- CORRECTED BUSINESS LOGO SECTION --- */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Business Logo</label>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
              {/* Use the definitive logoSource variable here */}
              {logoSource ? (
                <img 
                  src={logoSource} 
                  alt="Business Logo" 
                  className="w-full h-full object-cover rounded-lg"
                  // Log errors if the image URL is broken
                  onError={(e) => console.error("Error loading logo image:", e.target.src)}
                />
              ) : (
                // Show the default icon only if no logo source is available
                <Building className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <div>
              <input 
                type="file" 
                id="logo-upload" 
                className="hidden" 
                accept="image/png, image/jpeg"
                onChange={handleLogoChange}
              />
              <label 
                htmlFor="logo-upload"
                className="cursor-pointer flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Upload className="w-4 h-4" />
                {/* Change button text based on whether a logo exists */}
                <span>{logoSource ? 'Change Logo' : 'Upload Logo'}</span>
              </label>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB. {data.logoFile?.name}</p>
            </div>
          </div>
        </div>
        
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" name="company" value={data.company || ''} onChange={handleChange} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"/>
            </div>
          </div>

          {/* Tax ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tax ID</label>
            <input type="text" name="taxId" value={data.taxId || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg"/>
          </div>

          {/* Address (Spanning full width) */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" name="address" value={data.address || ''} onChange={handleChange} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"/>
            </div>
          </div>
          
          {/* --- NEW: SEPARATED CITY, STATE, AND ZIP FIELDS --- */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input type="text" name="city" value={data.city || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg"/>
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
              <input type="text" name="state" value={data.state || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg"/>
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code</label>
              <input type="text" name="zipCode" value={data.zipCode || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg"/>
            </div>
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
            <div className="relative">
               <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
               <input type="url" name="website" value={data.website || ''} onChange={handleChange} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg" placeholder="https://..."/>
            </div>
          </div>
          
          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="tel" name="phone" value={data.phone || ''} onChange={handleChange} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"/>
            </div>
          </div>
        </div>

        {/* --- Personal Information Section (no changes) --- */}
        <h4 className="text-md font-medium text-gray-800 mt-8 mb-4 border-b border-gray-200 pb-2">Personal Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" name="name" value={data.name || ''} onChange={handleChange} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"/>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              {/* Added readOnly and bg-gray-50 as email shouldn't be changed here */}
              <input type="email" name="email" value={data.email || ''} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed" readOnly/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;

