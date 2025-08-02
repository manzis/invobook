// components/TemplatesSidebar.jsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
// Corrected the import path assuming the component is in the same directory or a sub-directory
import { TemplateSelection } from './templateSelection';

const TemplatesSidebar = ({ isOpen, onClose }) => {
  const [activeTemplate, setActiveTemplate] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the current setting when the sidebar becomes visible
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      // Corrected the API endpoint to match our previous setup
      fetch('/api/templates') 
        .then(res => {
          if (!res.ok) throw new Error('Could not fetch settings');
          return res.json();
        })
        .then(data => setActiveTemplate(data.templateName))
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  // Handle selection and update the backend
  const handleSelectTemplate = async (templateId) => {
    const originalTemplate = activeTemplate;
    setActiveTemplate(templateId); // Update UI immediately
    try {
      // Corrected the API endpoint to match our previous setup
      await fetch('/api/templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateName: templateId }),
      });
    } catch (err) {
      alert('Error: Could not save your preference.');
      setActiveTemplate(originalTemplate); // Revert on failure
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={onClose} className="fixed inset-0 bg-black/20 z-40"/>
          
          {/* --- FIX IS ON THIS LINE --- */}
          <motion.div 
            initial={{ x: '100%' }} 
            animate={{ x: 0 }} 
            exit={{ x: '100%' }} 
            transition={{ type: 'spring', stiffness: 300, damping: 30 }} 
            // Changed max-w-md to max-w-xl to increase width
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
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
                <p className="text-gray-500">Loading templates...</p>
              ) : (
                <TemplateSelection
                  className="flex flex-col gap-5" 
                  activeTemplateId={activeTemplate}
                  onSelectTemplate={handleSelectTemplate}
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