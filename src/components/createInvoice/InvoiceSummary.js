// /components/createInvoice/InvoiceSummary.jsx (Corrected and Final)

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
    currencySymbol 
}) => {
  


  const safeTotal = parseFloat(total) || 0;
  const safeAmountPaid = parseFloat(amountPaid) || 0;
  const balanceDue = safeTotal - safeAmountPaid;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Summary</h3>
        <div className="space-y-4">
          
          {/* Subtotal */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">{currencySymbol}{(parseFloat(subtotal) || 0).toFixed(2)}</span>
          </div>

          {/* Dynamic Discount Input */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Discount:</span>
            <div className="flex items-center">
              <input 
                type="number" 
                value={discountValue || 0}
                onChange={(e) => onFieldChange('discountValue', parseFloat(e.target.value) || 0)} 
                className="w-20 px-2 py-1 border border-gray-300 rounded-l-md text-right focus:outline-none" 
              />
              <button
                type="button"
                onClick={() => onFieldChange('toggleDiscountType')}
                className="w-10 h-[34px] px-2 py-1 bg-gray-200 text-gray-700 font-bold border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-300"
              >
                {discountType === 'PERCENTAGE' ? '%' : currencySymbol}
              </button>
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Discount Amount:</span>
            <span className="font-medium text-green-600">-{currencySymbol}{(parseFloat(discountAmount) || 0).toFixed(2)}</span>
          </div>

          {/* Tax Rate (Input) */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Tax Rate:</span>
            <div className="flex items-center space-x-2">
              <input 
                type="number" 
                value={taxRate || 0} 
                onChange={(e) => onFieldChange('taxRate', parseFloat(e.target.value) || 0)} 
                className="w-16 px-2 py-1 border border-gray-300 rounded text-right" 
              />
              <span>%</span>
            </div>
          </div>

          {/* Tax Amount (Calculated Display) */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax Amount:</span>
            <span className="font-medium">{currencySymbol}{(parseFloat(taxAmount) || 0).toFixed(2)}</span>
          </div>
          
          {/* Shipping (Input) */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Shipping:</span>
            <div className="flex items-center space-x-1">
              <span>{currencySymbol}</span>
              <input 
                type="number" 
                value={shippingCost || 0} 
                onChange={(e) => onFieldChange('shippingCost', parseFloat(e.target.value) || 0)} 
                className="w-20 px-2 py-1 border border-gray-300 rounded text-right" 
              />
            </div>
          </div>
          
          {/* Total (Calculated Display) */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between text-md font-medium">
              <span>Invoice Total:</span>
              <span>{currencySymbol}{safeTotal.toFixed(2)}</span>
            </div>
          </div>
          
          {/* Amount Paid (Input) */}
          <div className="flex justify-between items-center text-sm pb-4 border-b border-gray-200">
            <span className="text-gray-600">Amount Paid:</span>
            <div className="flex items-center space-x-1">
              <span>{currencySymbol}</span>
              <input 
                type="number" 
                name="amountPaid"
                value={amountPaid || 0} 
                onChange={(e) => onFieldChange('amountPaid', parseFloat(e.target.value) || 0)} 
                className="w-24 px-2 py-1 border border-gray-300 rounded text-right font-medium" 
                placeholder="0.00"
              />
            </div>
          </div>
          
          {/* Balance Due (Final Calculated Display) */}
          <div className="flex justify-between text-lg font-semibold">
            <span>Balance Due:</span>
            <span className="text-blue-600">{currencySymbol}{balanceDue.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceSummary;