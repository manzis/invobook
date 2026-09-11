import React from 'react';
import { Eye, Save, Send, ChevronDown, FileText, Receipt } from 'lucide-react';

const InvoiceHeader = ({ invoiceType, onTypeChange, onCreateInvoice, onPreview, isSaving, inventoryEnabled = true }) => {
  const types = [
    { id: 'SALES', label: 'Sales Invoice', icon: FileText },
    { id: 'QUOTATION', label: 'Quotation', icon: FileText },
    { 
      id: 'PURCHASE', 
      label: 'Purchase Invoice',
      disabled: !inventoryEnabled,
      icon: Receipt
    },
  ];

  const selectedType = types.find((t) => t.id === invoiceType) || types[0];
  const CurrentIcon = selectedType.icon || FileText;

  const getTitle = () => {
    switch (invoiceType) {
      case 'QUOTATION': return 'New Quotation';
      case 'PURCHASE': return 'New Purchase';
      default: return 'New Invoice';
    }
  };

  const getSelectStyle = () => {
    switch (invoiceType) {
      case 'QUOTATION': return 'bg-[var(--ds-black)] text-white border-[var(--ds-black)]';
      case 'PURCHASE': return 'bg-amber-400 text-black border-amber-400';
      case 'SALES':
      default:
        return 'bg-emerald-600 text-white border-emerald-600';
    }
  };

  return (
    <div className="sticky top-0 z-[40] bg-white/80 backdrop-blur-md w-full pt-4 pb-4">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-row items-center justify-between md:justify-start gap-4 sm:gap-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-[var(--ds-black)] tracking-tight">{getTitle()}</h1>
              <p className="text-sm text-[var(--ds-gray-500)] hidden sm:block mt-1">Fill in the details to generate your document</p>
            </div>
            
            {/* Type Switcher Dropdown */}
            <div className="relative mt-1 sm:mt-0 shrink-0">
              <div
                className={`h-[36px] px-3 flex items-center gap-2 rounded-md text-sm font-medium transition-all shadow-sm cursor-pointer select-none ${getSelectStyle()}`}
              >
                <CurrentIcon className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">{selectedType.label}</span>
                <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-80 ml-0.5" />
              </div>

              <select
                value={invoiceType}
                onChange={(e) => onTypeChange(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                title="Select document type"
              >
                {types.map((t) => (
                  <option key={t.id} value={t.id} disabled={t.disabled}>
                    {t.label}
                  </option>
                ))}
              </select>
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
