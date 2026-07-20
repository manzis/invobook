


 'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router'; 
import InvoiceHeader from '../components/createInvoice/InvoiceHeader';
import InvoiceDetails from '../components/createInvoice/InvoiceDetails';
import BusinessDetails from '../components/createInvoice/BusinessDetails';
import ClientDetails from '../components/createInvoice/ClientDetails';
import InvoiceItems from '../components/createInvoice/InvoiceItems';
import AdditionalInfo from '../components/createInvoice/AdditionalInfo';
import InvoiceSummary from '../components/createInvoice/InvoiceSummary';
import InvoicePreviewModal from '../components/createInvoice/InvoicePreviewModal';
import { useToast } from '../context/ToastContext';
import { useInventory } from '../context/InventoryContext';

const NewInvoiceSkeleton = () => (
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

const NewInvoicePage = () => {
  const router = useRouter(); // Initialize router
  const { toast } = useToast();
  const [invoiceData, setInvoiceData] = useState(null);
  const [allClients, setAllClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeTemplateName, setActiveTemplateName] = useState('modern-blue'); 
  const { inventoryEnabled } = useInventory(); 
  const [invoiceType, setInvoiceType] = useState('SALES'); // Default to SALES

  const CURRENCY_SYMBOLS = {
  USD: '$', EUR: '€', JPY: '¥', GBP: '£',
  AUD: '$', CAD: '$', CHF: 'CHF', CNY: '¥',
  INR: '₹', BRL: 'R$', RUB: '₽', ZAR: 'R',
  SGD: '$', NZD: '$', NPR: 'Rs ',
};

  
useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const [profileRes, settingsRes, lastInvoiceRes, templateRes] = await Promise.all([
          fetch('/api/profile'),
          fetch('/api/invoice-settings'),
          fetch('/api/invoices/last'),
          fetch('/api/templates'),
        ]);

        if (!profileRes.ok || !settingsRes.ok) {
          throw new Error('Failed to load essential business settings.');
        }
        const profile = await profileRes.json();
        const settings = await settingsRes.json();

        const lastInvoice = lastInvoiceRes.ok ? await lastInvoiceRes.json() : null;

        let nextInvoiceNumberValue;
        const incrementValue = settings.nextInvoiceNumber || 1;

        if (lastInvoice && lastInvoice.invoiceNumber) {
          const lastNumMatch = lastInvoice.invoiceNumber.match(/\d+$/);
          if (lastNumMatch) {
            const lastNum = parseInt(lastNumMatch[0], 10);
            nextInvoiceNumberValue = lastNum + incrementValue;
          } else {
            nextInvoiceNumberValue = incrementValue;
          }
        } else {
          nextInvoiceNumberValue = incrementValue;
        }
        
        const finalInvoiceNumber = `${settings.invoicePrefix || 'INV-'}${nextInvoiceNumberValue}`;
        
        const currencySymbol = CURRENCY_SYMBOLS[settings.currency] || '$';
        const today = new Date();
        const dueDate = new Date(new Date().setDate(today.getDate() + (settings.defaultDueDays || 30)));

        const initialData = {
          invoiceNumber: finalInvoiceNumber,
          date: today.toISOString().split('T')[0],
          dueDate: dueDate.toISOString().split('T')[0],
          currencySymbol: currencySymbol,

          logoUrl: profile.business?.logoUrl || null,
          businessName: profile.business?.businessName || '',
          businessAddress: profile.business?.address || '',
          businessCity: profile.business?.city || '',
          businessEmail: profile.email || '',
          businessPhone: profile.business?.phone || '',
          
          clientName: '',
          clientEmail: '',
          clientCompany: '',
          clientTaxId: '',
          clientAddress: '',
          clientCity: '',
          clientPhone: '',
          
          items: [],
          subtotal: 0,
          taxRate: settings.taxRate || 0,
          taxAmount: 0,
          shippingCost: 0,
          total: 0,
          amountPaid: 0,
          discountType: 'PERCENTAGE',
          discountValue: 0,
          discountAmount: 0, 

          notes: settings.defaultNotes || '',
          terms: settings.defaultTerms || 'Payment is due within 30 days.'
        };
        
        setInvoiceData(initialData);

        // Fetch active template
        if (templateRes.ok) {
          const templateData = await templateRes.json();
          setActiveTemplateName(templateData.templateName || 'modern-blue');
        }

      } catch (error) {
        console.error("A critical error occurred while fetching initial invoice data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const typeParam = invoiceType === 'PURCHASE' ? 'VENDOR' : 'CLIENT';
        const res = await fetch(`/api/clients?type=${typeParam}`);
        if (res.ok) {
          const clients = await res.json();
          setAllClients(clients);
        }
      } catch (err) {
        console.error("Failed to fetch clients/vendors:", err);
      }
    };
    fetchClients();
  }, [invoiceType]);

  
  const handleCreateInvoice = async (status = 'PENDING') => {
    setIsSaving(true);
    
    if (invoiceData.items.length === 0) {
        toast("Please add at least one item to the invoice.");
        setIsSaving(false);
        return;
    }

    if (inventoryEnabled) {
        const invalidItems = invoiceData.items.filter(item => !item.inventoryItemId);
        if (invalidItems.length > 0) {
            toast("Inventory is enabled. All items must be selected from the product catalog.");
            setIsSaving(false);
            return;
        }
    }
    if (!invoiceData.clientName) {
        toast("Client name is required.");
        setIsSaving(false);
        return;
    }
    

    try {
        const payload = { ...invoiceData, status, type: invoiceType };
        const res = await fetch('/api/create-invoice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Failed to create invoice.');
        }

        const newInvoice = await res.json();
        toast(`Invoice ${newInvoice.invoiceNumber} created successfully!`);
        router.push('/invoices');

    } catch (error) {
        console.error(error);
        toast(`Error: ${error.message}`);
    } finally {
        setIsSaving(false);
    }
  };

  
  const addItem = () => {
    const newItem = { id: Date.now().toString(), description: '', quantity: 1, rate: 0, amount: 0 };
    setInvoiceData(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const updateItem = (id, field, value) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'quantity' || field === 'rate') {
            updated.amount = updated.quantity * updated.rate;
          }
          return updated;
        }
        return item;
      })
    }));
  };

  const removeItem = id => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

   const handleLogoUpload = e => {
    const file = e.target.files?.[0];
    if (file) setInvoiceData(prev => ({ ...prev, logo: file }));
  };
const handleInvoiceDataChange = (field, value) => {
  setInvoiceData(prev => {
    let newState = { ...prev };

    if (field === 'selectClient') {
      const selectedClient = value;
      newState = {
        ...newState,
        clientId: selectedClient.id, 
        clientName: selectedClient.name,
        clientEmail: selectedClient.email,
        clientCompany: selectedClient.company || '',
        clientTaxId: selectedClient.taxId || '',
        clientAddress: selectedClient.address || '',
        clientCity: selectedClient.city || '',
        clientPhone: selectedClient.phone || '',
      };
    } else if (field === 'clientName') {
      newState = {
        ...newState,
        clientId: null, 
        clientName: value,
        clientEmail: '',
        clientCompany: '',
        clientTaxId: '',
        clientAddress: '',
        clientCity: '',
        clientPhone: '',
      };
    } else if (field === 'toggleDiscountType') {
      newState = {
        ...newState,
        discountType: prev.discountType === 'PERCENTAGE' ? 'FIXED' : 'PERCENTAGE',
        discountValue: 0
      };
    } else {
      newState = { ...newState, [field]: value };
    }

    return newState;
  });
};


 useEffect(() => {
    if (!invoiceData) return;
    const { items, discountType, discountValue, taxRate, shippingCost } = invoiceData;

    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    
    let discountAmount = 0;
    if (discountType === 'PERCENTAGE') {
      discountAmount = subtotal * ((parseFloat(discountValue) || 0) / 100);
    } else { 
      discountAmount = parseFloat(discountValue) || 0;
    }

    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * ((parseFloat(taxRate) || 0) / 100);
    const total = taxableAmount + taxAmount + (parseFloat(shippingCost) || 0);
    
    setInvoiceData(prev => ({ ...prev, subtotal, discountAmount, taxAmount, total }));
  
  }, [invoiceData?.items, invoiceData?.taxRate, invoiceData?.shippingCost, invoiceData?.discountType, invoiceData?.discountValue]);

  if (isLoading || !invoiceData) {
    return <NewInvoiceSkeleton />;
  }

  return (
    <div className="flex flex-col h-full w-full">
        <InvoiceHeader 
          invoiceType={invoiceType}
          onTypeChange={setInvoiceType}
          onCreateInvoice={handleCreateInvoice} 
          onPreview={() => setIsPreviewOpen(true)}
          isSaving={isSaving}
          inventoryEnabled={inventoryEnabled} />

        <div className="ds-page-inner">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
            <InvoiceDetails
              invoiceNumber={invoiceData.invoiceNumber}
              date={invoiceData.date}
              dueDate={invoiceData.dueDate}
              onFieldChange={handleInvoiceDataChange}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BusinessDetails
                logoUrl={invoiceData.logoUrl} // Pass the logo URL down
                businessName={invoiceData.businessName}
                businessAddress={invoiceData.businessAddress}
                businessCity={invoiceData.businessCity}
                businessEmail={invoiceData.businessEmail}
                businessPhone={invoiceData.businessPhone}
                onFieldChange={handleInvoiceDataChange}
                onLogoUpload={handleLogoUpload}
                invoiceType={invoiceType}
              />
              <ClientDetails
                allClients={allClients}
                clientName={invoiceData.clientName}
                clientEmail={invoiceData.clientEmail}
                clientAddress={invoiceData.clientAddress}
                clientCity={invoiceData.clientCity}
                clientPhone={invoiceData.clientPhone}
                clientCompany={invoiceData.clientCompany} // <-- PASS PROP
                clientTaxId={invoiceData.clientTaxId} 
                onFieldChange={handleInvoiceDataChange}
                invoiceType={invoiceType}
              />
            </div>
            <InvoiceItems
              items={invoiceData.items}
              onAddItem={addItem}
              currencySymbol={invoiceData.currencySymbol}
              onUpdateItem={updateItem}
              onRemoveItem={removeItem}
              inventoryEnabled={inventoryEnabled}
              invoiceType={invoiceType}
            />
            {invoiceType !== 'PURCHASE' && (
              <AdditionalInfo
                notes={invoiceData.notes}
                terms={invoiceData.terms}
                onFieldChange={handleInvoiceDataChange}
              />
            )}
          </div>
          <InvoiceSummary
            subtotal={invoiceData.subtotal}
            taxRate={invoiceData.taxRate}
            discountType={invoiceData.discountType}
            discountValue={invoiceData.discountValue}
            discountAmount={invoiceData.discountAmount}
            amountPaid={invoiceData.amountPaid} 
            taxAmount={invoiceData.taxAmount}
            shippingCost={invoiceData.shippingCost}
            total={invoiceData.total}
            currencySymbol={invoiceData.currencySymbol}
            onFieldChange={handleInvoiceDataChange}
          />
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

export default NewInvoicePage;