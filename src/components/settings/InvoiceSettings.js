import React, { useState } from 'react';
import { Upload, Image } from 'lucide-react';

const InvoiceSettings = ({ data, setData }) => {
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? (value === '' ? '' : parseFloat(value)) : value;
    setData((prev) => ({ ...prev, [name]: val }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setData((prevData) => ({ ...prevData, paymentImageFile: file }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

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

  const imageSource = previewUrl || data?.paymentImageUrl;

  return (
    <div className="ds-card-static">
      <h3 className="ds-card-title text-lg mb-6">Invoice Defaults & Content</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="ds-form-label">Default Due Days</label>
          <input
            type="number"
            name="defaultDueDays"
            value={data?.defaultDueDays || ''}
            onChange={handleChange}
            className="ds-input"
          />
        </div>
        <div>
          <label className="ds-form-label">Default Tax Rate (%)</label>
          <input
            type="number"
            name="taxRate"
            value={data?.taxRate || ''}
            onChange={handleChange}
            className="ds-input"
            step="0.01"
          />
        </div>
        <div>
          <label className="ds-form-label">Currency</label>
          <select
            name="currency"
            value={data?.currency}
            onChange={handleChange}
            className="ds-select w-full"
          >
            {currencies.map((c) => (
              <option key={c.code} value={c.code}>
                {`${c.code} - ${c.name}`}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="ds-form-label">Invoice Prefix</label>
          <input
            type="text"
            name="invoicePrefix"
            value={data?.invoicePrefix || ''}
            onChange={handleChange}
            className="ds-input"
          />
        </div>
        <div className="md:col-span-2">
          <label className="ds-form-label">Next Invoice Number</label>
          <input
            type="number"
            name="nextInvoiceNumber"
            value={data?.nextInvoiceNumber}
            onChange={handleChange}
            className="ds-input"
            min="1"
          />
          <p className="text-xs text-[var(--ds-gray-500)] mt-2">
            The next invoice you create will be this number. e.g., {data?.invoicePrefix}
            {data?.nextInvoiceNumber}
          </p>
        </div>
      </div>

      <div className="space-y-4 mt-6">
        <div>
          <label className="ds-form-label">Default Notes</label>
          <textarea
            name="defaultNotes"
            rows={3}
            value={data?.defaultNotes || ''}
            onChange={handleChange}
            className="ds-input resize-y min-h-[80px]"
            placeholder="e.g., Thank you for your business!"
          />
        </div>
        <div>
          <label className="ds-form-label">Default Terms & Conditions</label>
          <textarea
            name="defaultTerms"
            rows={3}
            value={data?.defaultTerms || ''}
            onChange={handleChange}
            className="ds-input resize-y min-h-[80px]"
            placeholder="e.g., Payment is due within 30 days..."
          />
        </div>
      </div>

      <div className="mt-8 pt-8">
        <hr className="ds-divider mb-6" />
        <h3 className="ds-card-title text-lg mb-6">Payment Details</h3>

        <div>
          <label className="ds-form-label">Payment Information</label>
          <textarea
            name="paymentInfo"
            rows={4}
            value={data?.paymentInfo || ''}
            onChange={handleChange}
            className="ds-input resize-y min-h-[96px]"
            placeholder="e.g., Bank: HDFC Bank, Account: 123456789, IFSC: HDFC000123"
          />
          <p className="text-xs text-[var(--ds-gray-500)] mt-2">
            This text will appear on each invoice. Best for bank details.
          </p>
        </div>

        <div className="mt-6">
          <label className="ds-form-label">Payment Image (QR Code)</label>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 ds-surface-muted rounded-[var(--ds-radius-button)] flex items-center justify-center overflow-hidden">
              {imageSource ? (
                <img
                  src={imageSource}
                  alt="Payment QR Code Preview"
                  className="w-full h-full object-contain"
                />
              ) : (
                <Image className="w-10 h-10 text-[var(--ds-gray-400)]" />
              )}
            </div>
            <div>
              <input
                type="file"
                id="payment-image-upload"
                className="hidden"
                accept="image/png, image/jpeg"
                onChange={handleImageChange}
              />
              <label
                htmlFor="payment-image-upload"
                className="ds-btn-ghost gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>{imageSource ? 'Change Image' : 'Upload Image'}</span>
              </label>
              <p className="text-xs text-[var(--ds-gray-500)] mt-2">
                PNG, JPG up to 2MB. {data?.paymentImageFile?.name}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceSettings;
