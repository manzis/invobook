import React from 'react';
import { Eye, FileText, X } from 'lucide-react';

const TemplateCard = ({ template, isActive, onSelect, onPreview, onRemove }) => (
  <div
    className={`ds-card-static relative group transition-shadow ${
      isActive ? 'ring-2 ring-[var(--ds-black)]' : ''
    }`}
  >
    {template.isCustom && (
      <button
        type="button"
        onClick={() => onRemove(template.id)}
        className="absolute top-3 right-3 z-10 p-1.5 bg-[var(--ds-black)] text-[var(--ds-white)] rounded-full opacity-70 group-hover:opacity-100 transition-opacity hover:opacity-90"
        aria-label={`Remove ${template.name} template`}
      >
        <X className="w-4 h-4" />
      </button>
    )}

    <div className="flex items-center justify-between mb-3">
      <h4 className="text-base font-semibold text-[var(--ds-black)]">{template.name}</h4>
      {isActive && <span className="ds-badge-pill">Active</span>}
    </div>

    <div className="h-40 rounded-lg mb-4 overflow-hidden ds-shadow-ring">
      {template.isCustom ? (
        <img
          src={template.imageUrl || 'https://placehold.co/400x560/E2E8F0/475569?text=Preview'}
          alt={`Preview of ${template.name}`}
          className="w-full h-full object-cover ds-surface-muted"
        />
      ) : (
        <div
          className={`w-full h-full flex items-center justify-center ${
            template.previewClass || 'ds-surface-muted'
          }`}
        >
          <FileText className="w-8 h-8 text-[var(--ds-gray-400)]" />
        </div>
      )}
    </div>

    <div className="flex items-center justify-between">
      <button
        type="button"
        onClick={() => onPreview(template)}
        className="ds-btn-ghost !px-0 !shadow-none gap-1.5 text-sm text-[var(--ds-gray-600)] hover:!shadow-none"
      >
        <Eye className="w-4 h-4" />
        <span>Preview</span>
      </button>
      <button
        type="button"
        onClick={() => onSelect(template.id)}
        disabled={isActive}
        className={isActive ? 'ds-btn-ghost opacity-50 cursor-not-allowed' : 'ds-btn-dark'}
      >
        {isActive ? 'Selected' : 'Use Template'}
      </button>
    </div>
  </div>
);

export const TemplateSelection = ({
  templates = [],
  activeTemplateId,
  onSelectTemplate,
  onRemoveTemplate,
  className,
}) => {
  const defaultPreviewStyles = {
    'modern-blue': 'bg-[var(--ds-gray-100)]',
    'modern-green': 'bg-[var(--ds-gray-50)]',
    'classic-tabular': 'bg-[var(--ds-black)]',
  };

  const templatesWithPreviews = templates.map((template) => ({
    ...template,
    previewClass: !template.isCustom ? defaultPreviewStyles[template.id] : null,
  }));

  const handlePreview = (template) => {
    alert(`This would open a preview for the "${template.name}" template.`);
  };

  return (
    <div className={className || 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'}>
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
