import React from 'react';
import { Eye, Save, Send } from 'lucide-react';

const InvoiceHeader = ({ onCreateInvoice, onPreview, isSaving }) => {
  return (
    <div className="sticky top-0 z-[40] bg-white w-full pt-6 pb-2">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 w-full">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
          <div>
            <h1 className="ds-section-title">Create New Invoice</h1>
            <p className="ds-page-subtitle">Fill in the details to generate your invoice</p>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <button type="button" onClick={onPreview} className="ds-btn-ghost gap-2">
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </button>
            <button type="button" className="ds-btn-ghost gap-2">
              <Save className="w-4 h-4" />
              <span>Save Draft</span>
            </button>
            <button
              type="button"
              onClick={() => onCreateInvoice('PENDING')}
              disabled={isSaving}
              className="ds-btn-dark gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{isSaving ? 'Creating...' : 'Create Invoice'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceHeader;
