// components/settings/TemplateSelection.jsx

import React from 'react';
import { Eye, FileText } from 'lucide-react';

// The TemplateCard component with the requested UI refinements.
const TemplateCard = ({ template, isActive, onSelect, onPreview }) => (
  <div 
    className={`
      rounded-xl p-4 transition-all duration-200 ease-in-out
      ${isActive 
        ? 'border-2 border-blue-500 bg-blue-50 shadow-md' // Active state
        // --- FIX: Normal border is now `border` (1px) and `border-gray-200`. On hover, it becomes `border-blue-500`. ---
        : 'border border-gray-200 hover:border-blue-500' 
      }
    `}
  >
    <div className="flex items-center justify-between mb-3">
      <h4 className="font-semibold text-gray-900">{template.name}</h4>
      {isActive && (
        // --- FIX: The "Active" text now uses softer blue colors. ---
        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
          Active
        </span>
      )}
    </div>
    <div className={`h-28 ${template.preview} rounded-lg mb-4 flex items-center justify-center`}>
      <FileText className="w-8 h-8 text-white/70" />
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
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isActive ? 'Active' : 'Use Template'}
      </button>
    </div>
  </div>
);


// The parent component remains unchanged.
export const TemplateSelection = ({ activeTemplateId, onSelectTemplate, className }) => {
  const templates = [
    { id: 'modern-blue', name: 'Modern Blue', preview: 'bg-gradient-to-br from-blue-500 to-blue-700' },
    { id: 'modern-green', name: 'Modern Green', preview: 'bg-gradient-to-br from-emerald-500 to-emerald-700' },
    { id: 'classic-tabular', name: 'Classic Tabular', preview: 'bg-gradient-to-br from-gray-800 to-black' },
  ];
  
  const handlePreview = (template) => {
    alert(`Previewing "${template.name}" template...`);
  };

  return (
    <div className={className || 'grid grid-cols-1 md:grid-cols-2 gap-5'}>
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          isActive={template.id === activeTemplateId}
          onSelect={onSelectTemplate}
          onPreview={handlePreview}
        />
      ))}
    </div>
  );
};

export default TemplateSelection;