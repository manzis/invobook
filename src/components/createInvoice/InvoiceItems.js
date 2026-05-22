import React, { useState } from 'react';
import { Plus, Trash2, Package } from 'lucide-react';
import InventoryModal from '../inventory/InventoryModal';

const InvoiceItems = ({ items = [], onAddItem, onUpdateItem, onRemoveItem, currencySymbol, inventoryEnabled }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);

  const handleDescriptionChange = async (itemId, value) => {
    onUpdateItem(itemId, 'description', value);
    // Clear item ID if user changes description to avoid mismatch
    onUpdateItem(itemId, 'inventoryItemId', null);

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
    if (suggestion.isInventory) {
      onUpdateItem(itemId, 'inventoryItemId', suggestion.inventoryItemId);
      // Auto set quantity to 1, but cap at available stock if stock is 0
      onUpdateItem(itemId, 'quantity', suggestion.quantity > 0 ? 1 : 0);
    }
    setSuggestions([]);
  };

  const handleQuantityChange = (itemId, value, maxStock) => {
    let qty = parseFloat(value) || 0;
    if (inventoryEnabled && maxStock !== undefined && qty > maxStock) {
      qty = maxStock; // Cap at max stock
    }
    onUpdateItem(itemId, 'quantity', qty);
  };

  const handleCreateInventorySuccess = () => {
    // Optionally auto-add the created item or just let the user search for it again
  };

  return (
    <div className="ds-card-static">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="ds-card-title text-[20px]">Invoice Items</h3>
          {inventoryEnabled && <p className="text-xs text-[var(--ds-gray-500)] mt-1 flex items-center gap-1"><Package className="w-3 h-3" /> Inventory Management Enabled</p>}
        </div>
        <button type="button" onClick={onAddItem} className="ds-btn-dark gap-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Item</span>
          <span className="sm:hidden">Add</span>
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
                    onBlur={() => setTimeout(() => { setSuggestions([]); setActiveIndex(-1); }, 200)}
                    className={`ds-input transition-shadow ${inventoryEnabled && item.description.length > 0 && !item.inventoryItemId && activeIndex !== index ? '!shadow-[0_0_0_1.5px_var(--ds-ship-red)]' : ''}`}
                  />
                  {inventoryEnabled && item.description.length > 0 && !item.inventoryItemId && activeIndex !== index && (
                    <p className="text-[11px] text-[var(--ds-ship-red)] mt-1.5 ml-1 font-medium">Select an item from the inventory suggestions</p>
                  )}
                  {activeIndex === index && item.description.length > 0 && (suggestions.length > 0 || inventoryEnabled) && (
                    <ul className="absolute z-[10000] w-full max-w-[400px] bg-[var(--ds-white)] rounded-lg mt-1 border border-[var(--ds-gray-100)] ds-shadow-card-full p-1.5 flex flex-col gap-0.5">
                      {suggestions.map((suggestion, sIndex) => (
                        <li
                          key={sIndex}
                          onMouseDown={() => handleSuggestionClick(item.id, suggestion)}
                          className="px-3 py-2.5 cursor-pointer hover:bg-[var(--ds-gray-50)] rounded-md transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-[var(--ds-black)]">{suggestion.description}</span>
                              {suggestion.isInventory && suggestion.sku && <span className="text-xs text-[var(--ds-gray-500)] mt-0.5">SKU: {suggestion.sku}</span>}
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-sm font-medium text-[var(--ds-black)]">{currencySymbol}{parseFloat(suggestion.rate).toFixed(2)}</span>
                              {suggestion.isInventory && (
                                <span className={`text-[10px] mt-1 px-1.5 py-0.5 rounded-sm font-medium ${suggestion.quantity > 0 ? 'bg-[rgba(0,112,243,0.1)] text-[var(--ds-vercel-blue)]' : 'bg-[rgba(255,91,79,0.1)] text-[var(--ds-ship-red)]'}`}>
                                  {suggestion.quantity > 0 ? `${suggestion.quantity} ${suggestion.unit} in stock` : 'Out of stock'}
                                </span>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                      {inventoryEnabled && (
                        <>
                          {suggestions.length > 0 && <div className="h-[1px] bg-[var(--ds-gray-100)] mx-2 my-1" />}
                          <li
                            onMouseDown={() => setIsInventoryModalOpen(true)}
                            className="px-3 py-2.5 cursor-pointer hover:bg-[var(--ds-gray-50)] rounded-md text-sm font-medium text-[var(--ds-develop-blue)] flex items-center gap-2 transition-colors"
                          >
                            <Plus className="w-4 h-4" /> Create new inventory item
                          </li>
                        </>
                      )}
                    </ul>
                  )}
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => {
                      // Find if this item maps to a specific inventory suggestion we just picked
                      const currentSuggestion = suggestions.find(s => s.inventoryItemId === item.inventoryItemId);
                      handleQuantityChange(item.id, e.target.value, currentSuggestion ? currentSuggestion.quantity : undefined);
                    }}
                    className="ds-input"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    placeholder="Rate"
                    value={item.rate}
                    readOnly={inventoryEnabled && !!item.inventoryItemId}
                    onChange={(e) =>
                      onUpdateItem(item.id, 'rate', parseFloat(e.target.value) || 0)
                    }
                    className={`ds-input ${inventoryEnabled && !!item.inventoryItemId ? 'opacity-70 bg-[var(--ds-gray-50)] cursor-not-allowed' : ''}`}
                  />
                </div>
                <div className="col-span-2">
                  <div className="ds-surface-muted px-3 rounded-md text-right font-medium text-[13px] text-[var(--ds-black)] border border-[var(--ds-gray-200)] h-[32px] flex items-center justify-end">
                    {currencySymbol}
                    {(parseFloat(item.quantity) * parseFloat(item.rate) || 0).toFixed(2)}
                  </div>
                </div>
                <div className="col-span-1 flex justify-end items-center">
                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.id)}
                    className="ds-icon-btn text-[var(--ds-gray-500)] hover:text-[var(--ds-ship-red)] hover:bg-[rgba(255,91,79,0.1)]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {inventoryEnabled && (
        <InventoryModal
          isOpen={isInventoryModalOpen}
          onClose={() => setIsInventoryModalOpen(false)}
          onSuccess={handleCreateInventorySuccess}
        />
      )}
    </div>
  );
};

export default InvoiceItems;
