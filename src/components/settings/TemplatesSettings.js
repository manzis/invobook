import React from 'react';
import { Eye, FileText } from 'lucide-react';

// You could even make a separate <TemplateCard /> component for a deeper refactor
const TemplateCard = ({ template }) => (
  <div className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${template.active ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
    <div className="flex items-center justify-between mb-3">
      <h4 className="font-medium text-gray-900">{template.name}</h4>
      {template.active && <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Active</span>}
    </div>
    <div className={`h-24 ${template.preview} rounded-lg mb-3 flex items-center justify-center`}>
        <FileText className="w-8 h-8 text-white" />
    </div>
    <div className="flex items-center justify-between">
      <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800"><Eye className="w-4 h-4" /><span>Preview</span></button>
      <button className={`px-3 py-1 rounded-lg text-sm ${template.active ? 'bg-gray-200 text-gray-500' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>{template.active ? 'Active' : 'Use'}</button>
    </div>
  </div>
);

const TemplatesSettings = () => {
  const templates = [
    { id: 1, name: 'Modern Blue', preview: 'bg-gradient-to-br from-blue-500 to-blue-600', active: true },
    { id: 2, name: 'Professional Gray', preview: 'bg-gradient-to-br from-gray-500 to-gray-600', active: false },
    //... add other templates
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Templates</h3>
      <p className="text-gray-600 mb-6">Choose a template design for your invoices</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((template) => <TemplateCard key={template.id} template={template} />)}
      </div>
    </div>
  );
};

export default TemplatesSettings;