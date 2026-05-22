import React from 'react';
import { Search } from 'lucide-react';

const ClientSearch = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="ds-card-static mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ds-gray-400)] pointer-events-none" />
        <input
          type="text"
          placeholder="Search clients by name, email, or company..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="ds-input pl-10"
        />
      </div>
    </div>
  );
};

export default ClientSearch;
