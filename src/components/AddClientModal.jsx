import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { User, Building, Mail, Phone, MapPin, Hash } from 'lucide-react';

const ClientModal = ({ isOpen, onClose, onSave, clientToEdit, isSubmitting }) => {
  // Determine if we are in "edit" mode
  const isEditMode = Boolean(clientToEdit);

  const getInitialState = () => {
    if (isEditMode) {
      // If editing, pre-fill the form with the client's data
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
    // If adding, return a blank state
    return { name: '', company: '', email: '', phone: '', address: '', city: '', taxId: '' };
  };

  const [formData, setFormData] = useState(getInitialState());
  const [error, setError] = useState('');

  // Effect to update the form when the clientToEdit prop changes
  useEffect(() => {
    setFormData(getInitialState());
  }, [clientToEdit, isOpen]); // Reset form when client or open state changes

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    // The onSave prop now handles the API call
    // Pass the form data and the client's ID (if it exists)
    onSave(formData, clientToEdit?.id);
  };

  // The modal will not render if it's not open
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 relative">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditMode ? 'Edit Client' : 'Add New Client'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-2xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Form fields are the same as before */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input name="name" type="text" placeholder="Enter client name" value={formData.name} onChange={handleInputChange} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input name="company" type="text" placeholder="Enter client company" value={formData.company} onChange={handleInputChange} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input name="email" type="email" placeholder="Enter client email"value={formData.email} onChange={handleInputChange} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"  />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input name="phone" placeholder="Enter client phone no"type="number" value={formData.phone} onChange={handleInputChange} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg" required/>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <textarea name="address" placeholder="Enter client address" rows={2} value={formData.address} onChange={handleInputChange} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input name="city" type="text" placeholder="Enter client city" value={formData.city} onChange={handleInputChange} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tax ID (Optional)</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input name="taxId" type="text"placeholder="Enter client Tax id like: vat pan etc" value={formData.taxId} onChange={handleInputChange} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>
          </div>
          
          {error && <div className="text-center text-red-500 text-sm">{error}</div>}
          
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400">
              {isSubmitting 
                ? (isEditMode ? 'Saving...' : 'Adding...') 
                : (isEditMode ? 'Save Changes' : 'Add Client')
              }
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default ClientModal;