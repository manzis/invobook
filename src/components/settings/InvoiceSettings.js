import React, { useState } from 'react';
import { Upload, Image } from 'lucide-react'; // <-- Import icons

const InvoiceSettings = ({ data, setData }) => {
  // Local state ONLY for the visual preview of a newly selected file.
  const [previewUrl, setPreviewUrl] = useState(null);

  // This generic handler already supports the new textarea field.
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? (value === '' ? '' : parseFloat(value)) : value;
    setData(prev => ({ ...prev, [name]: val }));
  };

  // New handler specifically for the payment image file input.
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // 1. Store the actual File object in the parent's state for the upload process.
      // The parent component will look for 'paymentImageFile' when saving.
      setData(prevData => ({ ...prevData, paymentImageFile: file }));
      
      // 2. Create a temporary URL for an instant preview for the user.
      setPreviewUrl(URL.createObjectURL(file));
    }
  };
  
  // A more comprehensive list of world currencies (no changes here).
  const currencies = [
      { code: 'USD', name: 'US Dollar' }, { code: 'EUR', name: 'Euro' }, { code: 'JPY', name: 'Japanese Yen' }, { code: 'GBP', name: 'British Pound' }, { code: 'AUD', name: 'Australian Dollar' }, { code: 'CAD', name: 'Canadian Dollar' }, { code: 'CHF', name: 'Swiss Franc' }, { code: 'CNY', name: 'Chinese Yuan' }, { code: 'INR', name: 'Indian Rupee' }, { code: 'BRL', name: 'Brazilian Real' }, { code: 'RUB', name: 'Russian Ruble' }, { code: 'ZAR', name: 'South African Rand' }, { code: 'SGD', name: 'Singapore Dollar' }, { code: 'NZD', name: 'New Zealand Dollar' }, { code: 'NPR', name: 'Nepali Rupees' },
  ];

  // The definitive source for the preview image. It prioritizes the new preview
  // over the already saved image URL from the database.
  const imageSource = previewUrl || data.paymentImageUrl;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Defaults & Content</h3>
      
      {/* --- Existing Invoice Fields (No Changes) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Default Due Days, Tax Rate, Currency, etc. */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Default Due Days</label>
          <input type="number" name="defaultDueDays" value={data.defaultDueDays || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Default Tax Rate (%)</label>
          <input type="number" name="taxRate" value={data.taxRate || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" step="0.01"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
          <select name="currency" value={data.currency} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
            {currencies.map(c => <option key={c.code} value={c.code}>{`${c.code} - ${c.name}`}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Prefix</label>
          <input type="text" name="invoicePrefix" value={data.invoicePrefix || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg"/>
        </div>
        
           <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">Next Invoice Number</label>
        <input type="number" name="nextInvoiceNumber" value={data.nextInvoiceNumber} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" min="1"/>
        <p className="text-xs text-gray-500 mt-1">The next invoice you create will incremented by this number. e.g., {data.invoicePrefix}(last invoice number)+{data.nextInvoiceNumber}</p>
    </div>
      </div>
      
      <div className="space-y-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Default Notes</label>
          <textarea name="defaultNotes" rows={3} value={data.defaultNotes || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="e.g., Thank you for your business!"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Default Terms & Conditions</label>
          <textarea name="defaultTerms" rows={3} value={data.defaultTerms || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="e.g., Payment is due within 30 days..."/>
        </div>
      </div>

      {/* --- NEW: Payment Details Section --- */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>
        
        {/* Payment Information Text Area */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Information</label>
          <textarea 
            name="paymentInfo" 
            rows={4} 
            value={data.paymentInfo || ''} 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg" 
            placeholder="e.g., Bank: HDFC Bank, Account: 123456789, IFSC: HDFC000123"
          />
          <p className="text-xs text-gray-500 mt-1">This text will appear on each invoice. Best for bank details.</p>
        </div>

        {/* Payment Image Upload (e.g., QR Code) */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Image (QR Code)</label>
          <div className="flex items-center space-x-4">
            <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
              {imageSource ? (
                <img 
                  src={imageSource} 
                  alt="Payment QR Code Preview" 
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <Image className="w-10 h-10 text-gray-400" />
              )}
            </div>
            <div>
              <input 
                type="file" 
                id="payment-image-upload" 
                className="hidden" 
                accept="image/png, image/jpeg"
              />
              <label 
                htmlFor="payment-image-upload"
                className="cursor-pointer flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>{imageSource ? 'Change Image' : 'Upload Image'}</span>
              </label>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB. {data.paymentImageFile?.name}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceSettings;