// components/templateSelection.jsx

import React from 'react';
import { Eye, FileText, X } from 'lucide-react';

// This is the child component. It's only responsible for rendering.
// It will now conditionally render an image or a colored background.
const TemplateCard = ({ template, isActive, onSelect, onPreview, onRemove }) => (
  <div 
    className={`
      relative group rounded-xl p-4 transition-all duration-200 ease-in-out
      ${isActive 
        ? 'border-2 border-blue-500 bg-blue-50 shadow-md'
        : 'border border-gray-200 hover:border-blue-500'
      }
    `}
  >
    {template.isCustom && (
      <button
        onClick={() => onRemove(template.id)}
        className="absolute top-3 right-3 z-10 p-1.5 bg-red-600 text-white rounded-full opacity-50 group-hover:opacity-100 transition-opacity hover:bg-red-700"
        aria-label={`Remove ${template.name} template`}
      >
        <X className="w-4 h-4" />
      </button>
    )}
    
    <div className="flex items-center justify-between mb-3">
      <h4 className="font-semibold text-gray-900">{template.name}</h4>
      {isActive && (
        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
          Active
        </span>
      )}
    </div>

    {/* --- NEW: CONDITIONAL PREVIEW LOGIC --- */}
    <div className="h-40 rounded-lg mb-4 overflow-hidden">
      {template.isCustom ? (
        // For CUSTOM templates, render the image.
        // A fallback URL is used if the image is missing.
        <img 
          src={template.imageUrl || 'https://placehold.co/400x560/E2E8F0/475569?text=Preview'} 
          alt={`Preview of ${template.name}`} 
          className="w-full h-full object-cover bg-gray-200" // bg-gray-200 for loading
        />
      ) : (
        // For DEFAULT templates, render the colored div with an icon.
        <div className={`w-full h-full flex items-center justify-center rounded-lg ${template.previewClass || 'bg-gray-200'}`}>
          <FileText className="w-8 h-8 text-white/70" />
        </div>
      )}
    </div>

    <div className="flex items-center justify-between">
      <button 
        onClick={() => onPreview(template)} 
        className="flex items-center space-x-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Eye className="w-4 h-4" />
        <span>Preview</span>
      </button>
      <button 
        onClick={() => onSelect(template.id)} 
        disabled={isActive} 
        className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
          isActive 
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
            : 'bg-indigo-600 text-white hover:bg-indigo-700'
        }`}
      >
        {isActive ? 'Selected' : 'Use Template'}
      </button>
    </div>
  </div>
);


// This is the main, exported parent component.
// It now contains the logic to prepare the data for the cards.
export const TemplateSelection = ({ 
  templates = [],
  activeTemplateId, 
  onSelectTemplate,
  onRemoveTemplate,
  className 
}) => {
  
  // --- NEW: Define the preview styles for default templates here ---
  const defaultPreviewStyles = {
    'modern-blue': 'bg-gradient-to-br from-blue-500 to-blue-700',
    'modern-green': 'bg-gradient-to-br from-emerald-500 to-emerald-700',
    'classic-tabular': 'bg-gradient-to-br from-gray-800 to-black',
  };

  // Enhance the templates data with the local preview styles
  const templatesWithPreviews = templates.map(template => ({
    ...template,
    // If it's a default template, find its style from the map above
    previewClass: !template.isCustom ? defaultPreviewStyles[template.id] : null,
  }));
  
  const handlePreview = (template) => {
    alert(`This would open a preview for the "${template.name}" template.`);
  };

  return (
    <div className={className || 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'}>
      {/* We map over the ENHANCED templates array */}
      {templatesWithPreviews.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          isActive={template.id === activeTemplateId}
          onSelect={onSelectTemplate}
          onPreview={handlePreview}
          onRemove={onRemoveTemplate}
        />
      ))}
    </div>
  );
};

export default TemplateSelection;