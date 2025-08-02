// /components/createInvoice/InvoiceItems.jsx (Corrected)

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

const InvoiceItems = ({ items = [], onAddItem, onUpdateItem, onRemoveItem, currencySymbol }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Invoice Items</h3>
        <button
          onClick={onAddItem}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>Add Item</span>
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No items added yet. Click "Add Item" to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="grid grid-cols-12 gap-2 items-center p-2 rounded-lg hover:bg-gray-50">
              <div className="col-span-5">
                <input type="text" placeholder="Item description" value={item.description} onChange={(e) => onUpdateItem(item.id, 'description', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div className="col-span-2">
                <input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => onUpdateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div className="col-span-2">
                <input type="number" placeholder="Rate" value={item.rate} onChange={(e) => onUpdateItem(item.id, 'rate', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div className="col-span-2">
                <div className="px-3 py-2 bg-gray-50 rounded-lg text-right font-medium">
                  {currencySymbol}
                  {
                    // --- THIS IS THE FIX ---
                    // 1. Convert the `item.amount` (which is a string) to a number using `parseFloat()`.
                    // 2. Add a fallback `|| 0` in case the value is null or invalid.
                    // 3. Now you can safely call `.toFixed(2)` on the resulting number.
                    (parseFloat(item.amount) || 0).toFixed(2)
                  }
                </div>
              </div>
              <div className="col-span-1 flex justify-end">
                <button onClick={() => onRemoveItem(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InvoiceItems;