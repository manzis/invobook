import React from 'react';
import { Eye, Save, Send, ChevronDown } from 'lucide-react';

const InvoiceHeader = ({ invoiceType, onTypeChange, onCreateInvoice, onPreview, isSaving, inventoryEnabled = true }) => {
  const types = [
    { id: 'QUOTATION', label: 'Quotation' },
    { id: 'SALES', label: 'Sales Invoice' },
    { 
      id: 'PURCHASE', 
      label: inventoryEnabled ? 'Purchase Invoice' : 'Purchase Invoice (Enable Inventory in Settings)',
      disabled: !inventoryEnabled
    },
  ];

  const getTitle = () => {
    switch (invoiceType) {
      case 'QUOTATION': return 'New Quotation';
      case 'PURCHASE': return 'New Purchase';
      default: return 'New Invoice';
    }
  };

  const getSelectStyle = () => {
    switch (invoiceType) {
      case 'QUOTATION': return 'bg-black text-white focus:ring-black';
      case 'SALES': return 'bg-emerald-500 text-white focus:ring-emerald-500';
      case 'PURCHASE': return 'bg-yellow-400 text-black focus:ring-yellow-400';
      default: return 'bg-[var(--ds-gray-100)] text-[var(--ds-gray-800)]';
    }
  };

  return (
    <div className="sticky top-0 z-[40] bg-white/80 backdrop-blur-md w-full pt-4 pb-4">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-row items-center justify-between md:justify-start gap-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-[var(--ds-black)] tracking-tight">{getTitle()}</h1>
              <p className="text-sm text-[var(--ds-gray-500)] hidden sm:block mt-1">Fill in the details to generate your document</p>
            </div>
            
            {/* Type Switcher Dropdown */}
            <div className="relative mt-1 sm:mt-0">
              <select
                value={invoiceType}
                onChange={(e) => onTypeChange(e.target.value)}
                className={`appearance-none border-none text-sm font-semibold rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-offset-1 cursor-pointer outline-none transition-colors ${getSelectStyle()}`}
              >
                {types.map((t) => (
                  <option key={t.id} value={t.id} disabled={t.disabled} className="bg-white text-black font-medium">
                    {t.label}
                  </option>
                ))}
              </select>
              <ChevronDown className={`w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${invoiceType === 'PURCHASE' ? 'text-black' : 'text-white'}`} />
            </div>
          </div>
          
          <div className="flex flex-row gap-2 items-center justify-end">
            {invoiceType !== 'PURCHASE' && (
              <>
                <button type="button" onClick={onPreview} className="ds-btn-ghost gap-2 text-sm px-3 py-2 flex-1 md:flex-none justify-center">
                  <Eye className="w-4 h-4" />
                  <span>Preview</span>
                </button>
                <button type="button" className="ds-btn-ghost gap-2 text-sm px-3 py-2 hidden sm:flex">
                  <Save className="w-4 h-4" />
                  <span>Save Draft</span>
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => onCreateInvoice('PENDING')}
              disabled={isSaving}
              className="ds-btn-dark gap-2 text-sm px-4 py-2 flex-1 md:flex-none justify-center"
            >
              <Send className="w-4 h-4" />
              <span>
                {isSaving 
                  ? 'Saving...' 
                  : invoiceType === 'PURCHASE' 
                    ? 'Record' 
                    : invoiceType === 'QUOTATION' 
                      ? 'Create' 
                      : 'Create'
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
