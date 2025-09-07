// /components/createInvoice/InvoiceItems.jsx (Updated)

import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const InvoiceItems = ({ items = [], onAddItem, onUpdateItem, onRemoveItem, currencySymbol }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  const handleDescriptionChange = async (itemId, value) => {
    onUpdateItem(itemId, 'description', value);

    if (value.length > 1) {
      try {
        const response = await fetch(`/api/searchItem?query=${value}`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (itemId, suggestion) => {
    onUpdateItem(itemId, 'description', suggestion.description);
    onUpdateItem(itemId, 'rate', parseFloat(suggestion.rate));
    setSuggestions([]);
  };

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
        <div className="relative pb-4">

        <div className="space-y-2 min-w-[600px]">
          {items.map((item, index) => (
            <div key={item.id} className="grid grid-cols-12 gap-2 items-start p-2 rounded-lg hover:bg-gray-50 relative">
              <div className="col-span-5">
                <input
                  type="text"
                  placeholder="Item description"
                  value={item.description}
                  onChange={(e) => {
                    setActiveIndex(index);
                    handleDescriptionChange(item.id, e.target.value);
                  }}
                  onBlur={() => setTimeout(() => setSuggestions([]), 200)} // Hide suggestions on blur with a small delay
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                {activeIndex === index && suggestions.length > 0 && (
                  <ul className="absolute z-10000  bg-white border border-gray-300 rounded-lg mt-1 shadow-lg">
                    {suggestions.map((suggestion, sIndex) => (
                      <li
                        key={sIndex}
                        onMouseDown={() => handleSuggestionClick(item.id, suggestion)}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                      >
                        {suggestion.description} - {currencySymbol}{parseFloat(suggestion.rate).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                )}
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
                  {(parseFloat(item.quantity) * parseFloat(item.rate) || 0).toFixed(2)}
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
        </div>
      )}
    </div>
  );
};

export default InvoiceItems;