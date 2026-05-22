'use client';

import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { renderToStaticMarkup } from 'react-dom/server';
import { X } from 'lucide-react';
import { ModernBlueTemplate } from '../pdf/modern-blue';
import { ModernGreenTemplate } from '../pdf/modern-green';
import { ClassicTemplate } from '../pdf/classic-black';

const templateMap = {
  'modern-blue': ModernBlueTemplate,
  'modern-green': ModernGreenTemplate,
  'classic-tabular': ClassicTemplate,
};

const InvoicePreviewModal = ({ isOpen, onClose, invoiceData, templateName }) => {
  const iframeSrcDoc = useMemo(() => {
    if (!isOpen || !invoiceData) return '';

    // Build the data shape the PDF templates expect
    const previewData = {
      business: {
        businessName: invoiceData.businessName || 'Your Business',
        address: invoiceData.businessAddress || '',
        city: invoiceData.businessCity || '',
        state: invoiceData.businessState || '',
        zipCode: invoiceData.businessZipCode || '',
        phone: invoiceData.businessPhone || '',
        logoUrl: invoiceData.logoUrl || null,
        taxId: invoiceData.businessTaxId || '',
        currency: 'NPR',
      },
      client: {
        name: invoiceData.clientName || 'Client Name',
        email: invoiceData.clientEmail || '',
        company: invoiceData.clientCompany || '',
        address: invoiceData.clientAddress || '',
        city: invoiceData.clientCity || '',
        phone: invoiceData.clientPhone || '',
        taxId: invoiceData.clientTaxId || '',
      },
      invoice: {
        invoiceNumber: invoiceData.invoiceNumber || 'INV-001',
        date: invoiceData.date || new Date().toISOString(),
        dueDate: invoiceData.dueDate || new Date().toISOString(),
        status: invoiceData.status || 'PENDING',
        items: (invoiceData.items || []).map((item, i) => ({
          id: item.id || i,
          description: item.description || '',
          quantity: parseFloat(item.quantity) || 0,
          rate: parseFloat(item.rate) || 0,
          amount: parseFloat(item.amount) || 0,
        })),
        subtotal: parseFloat(invoiceData.subtotal) || 0,
        discountType: invoiceData.discountType || 'PERCENTAGE',
        discountValue: parseFloat(invoiceData.discountValue) || 0,
        discountAmount: parseFloat(invoiceData.discountAmount) || 0,
        taxRate: parseFloat(invoiceData.taxRate) || 0,
        taxAmount: parseFloat(invoiceData.taxAmount) || 0,
        shippingCost: parseFloat(invoiceData.shippingCost) || 0,
        total: parseFloat(invoiceData.total) || 0,
        amountPaid: parseFloat(invoiceData.amountPaid) || 0,
        balanceDue: (parseFloat(invoiceData.total) || 0) - (parseFloat(invoiceData.amountPaid) || 0),
        notes: invoiceData.notes || '',
        terms: invoiceData.terms || '',
      },
      user: {
        email: invoiceData.businessEmail || '',
      },
    };

    const TemplateComponent = templateMap[templateName] || ModernBlueTemplate;

    try {
      const htmlString = renderToStaticMarkup(
        <TemplateComponent invoiceData={previewData} />
      );
      return htmlString;
    } catch (err) {
      console.error('Preview render error:', err);
      return `<html><body><p style="padding:24px;font-family:sans-serif;color:#ef4444;">Failed to render preview. Please check your invoice data.</p></body></html>`;
    }
  }, [isOpen, invoiceData, templateName]);

  if (!isOpen) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#f8fafc',
          borderRadius: '12px',
          width: '95%',
          maxWidth: '850px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            background: '#fff',
            borderBottom: '1px solid #e2e8f0',
            flexShrink: 0,
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#0f172a' }}>
              Invoice Preview
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
              {templateName
                ? templateName.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
                : 'Default'}{' '}
              template — Live preview with your data
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: 'none',
              background: '#f1f5f9',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <X style={{ width: '16px', height: '16px', color: '#64748b' }} />
          </button>
        </div>

        {/* Modal Body — iframe with the rendered template */}
        <div style={{ flex: 1, overflow: 'hidden', padding: '20px', background: '#f1f5f9' }}>
          <iframe
            srcDoc={iframeSrcDoc}
            title="Invoice Preview"
            style={{
              width: '100%',
              height: '100%',
              minHeight: '500px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              background: '#fff',
            }}
            sandbox="allow-same-origin"
          />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default InvoicePreviewModal;
