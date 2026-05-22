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
    <div className="ds-card-static">
      <div className="flex items-center justify-between mb-4">
        <h3 className="ds-card-title text-[20px]">Invoice Items</h3>
        <button type="button" onClick={onAddItem} className="ds-btn-dark gap-2">
          <Plus className="w-4 h-4" />
          <span>Add Item</span>
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 text-[var(--ds-gray-500)]">
          <p>No items added yet. Click &quot;Add Item&quot; to get started.</p>
        </div>
      ) : (
        <div className="relative pb-4">
          <div className="space-y-2 min-w-[600px]">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="grid grid-cols-12 gap-2 items-start p-2 rounded-lg hover:bg-[var(--ds-gray-50)] relative"
              >
                <div className="col-span-5">
                  <input
                    type="text"
                    placeholder="Item description"
                    value={item.description}
                    onChange={(e) => {
                      setActiveIndex(index);
                      handleDescriptionChange(item.id, e.target.value);
                    }}
                    onBlur={() => setTimeout(() => setSuggestions([]), 200)}
                    className="ds-input"
                  />
                  {activeIndex === index && suggestions.length > 0 && (
                    <ul className="absolute z-[10000] bg-[var(--ds-white)] rounded-lg mt-1 ds-shadow-card-full overflow-hidden">
                      {suggestions.map((suggestion, sIndex) => (
                        <li
                          key={sIndex}
                          onMouseDown={() => handleSuggestionClick(item.id, suggestion)}
                          className="px-4 py-2 cursor-pointer hover:bg-[var(--ds-gray-50)] text-sm text-[var(--ds-black)]"
                        >
                          {suggestion.description} - {currencySymbol}
                          {parseFloat(suggestion.rate).toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) =>
                      onUpdateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)
                    }
                    className="ds-input"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    placeholder="Rate"
                    value={item.rate}
                    onChange={(e) =>
                      onUpdateItem(item.id, 'rate', parseFloat(e.target.value) || 0)
                    }
                    className="ds-input"
                  />
                </div>
                <div className="col-span-2">
                  <div className="ds-surface-muted px-3 py-2 rounded-md text-right font-medium text-sm text-[var(--ds-black)]">
                    {currencySymbol}
                    {(parseFloat(item.quantity) * parseFloat(item.rate) || 0).toFixed(2)}
                  </div>
                </div>
                <div className="col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.id)}
                    className="ds-icon-btn text-[var(--ds-ship-red)] hover:bg-[rgba(255,91,79,0.1)]"
                  >
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
