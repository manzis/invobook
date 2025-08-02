


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

const NewInvoicePage = () => {
  const router = useRouter(); // Initialize router
  const [invoiceData, setInvoiceData] = useState(null);
  const [allClients, setAllClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false); 

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
        // --- 1. FETCH ALL DATA IN PARALLEL ---
        const [profileRes, settingsRes, clientsRes, lastInvoiceRes] = await Promise.all([
          fetch('/api/profile'),
          fetch('/api/invoice-settings'),
          fetch('/api/clients'),
          fetch('/api/invoices/last'),
        ]);

        // --- 2. PROCESS CRITICAL RESPONSES FIRST ---
        if (!profileRes.ok || !settingsRes.ok) {
          throw new Error('Failed to load essential business settings.');
        }
        // FIX: Parse essential data immediately after checking it.
        const profile = await profileRes.json();
        const settings = await settingsRes.json();

        // --- 3. PROCESS NON-CRITICAL RESPONSES ---
        const clients = clientsRes.ok ? await clientsRes.json() : [];
        setAllClients(clients);
        const lastInvoice = lastInvoiceRes.ok ? await lastInvoiceRes.json() : null;

        // --- 4. CALCULATE THE NEXT INVOICE NUMBER (Now that 'settings' is defined) ---
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
        
        // --- 5. CONSTRUCT THE FINAL INITIAL STATE ---
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

      } catch (error) {
        console.error("A critical error occurred while fetching initial invoice data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  
// --- NEW: Function to handle final invoice creation ---
  const handleCreateInvoice = async (status = 'PENDING') => {
    setIsSaving(true);
    
    // Simple validation
    if (invoiceData.items.length === 0) {
        alert("Please add at least one item to the invoice.");
        setIsSaving(false);
        return;
    }
    if (!invoiceData.clientName || !invoiceData.clientEmail) {
        alert("Client name and email are required.");
        setIsSaving(false);
        return;
    }

    try {
        const payload = { ...invoiceData, status };
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
        alert(`Invoice ${newInvoice.invoiceNumber} created successfully!`);
        // Redirect to the main invoices page
        router.push('/invoices');

    } catch (error) {
        console.error(error);
        alert(`Error: ${error.message}`);
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
  // We use a single, unified state update at the end.
  setInvoiceData(prev => {
    // Start with the previous state
    let newState = { ...prev };

    // Use a switch statement or chained if/else if for clarity
    if (field === 'selectClient') {
      const selectedClient = value;
      newState = {
        ...newState,
        // When an existing client is selected, store their ID and all their details
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
      // Typing a new name implies creating a new client.
      // We must reset the clientId AND all other client fields to prevent sending stale data.
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
      // When toggling, reset the value to 0 to avoid confusion (e.g., 50% -> $50)
      newState = {
        ...newState,
        discountType: prev.discountType === 'PERCENTAGE' ? 'FIXED' : 'PERCENTAGE',
        discountValue: 0
      };
    } else {
      // This is the default case for all other simple field updates
      // (e.g., notes, terms, taxRate, shippingCost, etc.)
      newState = { ...newState, [field]: value };
    }

    // Return the final, updated state object
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
    } else { // 'FIXED'
      discountAmount = parseFloat(discountValue) || 0;
    }

    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * ((parseFloat(taxRate) || 0) / 100);
    const total = taxableAmount + taxAmount + (parseFloat(shippingCost) || 0);
    
    setInvoiceData(prev => ({ ...prev, subtotal, discountAmount, taxAmount, total }));
  
  // Update dependency array
  }, [invoiceData?.items, invoiceData?.taxRate, invoiceData?.shippingCost, invoiceData?.discountType, invoiceData?.discountValue]);

  // 5. Render a loading state until the data is fetched
  if (isLoading || !invoiceData) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div>Loading New Invoice...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-8">
        <InvoiceHeader 
        onCreateInvoice={handleCreateInvoice} 
          isSaving={isSaving} />

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
              />
            </div>
            <InvoiceItems
              items={invoiceData.items}
              onAddItem={addItem}
              currencySymbol={invoiceData.currencySymbol}
              onUpdateItem={updateItem}
              onRemoveItem={removeItem}
            />
            <AdditionalInfo
              notes={invoiceData.notes}
              terms={invoiceData.terms}
              onFieldChange={handleInvoiceDataChange}
            />
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
    </div>
  );
};

export default NewInvoicePage;