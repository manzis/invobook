import React from 'react';
import { Mail, Phone, MapPin, Eye, Edit, Trash2 } from 'lucide-react';

const ClientCard = ({ client, onDelete, onEdit }) => {
  const initials = client.name
    .split(' ')
    .map((n) => n[0])
    .join('');

  const formattedTotalAmount = (parseFloat(client.totalAmount) || 0).toLocaleString('en-US', {
    style: 'currency',
    currency: 'INR',
  });

  const statusClass =
    client.status === 'active' ? 'ds-status ds-status-paid' : 'ds-status ds-status-draft';

  return (
    <div className="ds-card flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 ds-surface-muted rounded-[var(--ds-radius-button)] flex items-center justify-center">
            <span className="font-semibold text-lg text-[var(--ds-black)]">{initials}</span>
          </div>
          <div>
            <h3 className="font-semibold text-[var(--ds-black)]">{client.name}</h3>
            <p className="text-sm text-[var(--ds-gray-600)]">{client.company}</p>
          </div>
        </div>
        <span className={statusClass}>{client.status}</span>
      </div>

      <div className="space-y-2 mb-4 text-sm text-[var(--ds-gray-600)]">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 shrink-0 text-[var(--ds-gray-400)]" />
          <span>{client.email}</span>
        </div>
        {client.phone && (
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 shrink-0 text-[var(--ds-gray-400)]" />
            <span>{client.phone}</span>
          </div>
        )}
        {client.address && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 shrink-0 text-[var(--ds-gray-400)]" />
            <span>{client.address}</span>
          </div>
        )}
      </div>

      <div className="pt-4 mt-auto">
        <hr className="ds-divider mb-4" />
        <div className="grid grid-cols-2 gap-4 text-center mb-4">
          <div>
            <p className="text-lg font-semibold text-[var(--ds-black)]">{client.totalInvoices}</p>
            <p className="ds-mono-label mt-1">Invoices</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-[var(--ds-black)]">{formattedTotalAmount}</p>
            <p className="ds-mono-label mt-1">Total Value</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--ds-gray-500)]">
            Last invoice:{' '}
            {client.lastInvoice ? new Date(client.lastInvoice).toLocaleDateString() : 'N/A'}
          </span>
          <div className="flex items-center gap-1">
            <button type="button" className="ds-icon-btn" aria-label="View client">
              <Eye className="w-4 h-4" />
            </button>
            <button type="button" onClick={onEdit} className="ds-icon-btn" aria-label="Edit client">
              <Edit className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete()}
              className="ds-icon-btn hover:!text-[var(--ds-ship-red)] hover:!bg-[rgba(255,91,79,0.1)]"
              aria-label="Delete client"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientCard;
