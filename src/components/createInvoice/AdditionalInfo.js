import React from 'react';

const AdditionalInfo = ({ notes, terms, onFieldChange }) => {
  return (
    <div className="ds-card-static">
      <h3 className="ds-card-title text-[20px] mb-4">Additional Information</h3>
      <div className="space-y-4">
        <div>
          <label className="ds-form-label">Notes</label>
          <textarea
            rows={3}
            placeholder="Add any additional notes..."
            value={notes}
            onChange={(e) => onFieldChange('notes', e.target.value)}
            className="ds-input min-h-[80px] resize-y"
          />
        </div>
        <div>
          <label className="ds-form-label">Terms &amp; Conditions</label>
          <textarea
            rows={3}
            placeholder="Payment terms and conditions..."
            value={terms}
            onChange={(e) => onFieldChange('terms', e.target.value)}
            className="ds-input min-h-[80px] resize-y"
          />
        </div>
      </div>
    </div>
  );
};

export default AdditionalInfo;
