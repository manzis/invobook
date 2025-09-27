// components/TemplatesSidebar.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { TemplateSelection } from './templateSelection'; // Ensure this path is correct

const TemplatesSidebar = ({ isOpen, onClose }) => {
  const [activeTemplate, setActiveTemplate] = useState('');
  // --- NEW: State to hold the list of all templates ---
  const [availableTemplates, setAvailableTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- NEW: Reusable function to fetch the list of templates ---
  const fetchAvailableTemplates = useCallback(async () => {
    try {
      const res = await fetch('/api/templates/available');
      if (!res.ok) throw new Error('Could not fetch available templates');
      const templatesData = await res.json();
      setAvailableTemplates(templatesData);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  // Fetch all data when the sidebar becomes visible
  useEffect(() => {
    if (isOpen) {
      const fetchInitialData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          // Fetch both the active setting and the list of options in parallel
          await Promise.all([
            (async () => {
              const res = await fetch('/api/templates'); // Correct endpoint for the active setting
              if (!res.ok) throw new Error('Could not fetch settings');
              const data = await res.json();
              setActiveTemplate(data.templateName);
            })(),
            fetchAvailableTemplates(), // Fetch the full list
          ]);
        } catch (err) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchInitialData();
    }
  }, [isOpen, fetchAvailableTemplates]);

  // Handle saving the chosen default template (this function is correct)
  const handleSelectTemplate = async (templateId) => {
    const originalTemplate = activeTemplate;
    setActiveTemplate(templateId);
    try {
      await fetch('/api/templates', { // Correct endpoint for updating
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateName: templateId }),
      });
    } catch (err) {
      alert('Error: Could not save your preference.');
      setActiveTemplate(originalTemplate);
    }
  };
  
  // --- NEW: Handle removing a custom template ---
  const handleRemoveTemplate = async (templateId) => {
    if (templateId === activeTemplate) {
      alert("You cannot remove an active template. Please select another one first.");
      return;
    }
    if (window.confirm(`Are you sure you want to remove the "${templateId}" template?`)) {
      try {
        await fetch('/api/templates/unassign', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ templateName: templateId }),
        });
        // Refresh the list to show the template has been removed
        await fetchAvailableTemplates();
      } catch (err) {
        alert('Error: Could not remove template.');
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={onClose} className="fixed inset-0 bg-black/30 z-40"/>
          
          <motion.div 
            initial={{ x: '100%' }} 
            animate={{ x: 0 }} 
            exit={{ x: '100%' }} 
            transition={{ type: 'spring', stiffness: 300, damping: 30 }} 
            className="fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-xl z-50 flex flex-col" // Slightly wider
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Invoice Templates</h2>
                <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-gray-600 mt-1">Choose a default design for your invoices.</p>
            </div>
            
            <div className="flex-grow overflow-y-auto p-6">
              {isLoading ? (
                <p className="text-gray-500 text-center">Loading templates...</p>
              ) : error ? (
                <p className="text-red-500 text-center">{error}</p>
              ) : (
                <TemplateSelection
                  // --- FIX: Pass the required props down to the child component ---
                  templates={availableTemplates}
                  activeTemplateId={activeTemplate}
                  onSelectTemplate={handleSelectTemplate}
                  onRemoveTemplate={handleRemoveTemplate}
                  // This className is suitable for a vertical layout in the sidebar
                  className="grid grid-cols-1 gap-5" 
                />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TemplatesSidebar;