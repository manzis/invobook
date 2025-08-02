import React from 'react';

const AdditionalInfo = ({ notes, terms, onFieldChange,}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
          <textarea
            rows={3}
            placeholder="Add any additional notes..."
            value={notes}
            onChange={(e) => onFieldChange('notes', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Terms & Conditions</label>
          <textarea
            rows={3}
            placeholder="Payment terms and conditions..."
            value={terms}
            onChange={(e) => onFieldChange('terms', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default AdditionalInfo;