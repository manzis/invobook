import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { User, Building, Mail, Phone, MapPin, Hash } from 'lucide-react'; // Added Hash icon

const AddClientModal = ({ isOpen, onClose, onClientAdded }) => {
  // --- UPDATED: Add city and taxId to the initial state ---
  const initialState = { name: '', company: '', email: '', phone: '', address: '', city: '', taxId: '' };
  const [formData, setFormData] = useState(initialState);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData), // The full formData object is sent
      });
      const newClient = await res.json();
      if (!res.ok) throw new Error(newClient.message || "Failed to create the client.");
      onClientAdded(newClient);
      handleClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData(initialState); // Reset to the initial state
    setError('');
    onClose();
  };

  const [isBrowser, setIsBrowser] = useState(false);
  useEffect(() => { setIsBrowser(true); }, []);

  if (!isOpen || !isBrowser) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 relative">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Add New Client</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">×</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input name="name" type="text" value={formData.name} onChange={handleInputChange} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg" placeholder="John Doe" required />
              </div>
            </div>
            {/* Company */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input name="company" type="text" value={formData.company} onChange={handleInputChange} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg" placeholder="Company Name" />
              </div>
            </div>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input name="email" type="email" value={formData.email} onChange={handleInputChange} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg" placeholder="john@company.com" required />
              </div>
            </div>
            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input name="phone" type="tel" value={formData.phone} onChange={handleInputChange} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg" placeholder="+1 (555) 123-4567" />
              </div>
            </div>
          </div>
          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <textarea name="address" rows={2} value={formData.address} onChange={handleInputChange} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg" placeholder="123 Business Street..." />
            </div>
          </div>
          
          {/* --- ADDED: City and Tax ID Fields --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input name="city" type="text" value={formData.city} onChange={handleInputChange} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg" placeholder="New York" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tax ID (Optional)</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input name="taxId" type="text" value={formData.taxId} onChange={handleInputChange} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg" placeholder="e.g., VAT, EIN" />
              </div>
            </div>
          </div>
          
          {error && <div className="text-center text-red-500 text-sm">{error}</div>}
          
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={handleClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400">
              {isSubmitting ? 'Adding Client...' : 'Add Client'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default AddClientModal;