// components/TemplatesSettings.jsx

import React, { useState, useEffect } from 'react';
import { TemplateSelection } from '../templateSelection';

const TemplatesSettings = () => {
  const [activeTemplate, setActiveTemplate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch the current setting on component mount
  useEffect(() => {
    const fetchTemplateSetting = async () => {
      try {
        const res = await fetch('/api/templates');
        if (!res.ok) throw new Error('Could not fetch settings');
        const data = await res.json();
        setActiveTemplate(data.templateName);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTemplateSetting();
  }, []);

  // Handle the selection and update the backend
  const handleSelectTemplate = async (templateId) => {
    const originalTemplate = activeTemplate;
    setActiveTemplate(templateId); // Optimistic UI update
    
    try {
      const res = await fetch('/api/templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateName: templateId }),
      });
      if (!res.ok) throw new Error('Failed to save selection');
    } catch (err) {
      alert('Error: Could not save your preference.');
      setActiveTemplate(originalTemplate); // Revert on error
    }
  };

  if (isLoading) return <div>Loading template settings...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Templates</h3>
      <p className="text-gray-600 mb-6">Choose a default template design for all your invoices.</p>
      
      {/* 
        Here, we do NOT pass a className prop, so the component
        will use its default: 'grid grid-cols-1 md:grid-cols-2 gap-5'
      */}
      <TemplateSelection
        activeTemplateId={activeTemplate}
        onSelectTemplate={handleSelectTemplate}
      />
    </div>
  );
};

export default TemplatesSettings;