// /pages/settings.jsx (or wherever the file is located)

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
  const [isLoadingData, setIsLoadingData] = useState(true); // For initial data fetch
  const [isSaving, setIsSaving] = useState(false); // For the save button action
  const [statusMessage, setStatusMessage] = useState(''); // For feedback like "Saved!" or "Error!"

  // State will be initialized as null and fetched from the API
  const [profileData, setProfileData] = useState(null);
  const [invoiceSettings, setInvoiceSettings] = useState(null);
  const [notifications, setNotifications] = useState(null);

  // Fetch all settings data when the component mounts
  useEffect(() => {
    const fetchAllSettings = async () => {
      setIsLoadingData(true);
      try {
        // Use Promise.all to fetch data in parallel for better performance
        const [profileRes, invoiceRes] = await Promise.all([
          fetch('/api/profile'),
          fetch('/api/invoice-settings')
        ]);

        if (!profileRes.ok) throw new Error('Failed to fetch profile data.');
        if (!invoiceRes.ok) throw new Error('Failed to fetch invoice settings.');

        const fetchedProfile = await profileRes.json();
        const fetchedInvoiceSettings = await invoiceRes.json();
        
        // Populate the state with fetched profile data
        setProfileData({
          name: fetchedProfile.name || '',
          email: fetchedProfile.email || '', // Email is read-only
          phone: fetchedProfile.business?.phone || '', // <-- Get phone from business
          company: fetchedProfile.business?.businessName || '',
          address: fetchedProfile.business?.address || '',
          city: fetchedProfile.business?.city || '',
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
  }, []); // Empty array ensures this runs only once on mount
const handleSaveChanges = async () => {
  setIsSaving(true);
  setStatusMessage('');
  
  // Create a mutable copy of the profile data that we can modify
  let profilePayload = { ...profileData };

  try {
    // --- STEP 1: UPLOAD LOGO IF A NEW ONE EXISTS ---
    if (profilePayload.logoFile) {
      setStatusMessage('Uploading logo...');
      
      const file = profilePayload.logoFile;
      const response = await fetch(
        `/api/avatar-upload?filename=${encodeURIComponent(file.name)}`, // Use encodeURIComponent for safety
        { method: 'POST', body: file }
      );

      const newBlob = await response.json();
      if (!response.ok) {
        throw new Error(newBlob.message || 'Logo upload failed.');
      }
      
      // Add the new public URL to our payload object
      profilePayload.logoUrl = newBlob.url;
    }
    
    // Always remove the temporary file object before sending to the backend
    delete profilePayload.logoFile;

    // --- STEP 2: SAVE ALL SETTINGS ---
    setStatusMessage('Saving settings...');
    const [profileResponse, invoiceResponse] = await Promise.all([
      fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          
          // --- THIS IS THE FIX ---
          // Send the modified `profilePayload` object, not the original `profileData` state.
          body: JSON.stringify(profilePayload), 
      }),
      fetch('/api/invoice-settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(invoiceSettings),
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

  // --- Complete tabs array ---
  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'invoice', label: 'Invoice Settings', icon: FileText },
    { id: 'templates', label: 'Templates', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ];
  
  // --- Complete renderContent function ---
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
      case 'invoice':
        return <InvoiceSettings data={invoiceSettings} setData={setInvoiceSettings} />;
      case 'templates':
        return <TemplatesSettings />;
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
      <div className="p-8">
        <SettingsHeader 
          onSave={handleSaveChanges} 
          isLoading={isSaving} // Pass the correct loading state
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