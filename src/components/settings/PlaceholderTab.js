import React from 'react';

const PlaceholderTab = ({ title, message }) => (
  <div className="ds-card-static">
    <h3 className="ds-card-title text-lg mb-4">{title}</h3>
    <p className="text-[var(--ds-gray-600)]">{message}</p>
  </div>
);

export default PlaceholderTab;
