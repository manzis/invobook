import React, { useState, useMemo, useRef, useEffect } from 'react';
import { User, Mail, MapPin, Phone, Building, Hash } from 'lucide-react';

// Custom hook to detect clicks outside of a component (this is correct, no changes needed)
function useOutsideAlerter(ref, callback) {
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, callback]);
}

const ClientDetails = ({
    allClients = [],
    clientName, clientEmail, clientCompany, clientTaxId, clientAddress, clientCity, clientPhone,
    onFieldChange
}) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef, () => setIsDropdownVisible(false));

  const filteredClients = useMemo(() => {
    const searchTerm = clientName?.toLowerCase() || '';
    if (searchTerm === '') {
      return allClients;
    }
    return allClients.filter(client =>
      client.name.toLowerCase().includes(searchTerm) ||
      client.email.toLowerCase().includes(searchTerm) ||
      client.company?.toLowerCase().includes(searchTerm)||
      client.phone.toLowerCase().includes(searchTerm)
    );
  }, [clientName, allClients]);


  const handleSelectClient = (client) => {
    onFieldChange('selectClient', client);
    setIsDropdownVisible(false);
  };

  return (
    <div ref={wrapperRef} className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Bill To (Client)</h3>
        <User className="w-4 h-4 text-gray-400" />
      </div>

      <div className="space-y-3">
        {/* --- CLIENT NAME INPUT (with Dropdown) --- */}
        <div className="relative">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search or add client name..."
              value={clientName}
              autoComplete="off"
              onChange={(e) => {
                onFieldChange('clientName', e.target.value);
                setIsDropdownVisible(true);
              }}
              onFocus={() => setIsDropdownVisible(true)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          {/* --- DROPDOWN LOGIC --- */}
          {isDropdownVisible && (
            <div className="absolute top-full left-0 right-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
              {allClients.length > 0 ? (
                filteredClients.length > 0 ? (
                  <ul>
                    {filteredClients.map(client => (
                      <li
                        key={client.id}
                        onClick={() => handleSelectClient(client)}
                        className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        {/* --- UPDATED DISPLAY LOGIC --- */}
                        <div className="flex items-center text-gray-800">
                          <span className="font-medium">{client.name}</span>
                          <span className="mx-2 text-gray-500">&bull;</span>
                          <span className="text-gray-500">{client.phone}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {client.company ? `${client.company} - ` : ''}{client.email}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-3 text-sm text-gray-500 text-center">No clients match your search.</div>
                )
              ) : (
                <div className="p-3 text-sm text-gray-500 text-center">No clients to display. Add one first!</div>
              )}
            </div>
          )}
        </div>

        {/* --- Company Name Field --- */}
        <div className="relative">
          <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Company Name" value={clientCompany} onChange={(e) => onFieldChange('clientCompany', e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg" />
        </div>

        {/* --- Email Field --- */}
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="email" placeholder="Client Email" value={clientEmail} onChange={(e) => onFieldChange('clientEmail', e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg" />
        </div>

        {/* --- Address Field --- */}
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Address" value={clientAddress} onChange={(e) => onFieldChange('clientAddress', e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg" />
        </div>

        {/* --- City Field --- */}
        <input type="text" placeholder="City, State ZIP" value={clientCity} onChange={(e) => onFieldChange('clientCity', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />

        {/* --- Phone Field --- */}
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="tel" placeholder="Phone" value={clientPhone} onChange={(e) => onFieldChange('clientPhone', e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg" />
        </div>

        {/* --- Tax ID Field --- */}
        <div className="relative">
          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Tax ID (e.g., VAT, EIN)" value={clientTaxId} onChange={(e) => onFieldChange('clientTaxId', e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export default ClientDetails;