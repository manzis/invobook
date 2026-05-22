import React, { useState } from 'react';
import { User, Building, Mail, Phone, MapPin, Upload, Globe } from 'lucide-react';

const iconClass =
  'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ds-gray-400)] pointer-events-none';

const ProfileSettings = ({ data, setData }) => {
  const [previewUrl, setPreviewUrl] = useState(null);

  if (!data) {
    return <div className="text-[var(--ds-gray-600)]">Loading profile form...</div>;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setData((prevData) => ({ ...prevData, logoFile: file }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const logoSource = previewUrl || data.logoUrl;

  return (
    <div className="space-y-6">
      <div className="ds-card-static">
        <h3 className="ds-card-title text-lg mb-6">Profile & Company</h3>

        <p className="ds-mono-label mb-4">Business Details</p>
        <hr className="ds-divider mb-6" />

        <div className="mb-6">
          <label className="ds-form-label">Business Logo</label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 ds-surface-muted rounded-[var(--ds-radius-button)] flex items-center justify-center overflow-hidden">
              {logoSource ? (
                <img
                  src={logoSource}
                  alt="Business Logo"
                  className="w-full h-full object-cover"
                  onError={(e) => console.error('Error loading logo image:', e.target.src)}
                />
              ) : (
                <Building className="w-8 h-8 text-[var(--ds-gray-400)]" />
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
              <label htmlFor="logo-upload" className="ds-btn-ghost gap-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>{logoSource ? 'Change Logo' : 'Upload Logo'}</span>
              </label>
              <p className="text-xs text-[var(--ds-gray-500)] mt-2">
                PNG, JPG up to 2MB. {data.logoFile?.name}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="ds-form-label">Company Name</label>
            <div className="relative">
              <Building className={iconClass} />
              <input
                type="text"
                name="company"
                value={data.company || ''}
                onChange={handleChange}
                className="ds-input pl-10"
              />
            </div>
          </div>

          <div>
            <label className="ds-form-label">Tax ID</label>
            <input
              type="text"
              name="taxId"
              value={data.taxId || ''}
              onChange={handleChange}
              className="ds-input"
            />
          </div>

          <div className="md:col-span-2">
            <label className="ds-form-label">Address</label>
            <div className="relative">
              <MapPin className={iconClass} />
              <input
                type="text"
                name="address"
                value={data.address || ''}
                onChange={handleChange}
                className="ds-input pl-10"
              />
            </div>
          </div>

          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="ds-form-label">City</label>
              <input
                type="text"
                name="city"
                value={data.city || ''}
                onChange={handleChange}
                className="ds-input"
              />
            </div>
            <div>
              <label className="ds-form-label">State</label>
              <input
                type="text"
                name="state"
                value={data.state || ''}
                onChange={handleChange}
                className="ds-input"
              />
            </div>
            <div>
              <label className="ds-form-label">Zip Code</label>
              <input
                type="text"
                name="zipCode"
                value={data.zipCode || ''}
                onChange={handleChange}
                className="ds-input"
              />
            </div>
          </div>

          <div>
            <label className="ds-form-label">Website</label>
            <div className="relative">
              <Globe className={iconClass} />
              <input
                type="url"
                name="website"
                value={data.website || ''}
                onChange={handleChange}
                className="ds-input pl-10"
                placeholder="https://..."
              />
            </div>
          </div>

          <div>
            <label className="ds-form-label">Phone</label>
            <div className="relative">
              <Phone className={iconClass} />
              <input
                type="tel"
                name="phone"
                value={data.phone || ''}
                onChange={handleChange}
                className="ds-input pl-10"
              />
            </div>
          </div>
        </div>

        <p className="ds-mono-label mt-8 mb-4">Personal Information</p>
        <hr className="ds-divider mb-6" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="ds-form-label">Full Name</label>
            <div className="relative">
              <User className={iconClass} />
              <input
                type="text"
                name="name"
                value={data.name || ''}
                onChange={handleChange}
                className="ds-input pl-10"
              />
            </div>
          </div>
          <div>
            <label className="ds-form-label">Email</label>
            <div className="relative">
              <Mail className={iconClass} />
              <input
                type="email"
                name="email"
                value={data.email || ''}
                className="ds-input pl-10 ds-surface-muted cursor-not-allowed opacity-80"
                readOnly
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
