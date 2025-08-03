import React from 'react';

const PlaceholderTab = ({ title, message }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
    <p className="text-gray-600">{message}</p>
  </div>
);

export default PlaceholderTab;  