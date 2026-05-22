import React, { useState, useEffect } from 'react';
import { User, FileText, Palette, Bell, Shield, CreditCard, Package } from 'lucide-react';

import SettingsHeader from '../components/settings/SettingsHeader';
import ProfileSettings from '../components/settings/ProfileSettings';
import InvoiceSettings from '../components/settings/InvoiceSettings';
import TemplatesSettings from '../components/settings/TemplatesSettings';
import NotificationsSettings from '../components/settings/NotificationsSettings';
import InventorySettings from '../components/settings/InventorySettings';
import PlaceholderTab from '../components/settings/PlaceholderTab';
import { useInventory } from '../context/InventoryContext';
import { useToast } from '../context/ToastContext';
import { useRouter } from 'next/router';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const [profileData, setProfileData] = useState(null);
  const [invoiceSettings, setInvoiceSettings] = useState(null);
  const [notifications, setNotifications] = useState(null);
  
  const { setInventoryEnabled: setGlobalInventoryEnabled } = useInventory();
  const { toast } = useToast();
  const router = useRouter();

  // Handle direct tab navigation via URL query params
  useEffect(() => {
    if (router.isReady && router.query.tab) {
      setActiveTab(router.query.tab);
    }
  }, [router.isReady, router.query.tab]);

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
          inventoryEnabled: fetchedProfile.inventoryEnabled || false,
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
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ];

  const renderContent = () => {
    if (isLoadingData) {
      return (
        <div className="ds-card-static">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-[var(--ds-gray-100)] rounded w-1/3"></div>
            <div className="h-4 bg-[var(--ds-gray-100)] rounded w-full"></div>
            <div className="h-4 bg-[var(--ds-gray-100)] rounded w-3/4"></div>
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
      case 'inventory':
        return <InventorySettings 
                 inventoryEnabled={profileData.inventoryEnabled} 
                 setInventoryEnabled={async (val) => {
                   // Update local form state
                   setProfileData(prev => ({...prev, inventoryEnabled: val}));
                   // Instantly update global context so sidebar reacts immediately
                   setGlobalInventoryEnabled(val);
                   
                   // Give a toast notification
                   toast(val ? 'Inventory Management enabled' : 'Inventory Management disabled');
                   
                   // Auto-save to database immediately
                   try {
                     await fetch('/api/profile', {
                       method: 'PUT',
                       headers: { 'Content-Type': 'application/json' },
                       body: JSON.stringify({...profileData, inventoryEnabled: val}),
                     });
                   } catch (err) {
                     console.error('Failed to auto-save inventory setting', err);
                     toast('Failed to save setting');
                   }
                 }} 
               />;
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
    <div className="ds-page-inner">
      <SettingsHeader
        onSave={handleSaveChanges}
        isLoading={isSaving}
        statusMessage={statusMessage}
        hideSaveButton={activeTab === 'inventory'}
      />

      {/* Horizontal Tab Navigation */}
      <div className="mb-8 -mt-2 overflow-x-auto" style={{ borderBottom: '1px solid var(--ds-gray-100)' }}>
        <nav className="flex gap-0 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap"
                style={{
                  color: isActive ? 'var(--ds-black)' : 'var(--ds-gray-400)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  borderBottom: isActive ? '3px solid var(--ds-black)' : '2px solid transparent',
                  marginBottom: '-1px',
                }}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {renderContent()}
      </div>
    </div>
  );
};

export default SettingsPage;