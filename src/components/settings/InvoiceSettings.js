// /app/settings/components/InvoiceSettings.js

import React from 'react';

const InvoiceSettings = ({ data, setData }) => {
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    // Handle numbers correctly, parsing them from string input
    const val = type === 'number' ? (value === '' ? '' : parseFloat(value)) : value;
    setData(prev => ({ ...prev, [name]: val }));
  };
  
  // A more comprehensive list of world currencies
  const currencies = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'CHF', name: 'Swiss Franc' },
    { code: 'CNY', name: 'Chinese Yuan' },
    { code: 'INR', name: 'Indian Rupee' },
    { code: 'BRL', name: 'Brazilian Real' },
    { code: 'RUB', name: 'Russian Ruble' },
    { code: 'ZAR', name: 'South African Rand' },
    { code: 'SGD', name: 'Singapore Dollar' },
    { code: 'NZD', name: 'New Zealand Dollar' },
    { code: 'NPR', name: 'Nepali Rupees' },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Defaults & Content</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Default Due Days</label>
          <input type="number" name="defaultDueDays" value={data.defaultDueDays} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg"/>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Default Tax Rate (%)</label>
          <input type="number" name="taxRate" value={data.taxRate} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" step="0.01"/>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
          <select name="currency" value={data.currency} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
            {currencies.map(c => (
              <option key={c.code} value={c.code}>{`${c.code} - ${c.name}`}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Prefix</label>
          <input type="text" name="invoicePrefix" value={data.invoicePrefix} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg"/>
        </div>

        <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Next Invoice Number</label>
            <input type="number" name="nextInvoiceNumber" value={data.nextInvoiceNumber} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" min="1"/>
            <p className="text-xs text-gray-500 mt-1">The next invoice you create will incremented by this number. e.g., {data.invoicePrefix}(last invoice number)+{data.nextInvoiceNumber}</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Default Notes</label>
          <textarea name="defaultNotes" rows={3} value={data.defaultNotes} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="e.g., Thank you for your business!"/>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Default Terms & Conditions</label>
          <textarea name="defaultTerms" rows={3} value={data.defaultTerms} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="e.g., Payment is due within 30 days..."/>
        </div>
      </div>
    </div>
  );
};

export default InvoiceSettings;