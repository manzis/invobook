import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Eye, FileText, X, Check } from 'lucide-react';

// --- Mini Invoice Preview (colored thumbnail) ---
const MiniPreview = ({ template }) => {
  const colorSchemes = {
    'modern-blue': {
      accent: '#3960c9',
      accentLight: '#eef2ff',
      headerBg: '#3960c9',
      headerText: '#ffffff',
      tableBg: '#f1f5f9',
    },
    'modern-green': {
      accent: '#059669',
      accentLight: '#ecfdf5',
      headerBg: '#059669',
      headerText: '#ffffff',
      tableBg: '#f0fdf4',
    },
    'classic-tabular': {
      accent: '#1e293b',
      accentLight: '#f8fafc',
      headerBg: '#1e293b',
      headerText: '#ffffff',
      tableBg: '#f1f5f9',
    },
  };

  const colors = colorSchemes[template.id] || colorSchemes['classic-tabular'];

  if (template.isCustom && template.imageUrl) {
    return (
      <img
        src={template.imageUrl}
        alt={`Preview of ${template.name}`}
        className="w-full h-full object-cover"
      />
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', background: '#ffffff', padding: '12px', fontSize: '6px', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '9px', fontWeight: 700, color: colors.accent, letterSpacing: '-0.3px' }}>INVOICE</div>
        <div style={{ width: '24px', height: '24px', borderRadius: '4px', background: colors.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FileText style={{ width: '12px', height: '12px', color: colors.accent }} />
        </div>
      </div>

      {/* Info rows */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ width: '60%', height: '3px', background: '#e2e8f0', borderRadius: '2px', marginBottom: '3px' }} />
          <div style={{ width: '80%', height: '3px', background: '#e2e8f0', borderRadius: '2px', marginBottom: '3px' }} />
          <div style={{ width: '50%', height: '3px', background: '#e2e8f0', borderRadius: '2px' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ width: '70%', height: '3px', background: '#e2e8f0', borderRadius: '2px', marginBottom: '3px', marginLeft: 'auto' }} />
          <div style={{ width: '55%', height: '3px', background: '#e2e8f0', borderRadius: '2px', marginBottom: '3px', marginLeft: 'auto' }} />
          <div style={{ width: '45%', height: '3px', background: '#e2e8f0', borderRadius: '2px', marginLeft: 'auto' }} />
        </div>
      </div>

      {/* Table header */}
      <div style={{ background: colors.headerBg, borderRadius: '3px', padding: '4px 6px', display: 'flex', gap: '4px' }}>
        <div style={{ flex: 3, height: '3px', background: 'rgba(255,255,255,0.5)', borderRadius: '2px' }} />
        <div style={{ flex: 1, height: '3px', background: 'rgba(255,255,255,0.5)', borderRadius: '2px' }} />
        <div style={{ flex: 1, height: '3px', background: 'rgba(255,255,255,0.5)', borderRadius: '2px' }} />
        <div style={{ flex: 1, height: '3px', background: 'rgba(255,255,255,0.5)', borderRadius: '2px' }} />
      </div>

      {/* Table rows */}
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ padding: '3px 6px', display: 'flex', gap: '4px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ flex: 3, height: '3px', background: '#e2e8f0', borderRadius: '2px' }} />
          <div style={{ flex: 1, height: '3px', background: '#e2e8f0', borderRadius: '2px' }} />
          <div style={{ flex: 1, height: '3px', background: '#e2e8f0', borderRadius: '2px' }} />
          <div style={{ flex: 1, height: '3px', background: '#e2e8f0', borderRadius: '2px' }} />
        </div>
      ))}

      {/* Total */}
      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ background: colors.accentLight, borderRadius: '3px', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '20px', height: '3px', background: colors.accent, borderRadius: '2px', opacity: 0.5 }} />
          <div style={{ fontSize: '8px', fontWeight: 700, color: colors.accent }}>Rs. 0.00</div>
        </div>
      </div>
    </div>
  );
};

// --- Full Preview Modal ---
const PreviewModal = ({ template, isOpen, onClose }) => {
  if (!isOpen || !template) return null;

  const colorSchemes = {
    'modern-blue': { accent: '#3960c9', accentLight: '#eef2ff', headerBg: '#3960c9', tableBg: '#f1f5f9' },
    'modern-green': { accent: '#059669', accentLight: '#ecfdf5', headerBg: '#059669', tableBg: '#f0fdf4' },
    'classic-tabular': { accent: '#1e293b', accentLight: '#f8fafc', headerBg: '#1e293b', tableBg: '#f1f5f9' },
  };
  const colors = colorSchemes[template.id] || colorSchemes['classic-tabular'];

  return createPortal(
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        style={{ background: '#fff', borderRadius: '12px', width: '90%', maxWidth: '620px', maxHeight: '90vh', overflow: 'auto', position: 'relative' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>{template.name}</h3>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>Invoice template preview</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ border: 'none', background: '#f1f5f9', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <X style={{ width: '16px', height: '16px', color: '#64748b' }} />
          </button>
        </div>

        {/* Modal Body — Realistic Invoice Preview */}
        <div style={{ padding: '24px', background: '#f8fafc' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '32px', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#334155' }}>
            
            {/* Invoice Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h1 style={{ fontSize: '22px', fontWeight: 700, color: colors.accent, margin: '0 0 6px' }}>INVOICE</h1>
                <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '9999px', background: colors.accentLight, color: colors.accent, textTransform: 'uppercase' }}>
                  Pending
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: 600, color: '#0f172a', margin: '0 0 2px' }}>Your Business Name</p>
                <p style={{ margin: '0 0 2px', color: '#64748b', fontSize: '12px' }}>123 Business Street</p>
                <p style={{ margin: 0, color: '#64748b', fontSize: '12px' }}>Kathmandu, Nepal</p>
              </div>
            </div>

            {/* Bill To + Details */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <div>
                <p style={{ fontWeight: 500, color: '#64748b', fontSize: '11px', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Billed To</p>
                <p style={{ fontWeight: 600, color: '#0f172a', margin: '0 0 2px' }}>Client Company</p>
                <p style={{ margin: '0 0 1px', color: '#64748b', fontSize: '12px' }}>Client Address</p>
                <p style={{ margin: 0, color: '#64748b', fontSize: '12px' }}>Client City</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: '0 0 2px', fontSize: '12px' }}><strong>Invoice #:</strong> INV-001</p>
                <p style={{ margin: '0 0 2px', fontSize: '12px' }}><strong>Date:</strong> Jan 15, 2026</p>
                <p style={{ margin: 0, fontSize: '12px' }}><strong>Due:</strong> Feb 14, 2026</p>
              </div>
            </div>

            {/* Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
              <thead>
                <tr style={{ background: colors.headerBg }}>
                  <th style={{ padding: '8px 10px', textAlign: 'left', color: '#fff', fontSize: '11px', fontWeight: 600, borderRadius: '4px 0 0 4px' }}>Description</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center', color: '#fff', fontSize: '11px', fontWeight: 600 }}>Qty</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right', color: '#fff', fontSize: '11px', fontWeight: 600 }}>Rate</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right', color: '#fff', fontSize: '11px', fontWeight: 600, borderRadius: '0 4px 4px 0' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { desc: 'Web Development Services', qty: 1, rate: 45000, amt: 45000 },
                  { desc: 'UI/UX Design Package', qty: 1, rate: 25000, amt: 25000 },
                  { desc: 'Hosting & Maintenance (Monthly)', qty: 3, rate: 2000, amt: 6000 },
                ].map((item, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px 10px', fontSize: '12px' }}>{item.desc}</td>
                    <td style={{ padding: '8px 10px', fontSize: '12px', textAlign: 'center' }}>{item.qty}</td>
                    <td style={{ padding: '8px 10px', fontSize: '12px', textAlign: 'right' }}>Rs. {item.rate.toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', fontSize: '12px', textAlign: 'right', fontWeight: 500 }}>Rs. {item.amt.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: '220px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px' }}>
                  <span>Subtotal</span><span>Rs. 76,000</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px', color: '#64748b' }}>
                  <span>Tax (13%)</span><span>Rs. 9,880</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '14px', borderTop: '2px solid #e2e8f0', paddingTop: '8px', marginTop: '4px' }}>
                  <span>Total</span>
                  <span style={{ color: colors.accent }}>Rs. 85,880</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', fontSize: '11px', color: '#94a3b8' }}>
              <p style={{ margin: '0 0 4px', fontWeight: 600, color: '#64748b' }}>Notes</p>
              <p style={{ margin: 0 }}>Thank you for your business! Payment is due within 30 days.</p>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

// --- Template Card ---
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
      {isActive && (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--ds-black)] text-[var(--ds-white)]">
          <Check className="w-3 h-3" />
          Active
        </span>
      )}
    </div>

    <div className="h-44 rounded-lg mb-4 overflow-hidden" style={{ border: '1px solid var(--ds-gray-100)' }}>
      <MiniPreview template={template} />
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

// --- Main Component ---
export const TemplateSelection = ({
  templates = [],
  activeTemplateId,
  onSelectTemplate,
  onRemoveTemplate,
  className,
}) => {
  const [previewTemplate, setPreviewTemplate] = useState(null);

  return (
    <>
      <div className={className || 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'}>
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            isActive={template.id === activeTemplateId}
            onSelect={onSelectTemplate}
            onPreview={(t) => setPreviewTemplate(t)}
            onRemove={onRemoveTemplate}
          />
        ))}
      </div>

      <PreviewModal
        template={previewTemplate}
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
      />
    </>
  );
};

export default TemplateSelection;
