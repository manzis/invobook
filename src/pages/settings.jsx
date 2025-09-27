import React, { useState, useEffect } from 'react';
import { User, FileText, Palette, Bell, Shield, CreditCard } from 'lucide-react';

import SettingsHeader from '../components/settings/SettingsHeader';
import SettingsSidebar from '../components/settings/SettingsSidebar';
import ProfileSettings from '../components/settings/ProfileSettings';
import InvoiceSettings from '../components/settings/InvoiceSettings';
import TemplatesSettings from '../components/settings/TemplatesSettings';
import NotificationsSettings from '../components/settings/NotificationsSettings';
import PlaceholderTab from '../components/settings/PlaceholderTab';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const [profileData, setProfileData] = useState(null);
  const [invoiceSettings, setInvoiceSettings] = useState(null);
  const [notifications, setNotifications] = useState(null);

  useEffect(() => {
    const fetchAllSettings = async () => {
      setIsLoadingData(true);
      try {
        const [profileRes, invoiceRes] = await Promise.all([
          fetch('/api/profile'),
          fetch('/api/invoice-settings')
        ]);

        if (!profileRes.ok) throw new Error('Failed to fetch profile data.');
        if (!invoiceRes.ok) throw new Error('Failed to fetch invoice settings.');

        const fetchedProfile = await profileRes.json();
        const fetchedInvoiceSettings = await invoiceRes.json();

        // Populate state with the separated address fields
        setProfileData({
          name: fetchedProfile.name || '',
          email: fetchedProfile.email || '',
          phone: fetchedProfile.business?.phone || '',
          company: fetchedProfile.business?.businessName || '',
          address: fetchedProfile.business?.address || '',
          city: fetchedProfile.business?.city || '',
          state: fetchedProfile.business?.state || '',       // <-- ADDED
          zipCode: fetchedProfile.business?.zipCode || '',   // <-- ADDED
          website: fetchedProfile.business?.website || '',
          logoUrl: fetchedProfile.business?.logoUrl || null,
          taxId: fetchedProfile.business?.taxId || '',
        });

        setInvoiceSettings(fetchedInvoiceSettings);

        setNotifications({
          emailNotifications: true,
          paymentReminders: true,
          overdueAlerts: true,
          newClientAlerts: false,
        });

      } catch (error) {
        console.error("Error loading settings:", error);
        setStatusMessage('Error loading settings.');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchAllSettings();
  }, []);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setStatusMessage('');

    let profilePayload = { ...profileData };
    let invoicePayload = { ...invoiceSettings };

    try {
      if (profilePayload.logoFile) {
        setStatusMessage('Uploading logo...');

        const file = profilePayload.logoFile;
        const response = await fetch(
          `/api/avatar-upload?filename=${encodeURIComponent(file.name)}`,
          { method: 'POST', body: file }
        );

        const newBlob = await response.json();
        if (!response.ok) {
          throw new Error(newBlob.message || 'Logo upload failed.');
        }

        profilePayload.logoUrl = newBlob.url;
      }


       // --- Step 2: NEW - Handle Payment Image (QR Code) Upload ---
      // This block checks if a new payment image file has been selected.
      if (invoicePayload.paymentImageFile) {
        setStatusMessage('Uploading payment image...');
        const file = invoicePayload.paymentImageFile;

        // We reuse the same generic upload API
         const response = await fetch(
          `/api/avatar-upload?filename=${encodeURIComponent(file.name)}`,
          { method: 'POST', body: file }
        );

        const newBlob = await response.json();
        if (!response.ok) throw new Error(newBlob.message || 'Payment image upload failed.');

        // Set the returned URL on the payload that will be saved to the database.
        invoicePayload.paymentImageUrl = newBlob.url;
      }

      // Step 3: Clean up temporary file objects from the payloads
      delete profilePayload.logoFile;
      delete invoicePayload.paymentImageFile; // <-- This is important!

      setStatusMessage('Saving settings...');
      // The profilePayload now automatically includes city, state, and zipCode
      const [profileResponse, invoiceResponse] = await Promise.all([
        fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profilePayload),
        }),
        fetch('/api/invoice-settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(invoicePayload),
        })
      ]);

      if (!profileResponse.ok || !invoiceResponse.ok) {
        throw new Error('Failed to save one or more settings.');
      }

      setStatusMessage('Changes saved successfully!');

    } catch (error) {
      setStatusMessage(`Error: ${error.message}`);
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'invoice', label: 'Invoice Settings', icon: FileText },
    { id: 'templates', label: 'Templates', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ];

  const renderContent = () => {
    if (isLoadingData) {
      return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'profile':
        return <ProfileSettings data={profileData} setData={setProfileData} />;
      // ... other cases remain the same
      case 'invoice':
        return <InvoiceSettings data={invoiceSettings} setData={setInvoiceSettings} />;
      case 'templates':
        return <TemplatesSettings data={invoiceSettings} setData={setInvoiceSettings} />;
      case 'notifications':
        return <NotificationsSettings data={notifications} setData={setNotifications} />;
      case 'security':
        return <PlaceholderTab title="Security Settings" message="Security features coming soon..." />;
      case 'billing':
        return <PlaceholderTab title="Billing & Subscription" message="Billing management coming soon..." />;
      default:
        return <ProfileSettings data={profileData} setData={setProfileData} />;
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-4 md:p-8">
        <SettingsHeader
          onSave={handleSaveChanges}
          isLoading={isSaving}
          statusMessage={statusMessage}
        />
        <div className="flex flex-col lg:flex-row gap-8">
          <SettingsSidebar tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;