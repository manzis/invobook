import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const InventoryModal = ({ isOpen, onClose, item, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    rate: '',
    purchasePrice: '',
    quantity: '',
    unit: 'pcs',
    lowStock: '5',
    category: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        sku: item.sku || '',
        rate: item.rate || '',
        purchasePrice: item.purchasePrice || '',
        quantity: item.quantity || '',
        unit: item.unit || 'pcs',
        lowStock: item.lowStock || '5',
        category: item.category || ''
      });
    } else {
      setFormData({
        name: '', description: '', sku: '', rate: '', purchasePrice: '', quantity: '', unit: 'pcs', lowStock: '5', category: ''
      });
    }
  }, [item, isOpen]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (parseFloat(formData.purchasePrice) > parseFloat(formData.rate)) {
      toast('Purchase price cannot be higher than the sales rate.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const url = item ? `/api/inventory/${item.id}` : '/api/inventory';
      const method = item ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const itemData = await res.json();
        toast(`Product ${item ? 'updated' : 'added'} successfully.`);
        onSuccess(itemData);
        onClose();
      } else {
        const errorData = await res.json();
        toast(errorData.message || 'Failed to save product.');
      }
    } catch (err) {
      console.error(err);
      toast('An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[rgba(0,0,0,0.4)] backdrop-blur-sm">
      <div 
        className="bg-[var(--ds-white)] rounded-[var(--ds-radius-card)] w-full max-w-2xl overflow-hidden ds-shadow-card-full flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-[var(--ds-gray-200)]">
          <h2 className="text-xl font-semibold text-[var(--ds-black)]">{item ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} className="ds-icon-btn">
            <X className="w-5 h-5 text-[var(--ds-gray-500)]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[70vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="ds-form-label">Product Name *</label>
              <input 
                type="text" 
                required 
                className="ds-input" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                placeholder="e.g. Website Design Package"
              />
            </div>

            <div>
              <label className="ds-form-label">SKU (Optional)</label>
              <input 
                type="text" 
                className="ds-input" 
                value={formData.sku} 
                onChange={e => setFormData({...formData, sku: e.target.value})} 
                placeholder="e.g. WD-001"
              />
            </div>
            
            <div>
              <label className="ds-form-label">Category</label>
              <input 
                type="text" 
                className="ds-input" 
                value={formData.category} 
                onChange={e => setFormData({...formData, category: e.target.value})} 
                placeholder="e.g. Services, Hardware"
              />
            </div>

            <div>
              <label className="ds-form-label">Sales Rate *</label>
              <input 
                type="number" 
                required 
                step="0.01"
                min="0"
                className="ds-input" 
                value={formData.rate} 
                onChange={e => setFormData({...formData, rate: e.target.value})} 
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="ds-form-label">Purchase Price</label>
              <input 
                type="number" 
                step="0.01"
                min="0"
                className="ds-input" 
                value={formData.purchasePrice} 
                onChange={e => setFormData({...formData, purchasePrice: e.target.value})} 
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="ds-form-label">Unit Type</label>
              <select 
                className="ds-select w-full" 
                value={formData.unit} 
                onChange={e => setFormData({...formData, unit: e.target.value})}
              >
                <option value="pcs">Pieces (pcs)</option>
                <option value="hrs">Hours (hrs)</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="days">Days</option>
                <option value="flat">Flat Rate</option>
              </select>
            </div>

            <div>
              <label className="ds-form-label">Current Stock Quantity</label>
              <input 
                type="number" 
                step="0.1"
                className="ds-input" 
                value={formData.quantity} 
                onChange={e => setFormData({...formData, quantity: e.target.value})} 
                placeholder="0"
              />
            </div>

            <div>
              <label className="ds-form-label">Low Stock Alert Threshold</label>
              <input 
                type="number" 
                className="ds-input" 
                value={formData.lowStock} 
                onChange={e => setFormData({...formData, lowStock: e.target.value})} 
                placeholder="5"
              />
            </div>

            <div className="md:col-span-2">
              <label className="ds-form-label">Description (appears on invoices)</label>
              <textarea 
                className="ds-input resize-y min-h-[80px]" 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                placeholder="Detailed description of the product or service..."
              />
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-[var(--ds-gray-200)] flex justify-end gap-3 bg-[var(--ds-gray-50)]">
          <button type="button" onClick={onClose} className="ds-btn-ghost">Cancel</button>
          <button type="submit" onClick={handleSubmit} disabled={isSubmitting} className="ds-btn-dark gap-2 min-w-[120px] justify-center">
            {isSubmitting ? <span className="animate-pulse">Saving...</span> : <><Save className="w-4 h-4" /> <span>Save Product</span></>}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default InventoryModal;
