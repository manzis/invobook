import React from 'react';
import { Eye, Send } from 'lucide-react';

const EditInvoiceHeader = ({ onSaveInvoice, onPreview, isSaving }) => {
  return (
    <div className="ds-page-header">
      <div>
        <h1 className="ds-section-title">Edit Invoice</h1>
        <p className="ds-page-subtitle">Fill in the details to edit your invoice</p>
      </div>
      <div className="flex flex-wrap gap-3 items-center">
        <button type="button" onClick={onPreview} className="ds-btn-ghost gap-2">
          <Eye className="w-4 h-4" />
          <span>Preview</span>
        </button>
        <button
          type="button"
          onClick={() => onSaveInvoice('PENDING')}
          disabled={isSaving}
          className="ds-btn-dark gap-2"
        >
          <Send className="w-4 h-4" />
          <span>{isSaving ? 'Editing...' : 'Save Invoice'}</span>
        </button>
      </div>
    </div>
  );
};

export default EditInvoiceHeader;
