import React from 'react';
import { Eye, Save, Send } from 'lucide-react';

const EditInvoiceHeader = ({ onSaveInvoice, isSaving }) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Invoice</h1>
        <p className="text-gray-600">Fill in the details to edit your invoice</p>
      </div>
      <div className="flex items-center space-x-3">
        <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Eye className="w-4 h-4" />
          <span>Preview</span>
        </button>
        <button onClick={() => onSaveInvoice('PENDING')} disabled={isSaving}  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Send className="w-4 h-4" />
          <span>{isSaving ? 'Editing...' : 'Save Invoice'}</span>
        </button>
      </div>
    </div>
  );
};

export default EditInvoiceHeader;