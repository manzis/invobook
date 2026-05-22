import React from 'react';

const InventorySettings = ({ inventoryEnabled, setInventoryEnabled }) => {
  return (
    <div className="ds-card-static">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
        <div>
          <h3 className="ds-card-title text-lg">Inventory Management</h3>
          <p className="text-sm text-[var(--ds-gray-500)] mt-1">
            Track product stock levels, set low-stock alerts, and auto-deduct quantities when invoices are created.
          </p>
        </div>

        {/* Toggle Switch */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-[var(--ds-gray-600)]">
            {inventoryEnabled ? 'Enabled' : 'Disabled'}
          </span>
          <button
            type="button"
            onClick={() => setInventoryEnabled(!inventoryEnabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-1 border-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-black)] focus-visible:ring-offset-2 ${inventoryEnabled ? 'bg-[var(--ds-black)]' : 'bg-[var(--ds-gray-300)]'
              }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${inventoryEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
            />
          </button>
        </div>
      </div>

      <hr className="ds-divider mb-6" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`p-4 rounded-[var(--ds-radius-card)] border transition-colors ${!inventoryEnabled ? 'border-[var(--ds-gray-200)] bg-[var(--ds-gray-50)]' : 'border-transparent bg-transparent opacity-50'}`}>
          <h4 className="font-medium text-[var(--ds-black)] mb-2">When Disabled (Default)</h4>
          <p className="text-sm text-[var(--ds-gray-500)] leading-relaxed">
            Invoice items are created freely as plain text. As you type, Invobook suggests items from your past invoices, but no stock quantities are tracked.
          </p>
        </div>

        <div className={`p-4 rounded-[var(--ds-radius-card)] border transition-colors ${inventoryEnabled ? 'border-[var(--ds-black)] bg-[rgba(0,0,0,0.02)]' : 'border-transparent bg-transparent opacity-50'}`}>
          <h4 className="font-medium text-[var(--ds-black)] mb-2">When Enabled</h4>
          <p className="text-sm text-[var(--ds-gray-500)] leading-relaxed">
            Invoice items must be selected from your managed product catalog. Stock levels are automatically deducted when an invoice is marked as Pending or Paid.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InventorySettings;
