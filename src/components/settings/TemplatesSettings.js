import React, { useState, useEffect, useCallback } from 'react';
import { TemplateSelection } from '../templateSelection';
import { useToast } from '../../context/ToastContext';

const TemplatesSettings = () => {
  const { toast } = useToast();
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
      const res = await fetch('/api/templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateName: templateId }),
      });
      if (!res.ok) throw new Error('Failed to save selection');
    } catch (err) {
      toast('Error: Could not save your preference.');
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

  const handleRemoveTemplate = async (templateId) => {
    if (templateId === activeTemplate) {
      toast(
        'You cannot remove a template while it is active. Please select another template first.'
      );
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
      await fetchAvailableTemplates();
    } catch (err) {
      toast(`Error: ${err.message}`);
    }
  };

  if (isLoading) return <div className="text-[var(--ds-gray-600)]">Loading template settings...</div>;
  if (error) return <div className="text-[var(--ds-ship-red)]">Error: {error}</div>;

  return (
    <>
      <div className="ds-card-static">
        <h3 className="ds-card-title text-lg mb-2">Invoice Templates</h3>
        <p className="text-[var(--ds-gray-600)] mb-6">
          Choose a default template design for all your invoices.
        </p>

        <TemplateSelection
          templates={availableTemplates}
          activeTemplateId={activeTemplate}
          onSelectTemplate={handleSelectTemplate}
          onRemoveTemplate={handleRemoveTemplate}
        />
      </div>

      <div className="ds-card-static mt-6">
        <h4 className="ds-card-title text-lg mb-2">Add Custom Template</h4>
        <p className="text-[var(--ds-gray-600)] mb-4">
          Have a key for a premium or branded template? Add it here.
        </p>
        <form onSubmit={handleAddTemplate} className="flex flex-col sm:flex-row items-start gap-3">
          <div className="flex-grow w-full min-w-0">
            <input
              type="text"
              value={templateKey}
              onChange={(e) => setTemplateKey(e.target.value)}
              placeholder="Enter your template key..."
              className="ds-input"
              disabled={isSubmitting}
            />
          </div>
          <button type="submit" disabled={isSubmitting} className="ds-btn-dark shrink-0">
            {isSubmitting ? 'Adding...' : 'Add Template'}
          </button>
        </form>
        {feedback.message && (
          <p
            className={`mt-3 text-sm ${
              feedback.type === 'error' ? 'text-[var(--ds-ship-red)]' : 'text-[#059669]'
            }`}
          >
            {feedback.message}
          </p>
        )}
      </div>
    </>
  );
};

export default TemplatesSettings;
