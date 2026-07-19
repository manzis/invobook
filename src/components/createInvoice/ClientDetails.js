import React, { useState, useMemo, useRef, useEffect } from 'react';
import { User, Mail, MapPin, Phone, Building, Hash } from 'lucide-react';

function useOutsideAlerter(ref, callback) {
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, callback]);
}

const iconClass = 'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ds-gray-400)] pointer-events-none';

const ClientDetails = ({
  allClients = [],
  clientName,
  clientEmail,
  clientCompany,
  clientTaxId,
  clientAddress,
  clientCity,
  clientPhone,
  onFieldChange,
  invoiceType,
}) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef, () => setIsDropdownVisible(false));

  const filteredClients = useMemo(() => {
    const searchTerm = clientName?.toLowerCase() || '';
    if (searchTerm === '') {
      return allClients;
    }
    return allClients.filter(
      (client) =>
        client.name.toLowerCase().includes(searchTerm) ||
        client.email.toLowerCase().includes(searchTerm) ||
        client.company?.toLowerCase().includes(searchTerm) ||
        client.phone.toLowerCase().includes(searchTerm)
    );
  }, [clientName, allClients]);

  const handleSelectClient = (client) => {
    onFieldChange('selectClient', client);
    setIsDropdownVisible(false);
  };

  return (
    <div ref={wrapperRef} className="ds-card-static">
      <div className="flex items-center justify-between mb-4">
        <h3 className="ds-card-title text-[20px]">{invoiceType === 'PURCHASE' ? 'Party / Vendor Details' : 'Bill To (Client)'}</h3>
        <User className="w-4 h-4 text-[var(--ds-gray-400)]" />
      </div>

      <div className="space-y-3">
        <div className="relative">
          <div className="relative">
            <User className={iconClass} />
            <input
              type="text"
              placeholder={invoiceType === 'PURCHASE' ? "Search or add party name..." : "Search or add client name..."}
              value={clientName}
              autoComplete="off"
              onChange={(e) => {
                onFieldChange('clientName', e.target.value);
                setIsDropdownVisible(true);
              }}
              onFocus={() => setIsDropdownVisible(true)}
              className="ds-input pl-10"
            />
          </div>

          {isDropdownVisible && (
            <div className="absolute top-full left-0 right-0 mt-1 w-full ds-dropdown-content max-h-60 overflow-y-auto p-1">
              {allClients.length > 0 ? (
                filteredClients.length > 0 ? (
                  <ul>
                    {filteredClients.map((client) => (
                      <li key={client.id}>
                        <button
                          type="button"
                          onClick={() => handleSelectClient(client)}
                          className="ds-dropdown-item flex-col items-start w-full py-3 border-b border-[var(--ds-gray-100)] last:border-b-0"
                        >
                          <div className="flex items-center text-[var(--ds-black)]">
                            <span className="font-medium">{client.name}</span>
                            <span className="mx-2 text-[var(--ds-gray-500)]">&bull;</span>
                            <span className="text-[var(--ds-gray-500)]">{client.phone}</span>
                          </div>
                          <p className="text-sm text-[var(--ds-gray-500)] mt-1 text-left">
                            {client.company ? `${client.company} - ` : ''}
                            {client.email}
                          </p>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-3 text-sm text-[var(--ds-gray-500)] text-center">
                    No clients match your search.
                  </div>
                )
              ) : (
                <div className="p-3 text-sm text-[var(--ds-gray-500)] text-center">
                  No clients to display. Add one first!
                </div>
              )}
            </div>
          )}
        </div>

        <div className="relative">
          <Building className={iconClass} />
          <input
            type="text"
            placeholder="Company Name"
            value={clientCompany}
            onChange={(e) => onFieldChange('clientCompany', e.target.value)}
            className="ds-input pl-10"
          />
        </div>

        <div className="relative">
          <Mail className={iconClass} />
          <input
            type="email"
            placeholder={invoiceType === 'PURCHASE' ? "Email" : "Client Email"}
            value={clientEmail}
            onChange={(e) => onFieldChange('clientEmail', e.target.value)}
            className="ds-input pl-10"
          />
        </div>

        <div className="relative">
          <MapPin className={iconClass} />
          <input
            type="text"
            placeholder="Address"
            value={clientAddress}
            onChange={(e) => onFieldChange('clientAddress', e.target.value)}
            className="ds-input pl-10"
          />
        </div>

        <input
          type="text"
          placeholder="City, State ZIP"
          value={clientCity}
          onChange={(e) => onFieldChange('clientCity', e.target.value)}
          className="ds-input"
        />

        <div className="relative">
          <Phone className={iconClass} />
          <input
            type="tel"
            placeholder="Phone"
            value={clientPhone}
            onChange={(e) => onFieldChange('clientPhone', e.target.value)}
            className="ds-input pl-10"
          />
        </div>

        <div className="relative">
          <Hash className={iconClass} />
          <input
            type="text"
            placeholder="Tax ID (e.g., VAT, EIN)"
            value={clientTaxId}
            onChange={(e) => onFieldChange('clientTaxId', e.target.value)}
            className="ds-input pl-10"
          />
        </div>
      </div>
    </div>
  );
};

export default ClientDetails;
