import React from 'react';

const InvoiceSummary = ({
  subtotal,
  taxRate,
  discountType,
  discountValue,
  discountAmount,
  taxAmount,
  shippingCost,
  total,
  amountPaid,
  onFieldChange,
  currencySymbol,
}) => {
  const safeTotal = parseFloat(total) || 0;
  const safeAmountPaid = parseFloat(amountPaid) || 0;
  const balanceDue = safeTotal - safeAmountPaid;

  const rowLabel = 'text-sm text-[var(--ds-gray-600)]';
  const rowValue = 'text-sm font-medium text-[var(--ds-black)]';

  return (
    <div className="space-y-6">
      <div className="ds-card-static sticky top-8">
        <h3 className="ds-card-title text-[20px] mb-4">Invoice Summary</h3>
        <div className="space-y-4">
          <div className={`flex justify-between ${rowLabel}`}>
            <span>Subtotal:</span>
            <span className={rowValue}>
              {currencySymbol}
              {(parseFloat(subtotal) || 0).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className={rowLabel}>Discount:</span>
            <div className="flex items-center">
              <input
                type="number"
                value={discountValue || 0}
                onChange={(e) =>
                  onFieldChange('discountValue', parseFloat(e.target.value) || 0)
                }
                className="ds-input w-20 rounded-r-none text-right py-2"
              />
              <button
                type="button"
                onClick={() => onFieldChange('toggleDiscountType')}
                className="ds-btn-ghost px-3 py-2 rounded-l-none min-w-[40px] text-sm font-semibold"
              >
                {discountType === 'PERCENTAGE' ? '%' : currencySymbol}
              </button>
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <span className={rowLabel}>Discount Amount:</span>
            <span className="font-medium text-[#059669]">
              -{currencySymbol}
              {(parseFloat(discountAmount) || 0).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className={rowLabel}>Tax Rate:</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={taxRate || 0}
                onChange={(e) =>
                  onFieldChange('taxRate', parseFloat(e.target.value) || 0)
                }
                className="ds-input w-16 text-right py-2"
              />
              <span className={rowValue}>%</span>
            </div>
          </div>

          <div className="flex justify-between text-sm">
            <span className={rowLabel}>Tax Amount:</span>
            <span className={rowValue}>
              {currencySymbol}
              {(parseFloat(taxAmount) || 0).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className={rowLabel}>Shipping:</span>
            <div className="flex items-center gap-1">
              <span className={rowValue}>{currencySymbol}</span>
              <input
                type="number"
                value={shippingCost || 0}
                onChange={(e) =>
                  onFieldChange('shippingCost', parseFloat(e.target.value) || 0)
                }
                className="ds-input w-20 text-right py-2"
              />
            </div>
          </div>

          <div className="ds-divider pt-4">
            <div className="flex justify-between text-base font-medium text-[var(--ds-black)]">
              <span>Invoice Total:</span>
              <span>
                {currencySymbol}
                {safeTotal.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center text-sm pb-4 border-b border-[var(--ds-gray-100)]">
            <span className={rowLabel}>Amount Paid:</span>
            <div className="flex items-center gap-1">
              <span className={rowValue}>{currencySymbol}</span>
              <input
                type="number"
                name="amountPaid"
                value={amountPaid || 0}
                onChange={(e) =>
                  onFieldChange('amountPaid', parseFloat(e.target.value) || 0)
                }
                className="ds-input w-24 text-right font-medium py-2"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="flex justify-between text-lg font-semibold text-[var(--ds-black)]">
            <span>Balance Due:</span>
            <span>{currencySymbol}{balanceDue.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceSummary;
