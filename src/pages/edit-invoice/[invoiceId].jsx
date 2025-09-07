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

const CURRENCY_SYMBOLS = {
  USD: '$', EUR: '€', JPY: '¥', GBP: '£',
  AUD: '$', CAD: '$', CHF: 'CHF', CNY: '¥',
  INR: '₹', BRL: 'R$', RUB: '₽', ZAR: 'R',
  SGD: '$', NZD: '$', NPR: 'Rs ',
};

const EditInvoicePage = () => {
  const router = useRouter();
  const { invoiceId } = router.query; // Get the ID from the URL
  
  const [invoiceData, setInvoiceData] = useState(null);
  const [allClients, setAllClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false); 

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
        const [invoiceRes, clientsRes] = await Promise.all([
          fetch(`/api/updateInvoice/${invoiceId}`),
          fetch('/api/clients')
        ]);

        if (!invoiceRes.ok) {
          throw new Error('Failed to fetch invoice data. It may not exist or you may not have permission.');
        }
        
        const fetchedInvoice = await invoiceRes.json();
        if (clientsRes.ok) {
          setAllClients(await clientsRes.json());
        }

        // Format the fetched data to match the form state structure
        const currencySymbol = 'Rs';
        setInvoiceData({
          ...fetchedInvoice,
          currencySymbol,
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

      } catch (error) {
        console.error("Error fetching invoice data:", error);
        alert(error.message);
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
      alert("Please ensure the invoice has items and client details.");
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
        alert(`Invoice ${updatedInvoice.invoiceNumber} updated successfully!`);
        router.push('/invoices');

    } catch (error) {
        console.error(error);
        alert(`Error: ${error.message}`);
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
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div>Loading Invoice...</div>
      </div>
    );
  }

  // The JSX is identical to NewInvoicePage, but passes different props to the Header
  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-4 mb:p-8">
        <EditInvoiceHeader
          isEditing={true} // <-- Tell the header we are in "edit" mode
          onSaveInvoice={handleUpdateInvoice} // <-- Pass the update function
          isSaving={isSaving} 
        />
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
    </div>
  );
};

export default EditInvoicePage;