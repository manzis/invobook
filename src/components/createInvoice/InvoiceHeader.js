import React from 'react';
import { Eye, Save, Send } from 'lucide-react';

const InvoiceHeader = ({ invoiceType, onTypeChange, onCreateInvoice, onPreview, isSaving }) => {
  const types = [
    { id: 'QUOTATION', label: 'Quotation' },
    { id: 'SALES', label: 'Sales Invoice' },
    { id: 'PURCHASE', label: 'Purchase Invoice' },
  ];

  const getTitle = () => {
    switch (invoiceType) {
      case 'QUOTATION': return 'Create New Quotation';
      case 'PURCHASE': return 'Create Purchase Invoice';
      default: return 'Create New Invoice';
    }
  };

  return (
    <div className="sticky top-0 z-[40] bg-white w-full pt-6 pb-2">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 w-full">
        {/* Type Switcher */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex bg-[var(--ds-gray-100)] p-1 rounded-lg">
            {types.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onTypeChange(t.id)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  invoiceType === t.id
                    ? 'bg-white text-[var(--ds-black)] shadow-sm'
                    : 'text-[var(--ds-gray-500)] hover:text-[var(--ds-gray-700)] hover:bg-[var(--ds-gray-200)]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
          <div>
            <h1 className="ds-section-title">{getTitle()}</h1>
            <p className="ds-page-subtitle">Fill in the details to generate your document</p>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            {invoiceType !== 'PURCHASE' && (
              <>
                <button type="button" onClick={onPreview} className="ds-btn-ghost gap-2">
                  <Eye className="w-4 h-4" />
                  <span>Preview</span>
                </button>
                <button type="button" className="ds-btn-ghost gap-2">
                  <Save className="w-4 h-4" />
                  <span>Save Draft</span>
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => onCreateInvoice('PENDING')}
              disabled={isSaving}
              className="ds-btn-dark gap-2"
            >
              <Send className="w-4 h-4" />
              <span>
                {isSaving 
                  ? 'Saving...' 
                  : invoiceType === 'PURCHASE' 
                    ? 'Record Invoice' 
                    : invoiceType === 'QUOTATION' 
                      ? 'Create Quotation' 
                      : 'Create Invoice'
                }
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceHeader;
