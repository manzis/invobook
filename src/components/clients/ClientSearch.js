import React from 'react';
import { Search } from 'lucide-react';

const ClientSearch = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search clients by name, email, or company..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
};

export default ClientSearch;