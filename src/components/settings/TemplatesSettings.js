import React, { useState, useEffect, useCallback } from 'react';
import { TemplateSelection } from '../templateSelection';

const TemplatesSettings = () => {
  const [activeTemplate, setActiveTemplate] = useState('');
  const [availableTemplates, setAvailableTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [templateKey, setTemplateKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ message: '', type: '' });

  const fetchAvailableTemplates = useCallback(async () => {
    try {
      const res = await fetch('/api/templates/available');
      if (!res.ok) throw new Error('Could not fetch the list of available templates');
      const templatesData = await res.json();
      setAvailableTemplates(templatesData);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await Promise.all([
          (async () => {
            // *** CRITICAL FIX: The API path is /api/settings/template ***
            const res = await fetch('/api/templates'); 
            if (!res.ok) throw new Error('Could not fetch current template setting');
            const data = await res.json();
            setActiveTemplate(data.templateName);
          })(),
          fetchAvailableTemplates(),
        ]);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, [fetchAvailableTemplates]);

  const handleSelectTemplate = async (templateId) => {
    const originalTemplate = activeTemplate;
    setActiveTemplate(templateId);
    try {
        // *** CRITICAL FIX: The API path is /api/settings/template ***
      const res = await fetch('/api/templates', { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateName: templateId }),
      });
      if (!res.ok) throw new Error('Failed to save selection');
    } catch (err) {
      alert('Error: Could not save your preference.');
      setActiveTemplate(originalTemplate);
    }
  };

  const handleAddTemplate = async (e) => {
    e.preventDefault();
    if (!templateKey.trim()) {
      setFeedback({ message: 'Please enter a template key.', type: 'error' });
      return;
    }
    setIsSubmitting(true);
    setFeedback({ message: '', type: '' });

    try {
      const res = await fetch('/api/templates/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // --- KEY CHANGE HERE ---
        // The property name now matches what the API expects: `templateKey`
        body: JSON.stringify({ templateKey: templateKey }), 
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'An unknown error occurred.');
      }
      
      setFeedback({ message: 'Success! Template added to your collection.', type: 'success' });
      setTemplateKey('');
      
      await fetchAvailableTemplates();

    } catch (err) {
      setFeedback({ message: err.message, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- NEW: HANDLE REMOVING A CUSTOM TEMPLATE ---
  const handleRemoveTemplate = async (templateId) => {
    // Prevent user from removing the active template
    if (templateId === activeTemplate) {
      alert("You cannot remove a template while it is active. Please select another template first.");
      return;
    }

    if (!window.confirm(`Are you sure you want to remove the "${templateId}" template?`)) {
      return;
    }
    
    try {
      const res = await fetch('/api/templates/unassign', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateName: templateId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to remove template');
      }
      // Refresh the list to remove it from the UI
      await fetchAvailableTemplates();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };


  if (isLoading) return <div>Loading template settings...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Templates</h3>
        <p className="text-gray-600 mb-6">Choose a default template design for all your invoices.</p>
        
        <TemplateSelection
          templates={availableTemplates}
          activeTemplateId={activeTemplate}
          onSelectTemplate={handleSelectTemplate}
          onRemoveTemplate={handleRemoveTemplate} // <-- Pass the new handler down
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-2">Add Custom Template</h4>
        <p className="text-gray-600 mb-4">Have a key for a premium or branded template? Add it here.</p>
        <form onSubmit={handleAddTemplate} className="flex items-start space-x-3">
          <div className="flex-grow">
            <input
              type="text"
              value={templateKey}
              onChange={(e) => setTemplateKey(e.target.value)}
              placeholder="Enter your template key..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              disabled={isSubmitting}
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Adding...' : 'Add Template'}
          </button>
        </form>
        {feedback.message && (
          <p className={`mt-3 text-sm ${feedback.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
            {feedback.message}
          </p>
        )}
      </div>
    </>
  );
};

export default TemplatesSettings;