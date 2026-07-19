import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { User, Building, Mail, Phone, MapPin, Hash } from 'lucide-react';

const iconClass = 'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ds-gray-400)] pointer-events-none';

const ClientModal = ({ isOpen, onClose, onSave, clientToEdit, isSubmitting, isVendor }) => {
  const isEditMode = Boolean(clientToEdit);

  const getInitialState = () => {
    if (isEditMode) {
      return {
        name: clientToEdit.name || '',
        company: clientToEdit.company || '',
        email: clientToEdit.email || '',
        phone: clientToEdit.phone || '',
        address: clientToEdit.address || '',
        city: clientToEdit.city || '',
        taxId: clientToEdit.taxId || '',
      };
    }
    return { name: '', company: '', email: '', phone: '', address: '', city: '', taxId: '' };
  };

  const [formData, setFormData] = useState(getInitialState());
  const [error, setError] = useState('');

  useEffect(() => {
    setFormData(getInitialState());
  }, [clientToEdit, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    onSave(formData, clientToEdit?.id);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="ds-card-static w-full max-w-2xl relative">
        <div className="flex items-center justify-between mb-6">
          <h2 className="ds-card-title text-xl">
            {isEditMode 
              ? (isVendor ? 'Edit Vendor' : 'Edit Client') 
              : (isVendor ? 'Add New Vendor' : 'Add New Client')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="ds-icon-btn text-xl leading-none"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="ds-form-label">Full Name *</label>
              <div className="relative">
                <User className={iconClass} />
                <input
                  name="name"
                  type="text"
                  placeholder={isVendor ? "Enter vendor name" : "Enter client name"}
                  value={formData.name}
                  onChange={handleInputChange}
                  className="ds-input pl-10"
                  required
                />
              </div>
            </div>
            <div>
              <label className="ds-form-label">Company</label>
              <div className="relative">
                <Building className={iconClass} />
                <input
                  name="company"
                  type="text"
                  placeholder={isVendor ? "Enter vendor company" : "Enter client company"}
                  value={formData.company}
                  onChange={handleInputChange}
                  className="ds-input pl-10"
                />
              </div>
            </div>
            <div>
              <label className="ds-form-label">Email *</label>
              <div className="relative">
                <Mail className={iconClass} />
                <input
                  name="email"
                  type="email"
                  placeholder={isVendor ? "Enter vendor email" : "Enter client email"}
                  value={formData.email}
                  onChange={handleInputChange}
                  className="ds-input pl-10"
                />
              </div>
            </div>
            <div>
              <label className="ds-form-label">Phone</label>
              <div className="relative">
                <Phone className={iconClass} />
                <input
                  name="phone"
                  placeholder={isVendor ? "Enter vendor phone no" : "Enter client phone no"}
                  type="number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="ds-input pl-10"
                  required
                />
              </div>
            </div>
          </div>
          <div>
            <label className="ds-form-label">Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-[var(--ds-gray-400)] pointer-events-none" />
              <textarea
                name="address"
                placeholder={isVendor ? "Enter vendor address" : "Enter client address"}
                rows={2}
                value={formData.address}
                onChange={handleInputChange}
                className="ds-input pl-10 min-h-[72px] resize-y"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="ds-form-label">City</label>
              <div className="relative">
                <MapPin className={iconClass} />
                <input
                  name="city"
                  type="text"
                  placeholder={isVendor ? "Enter vendor city" : "Enter client city"}
                  value={formData.city}
                  onChange={handleInputChange}
                  className="ds-input pl-10"
                />
              </div>
            </div>
            <div>
              <label className="ds-form-label">Tax ID (Optional)</label>
              <div className="relative">
                <Hash className={iconClass} />
                <input
                  name="taxId"
                  type="text"
                  placeholder={isVendor ? "Enter vendor Tax id like: vat pan etc" : "Enter client Tax id like: vat pan etc"}
                  value={formData.taxId}
                  onChange={handleInputChange}
                  className="ds-input pl-10"
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="text-center text-sm text-[var(--ds-ship-red)]">{error}</p>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="ds-btn-ghost">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="ds-btn-dark">
              {isSubmitting
                ? isEditMode
                  ? 'Saving...'
                  : 'Adding...'
                : isEditMode
                  ? 'Save Changes'
                  : (isVendor ? 'Add Vendor' : 'Add Client')}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default ClientModal;
