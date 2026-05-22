// /pages/edit-invoice/[invoiceId].js (The complete page for editing)

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router'; 
import EditInvoiceHeader from '../../components/createInvoice/EditInvoiceHeader';
import InvoiceDetails from '../../components/createInvoice/InvoiceDetails';
import BusinessDetails from '../../components/createInvoice/BusinessDetails';
import ClientDetails from '../../components/createInvoice/ClientDetails';
import InvoiceItems from '../../components/createInvoice/InvoiceItems';
import AdditionalInfo from '../../components/createInvoice/AdditionalInfo';
import InvoiceSummary from '../../components/createInvoice/InvoiceSummary';
import InvoicePreviewModal from '../../components/createInvoice/InvoicePreviewModal';
import { useToast } from '../../context/ToastContext';

const CURRENCY_SYMBOLS = {
  USD: '$', EUR: '€', JPY: '¥', GBP: '£',
  AUD: '$', CAD: '$', CHF: 'CHF', CNY: '¥',
  INR: '₹', BRL: 'R$', RUB: '₽', ZAR: 'R',
  SGD: '$', NZD: '$', NPR: 'Rs ',
};

const EditInvoiceSkeleton = () => (
  <div className="ds-page-inner animate-pulse">
    <div className="ds-page-header flex justify-between items-center mb-6">
      <div className="h-8 bg-[var(--ds-gray-100)] rounded-md w-48"></div>
      <div className="flex gap-3">
        <div className="w-24 h-[32px] bg-[var(--ds-gray-100)] rounded-md"></div>
        <div className="w-24 h-[32px] bg-[var(--ds-gray-100)] rounded-md"></div>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="ds-card-static p-6 space-y-4">
          <div className="h-6 bg-[var(--ds-gray-100)] rounded-md w-32 mb-2"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-10 bg-[var(--ds-gray-100)] rounded-md w-full"></div>
            <div className="h-10 bg-[var(--ds-gray-100)] rounded-md w-full"></div>
            <div className="h-10 bg-[var(--ds-gray-100)] rounded-md w-full"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="ds-card-static p-6 space-y-4">
            <div className="h-6 bg-[var(--ds-gray-100)] rounded-md w-40"></div>
            <div className="h-16 bg-[var(--ds-gray-100)] rounded-md w-full"></div>
            <div className="h-10 bg-[var(--ds-gray-100)] rounded-md w-full"></div>
            <div className="h-10 bg-[var(--ds-gray-100)] rounded-md w-full"></div>
          </div>
          <div className="ds-card-static p-6 space-y-4">
            <div className="h-6 bg-[var(--ds-gray-100)] rounded-md w-40"></div>
            <div className="h-10 bg-[var(--ds-gray-100)] rounded-md w-full"></div>
            <div className="h-10 bg-[var(--ds-gray-100)] rounded-md w-full"></div>
            <div className="h-10 bg-[var(--ds-gray-100)] rounded-md w-full"></div>
          </div>
        </div>
        
        <div className="ds-card-static p-6 space-y-4">
          <div className="h-6 bg-[var(--ds-gray-100)] rounded-md w-24"></div>
          <div className="h-12 bg-[var(--ds-gray-100)] rounded-md w-full"></div>
          <div className="h-[32px] bg-[var(--ds-gray-100)] rounded-md w-28"></div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="ds-card-static p-6 space-y-4">
          <div className="h-6 bg-[var(--ds-gray-100)] rounded-md w-32"></div>
          <div className="space-y-3 pt-2">
            <div className="flex justify-between"><div className="h-4 bg-[var(--ds-gray-100)] rounded-md w-16"></div><div className="h-4 bg-[var(--ds-gray-100)] rounded-md w-12"></div></div>
            <div className="flex justify-between"><div className="h-4 bg-[var(--ds-gray-100)] rounded-md w-16"></div><div className="h-4 bg-[var(--ds-gray-100)] rounded-md w-12"></div></div>
            <div className="flex justify-between border-t pt-2"><div className="h-5 bg-[var(--ds-gray-100)] rounded-md w-20"></div><div className="h-5 bg-[var(--ds-gray-100)] rounded-md w-16"></div></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const EditInvoicePage = () => {
  const router = useRouter();
  const { invoiceId } = router.query; // Get the ID from the URL
  const { toast } = useToast();
  
  const [invoiceData, setInvoiceData] = useState(null);
  const [allClients, setAllClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeTemplateName, setActiveTemplateName] = useState('modern-blue'); 

  // --- Reusable calculation logic (Copied from NewInvoicePage) ---
  const calculateTotals = useCallback((data) => {
    if (!data) return data;
    const subtotal = data.items.reduce((sum, item) => {
      return sum + (parseFloat(item.amount) || 0); // <-- KEY FIX HERE
    }, 0);
    const discountValue = parseFloat(data.discountValue) || 0;
    const taxRate = parseFloat(data.taxRate) || 0;
    const shippingCost = parseFloat(data.shippingCost) || 0;
    let discountAmount = 0;
    if (data.discountType === 'PERCENTAGE') {
      discountAmount = subtotal * (discountValue / 100);
    } else {
      discountAmount = discountValue;
    }
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * (taxRate / 100);
    const total = taxableAmount + taxAmount + shippingCost;
    return { ...data, subtotal, discountAmount, taxAmount, total };
  }, []);

  // --- KEY CHANGE: This useEffect now fetches a specific invoice ---
  useEffect(() => {
    // Don't run the fetch if the invoiceId isn't available yet
    if (!invoiceId) {
      return;
    }

    const fetchInvoiceData = async () => {
      setIsLoading(true);
      try {
        const [invoiceRes, clientsRes, settingsRes, templateRes, profileRes] = await Promise.all([
          fetch(`/api/updateInvoice/${invoiceId}`),
          fetch('/api/clients'),
          fetch('/api/invoice-settings'),
          fetch('/api/templates'),
          fetch('/api/profile'),
        ]);

        if (!invoiceRes.ok) {
          throw new Error('Failed to fetch invoice data. It may not exist or you may not have permission.');
        }
        
        const fetchedInvoice = await invoiceRes.json();
        if (clientsRes.ok) {
          setAllClients(await clientsRes.json());
        }

        let currencySymbol = 'Rs';
        if (settingsRes.ok) {
          const settings = await settingsRes.json();
          currencySymbol = CURRENCY_SYMBOLS[settings.currency] || '$';
        }

        let profileData = {};
        if (profileRes.ok) {
          profileData = await profileRes.json();
        }

        setInvoiceData({
          ...fetchedInvoice,
          currencySymbol,
          // Business Profile Details
          logoUrl: profileData?.business?.logoUrl || null,
          businessName: profileData?.business?.businessName || '',
          businessAddress: profileData?.business?.address || '',
          businessCity: profileData?.business?.city || '',
          businessEmail: profileData?.email || '',
          businessPhone: profileData?.business?.phone || '',
          // Format dates correctly for the <input type="date"> fields
          date: new Date(fetchedInvoice.date).toISOString().split('T')[0],
          dueDate: new Date(fetchedInvoice.dueDate).toISOString().split('T')[0],
          // Populate client details from the nested client object
          clientName: fetchedInvoice.client?.name || '',
          clientEmail: fetchedInvoice.client?.email || '',
          clientCompany: fetchedInvoice.client?.company || '',
          clientTaxId: fetchedInvoice.client?.taxId || '',
          clientAddress: fetchedInvoice.client?.address || '',
          clientCity: fetchedInvoice.client?.city || '',
          clientPhone: fetchedInvoice.client?.phone || '',
        });

        // Fetch active template
        if (templateRes.ok) {
          const templateData = await templateRes.json();
          setActiveTemplateName(templateData.templateName || 'modern-blue');
        }

      } catch (error) {
        console.error("Error fetching invoice data:", error);
        toast(error.message);
        router.push('/invoices'); // Redirect if invoice can't be found
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInvoiceData();
  }, [invoiceId, router]); // Re-run this effect if the invoiceId changes

  // --- NEW: Function to handle the UPDATE submission ---
  const handleUpdateInvoice = async (status = 'PENDING') => {
    setIsSaving(true);
    if (!invoiceData.items.length || !invoiceData.clientName && !invoiceData.clientCompany) {
      toast("Please ensure the invoice has items and client details.");
      setIsSaving(false);
      return;
    }

    try {
        const res = await fetch(`/api/updateInvoice/${invoiceId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...invoiceData, status }),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Failed to update invoice.');
        }

        const updatedInvoice = await res.json();
        toast(`Invoice ${updatedInvoice.invoiceNumber} updated successfully!`);
        router.push('/invoices');

    } catch (error) {
        console.error(error);
        toast(`Error: ${error.message}`);
    } finally {
        setIsSaving(false);
    }
  };
  
  // --- All other handlers are copied exactly from NewInvoicePage ---
  const handleInvoiceDataChange = (field, value) => {
    setInvoiceData(prev => {
        let newState = { ...prev };
        if (field === 'selectClient') {
            const selectedClient = value;
            newState = { ...newState, clientId: selectedClient.id, clientName: selectedClient.name, clientEmail: selectedClient.email, clientCompany: selectedClient.company || '', clientTaxId: selectedClient.taxId || '', clientAddress: selectedClient.address || '', clientCity: selectedClient.city || '', clientPhone: selectedClient.phone || '' };
        } else if (field === 'clientName') {
            newState = { ...newState, clientId: null, clientName: value, clientEmail: '', clientCompany: '', clientTaxId: '', clientAddress: '', clientCity: '', clientPhone: '' };
        } else if (field === 'toggleDiscountType') {
            newState = { ...newState, discountType: prev.discountType === 'PERCENTAGE' ? 'FIXED' : 'PERCENTAGE', discountValue: 0 };
        } else {
            newState = { ...newState, [field]: value };
        }
        return calculateTotals(newState);
    });
  };

  const addItem = () => {
    const newItem = { id: `new_${Date.now()}`, description: '', quantity: 1, rate: 0, amount: 0 };
    setInvoiceData(prev => calculateTotals({ ...prev, items: [...prev.items, newItem] }));
  };

  const updateItem = (id, field, value) => {
    setInvoiceData(prev => {
      const newItems = prev.items.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'quantity' || field === 'rate') {
            updated.amount = (parseFloat(updated.quantity) || 0) * (parseFloat(updated.rate) || 0);
          }
          return updated;
        }
        return item;
      });
      return calculateTotals({ ...prev, items: newItems });
    });
  };

  const removeItem = id => {
    setInvoiceData(prev => calculateTotals({ ...prev, items: prev.items.filter(item => item.id !== id) }));
  };

  if (isLoading || !invoiceData) {
    return <EditInvoiceSkeleton />;
  }

  return (
    <div className="flex flex-col h-full w-full">
        <EditInvoiceHeader
          isEditing={true}
          onSaveInvoice={handleUpdateInvoice}
          onPreview={() => setIsPreviewOpen(true)}
          isSaving={isSaving} 
        />
        <div className="ds-page-inner">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
            <InvoiceDetails {...invoiceData} onFieldChange={handleInvoiceDataChange} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BusinessDetails {...invoiceData} onFieldChange={handleInvoiceDataChange} onLogoUpload={(e) => setInvoiceData(prev => ({...prev, logoFile: e.target.files[0]}))} />
              <ClientDetails {...invoiceData} allClients={allClients} onFieldChange={handleInvoiceDataChange} />
            </div>
            <InvoiceItems {...invoiceData} onAddItem={addItem} onUpdateItem={updateItem} onRemoveItem={removeItem} />
            <AdditionalInfo {...invoiceData} onFieldChange={handleInvoiceDataChange} />
          </div>
          <InvoiceSummary {...invoiceData} onFieldChange={handleInvoiceDataChange} />
        </div>
      </div>
      <InvoicePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        invoiceData={invoiceData}
        templateName={activeTemplateName}
      />
    </div>
  );
};

export default EditInvoicePage;