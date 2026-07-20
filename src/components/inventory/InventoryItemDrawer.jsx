import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Box, Receipt, Users, TrendingUp, Package, AlertCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const InventoryItemDrawer = ({ isOpen, onClose, item, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' or 'edit'
  const [formData, setFormData] = useState({
    name: '', description: '', sku: '', rate: '', purchasePrice: '', quantity: '', unit: 'pcs', lowStock: '5', category: ''
  });
  
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  
  // Animation state
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch full item details (including analytics) if it's an existing item
  useEffect(() => {
    if (isOpen && item) {
      setActiveTab('analytics');
      fetchItemData(item.id);
    } else if (isOpen && !item) {
      // If no item, default to edit mode (Add Product)
      setActiveTab('edit');
      setFormData({
        name: '', description: '', sku: '', rate: '', purchasePrice: '', quantity: '', unit: 'pcs', lowStock: '5', category: ''
      });
      setAnalytics(null);
    }
  }, [isOpen, item]);

  const fetchItemData = async (id) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/inventory/${id}`);
      if (res.ok) {
        const data = await res.json();
        setFormData({
          name: data.name || '',
          description: data.description || '',
          sku: data.sku || '',
          rate: data.rate || '',
          purchasePrice: data.purchasePrice || '',
          quantity: data.quantity || '',
          unit: data.unit || 'pcs',
          lowStock: data.lowStock || '5',
          category: data.category || ''
        });
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error(error);
      toast('Failed to load item analytics.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300); // Matches transition duration
  };

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
        // Refresh analytics if we are editing an existing item
        if (item) {
          fetchItemData(item.id);
          setActiveTab('analytics');
        } else {
          handleClose();
        }
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

  if (!isOpen && !isClosing) return null;
  if (!mounted) return null;

  const drawerContent = (
    <div className="fixed inset-0 z-[9999] flex justify-end">
      {/* Backdrop overlay */}
      <div 
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        onClick={handleClose}
      />
      
      {/* Right Drawer */}
      <div 
        className={`relative w-full max-w-[500px] h-full bg-[var(--ds-white)] border-l border-[#eaeaea] shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isClosing ? 'translate-x-full' : 'translate-x-0'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-[#eaeaea]">
          <div>
            <h2 className="text-xl font-semibold text-[var(--ds-black)]">
              {item ? formData.name || 'Product Details' : 'Add New Product'}
            </h2>
            {item && formData.sku && <p className="text-xs text-[var(--ds-gray-500)] mt-1">SKU: {formData.sku}</p>}
          </div>
          <button onClick={handleClose} className="ds-icon-btn rounded-full hover:bg-[var(--ds-gray-100)] p-2">
            <X className="w-5 h-5 text-[var(--ds-gray-500)]" />
          </button>
        </div>

        {/* Tabs (Only show if viewing existing item) */}
        {item && (
          <div className="flex overflow-x-auto border-b border-[#eaeaea] px-6 scrollbar-hide">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'analytics' ? 'border-[var(--ds-black)] text-[var(--ds-black)]' : 'border-transparent text-[var(--ds-gray-500)] hover:text-[var(--ds-black)]'}`}
            >
              Analytics & Overview
            </button>
            <button
              onClick={() => setActiveTab('edit')}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'edit' ? 'border-[var(--ds-black)] text-[var(--ds-black)]' : 'border-transparent text-[var(--ds-gray-500)] hover:text-[var(--ds-black)]'}`}
            >
              Edit Details
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && activeTab === 'analytics' ? (
            <div className="p-6 flex flex-col items-center justify-center h-full text-[var(--ds-gray-400)] space-y-4">
              <div className="w-8 h-8 rounded-full border-2 border-t-[var(--ds-black)] animate-spin border-[#eaeaea]"></div>
              <p className="text-sm font-medium">Loading Product Data...</p>
            </div>
          ) : (
            <>
              {/* ANALYTICS TAB */}
              {activeTab === 'analytics' && item && analytics && (
                <div className="p-6 space-y-8">
                  
                  {/* Stock Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="ds-card-static p-4 flex flex-col">
                      <span className="text-xs font-semibold uppercase text-[var(--ds-gray-500)] mb-1">Initial Stock</span>
                      <span className="text-2xl font-bold text-[var(--ds-black)]">{Number(formData.quantity) + Number(analytics.totalSold)} <span className="text-sm font-normal text-[var(--ds-gray-500)]">{formData.unit}</span></span>
                      <div className="flex items-center gap-1 mt-2 text-xs text-[var(--ds-gray-500)]">
                        (Current + Sold)
                      </div>
                    </div>

                    <div className="ds-card-static p-4 flex flex-col">
                      <span className="text-xs font-semibold uppercase text-[var(--ds-gray-500)] mb-1">Current Stock</span>
                      <span className="text-2xl font-bold text-[var(--ds-black)]">{formData.quantity} <span className="text-sm font-normal text-[var(--ds-gray-500)]">{formData.unit}</span></span>
                      {Number(formData.quantity) <= Number(formData.lowStock) && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-[#F5A623] font-medium bg-[#F5A623]/10 px-2 py-1 rounded w-fit">
                          <AlertCircle className="w-3 h-3" /> Low Stock
                        </div>
                      )}
                    </div>
                    
                    <div className="ds-card-static p-4 flex flex-col">
                      <span className="text-xs font-semibold uppercase text-[var(--ds-gray-500)] mb-1">Total Sold</span>
                      <span className="text-2xl font-bold text-[var(--ds-vercel-blue)]">{analytics.totalSold} <span className="text-sm font-normal text-[var(--ds-gray-500)]">{formData.unit}</span></span>
                      <div className="flex items-center gap-1 mt-2 text-xs text-[var(--ds-gray-500)]">
                        In Sales Invoices
                      </div>
                    </div>
                  </div>

                  {/* Buyers List */}
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--ds-black)] flex items-center gap-2 mb-3">
                      <Users className="w-4 h-4 text-[var(--ds-gray-500)]" /> Top Buyers
                    </h3>
                    {analytics.uniqueBuyers.length > 0 ? (
                      <div className="ds-card-static divide-y divide-[var(--ds-gray-100)]">
                        {analytics.uniqueBuyers.map(buyer => (
                          <div key={buyer.id} className="p-3 flex justify-between items-center text-sm">
                            <span className="font-medium text-[var(--ds-black)]">{buyer.name}</span>
                            <span className="text-[var(--ds-gray-500)]">{buyer.totalQuantity} {formData.unit}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-[var(--ds-gray-400)] bg-[var(--ds-gray-50)] p-4 rounded-lg border border-[#f5f5f5]">No recorded buyers yet.</div>
                    )}
                  </div>

                  {/* Invoices List */}
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--ds-black)] flex items-center gap-2 mb-3">
                      <Receipt className="w-4 h-4 text-[var(--ds-gray-500)]" /> Recent Sales
                    </h3>
                    {analytics.recentInvoices.length > 0 ? (
                      <div className="ds-card-static divide-y divide-[var(--ds-gray-100)]">
                        {analytics.recentInvoices.map(inv => (
                          <div key={inv.id} className="p-3 flex flex-col gap-1 text-sm">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-[var(--ds-black)]">{inv.invoiceNumber}</span>
                              <span className="text-[var(--ds-gray-500)]">{new Date(inv.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[var(--ds-gray-500)]">{inv.clientName}</span>
                              <span className="font-medium text-[var(--ds-black)]">{inv.quantitySold} {formData.unit}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-[var(--ds-gray-400)] bg-[var(--ds-gray-50)] p-4 rounded-lg border border-[#f5f5f5]">No invoices include this item yet.</div>
                    )}
                  </div>

                </div>
              )}

              {/* EDIT TAB */}
              {activeTab === 'edit' && (
                <form id="drawer-form" onSubmit={handleSubmit} className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="ds-form-label">Product Name *</label>
                      <input 
                        type="text" required className="ds-input" 
                        value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} 
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="ds-form-label">SKU</label>
                        <input 
                          type="text" className="ds-input" 
                          value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} 
                        />
                      </div>
                      <div>
                        <label className="ds-form-label">Category</label>
                        <input 
                          type="text" className="ds-input" 
                          value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="ds-form-label">Sales Rate *</label>
                        <input 
                          type="number" required step="0.01" min="0" className="ds-input" 
                          value={formData.rate} onChange={e => setFormData({...formData, rate: e.target.value})} 
                        />
                      </div>
                      <div>
                        <label className="ds-form-label">Purchase Price</label>
                        <input 
                          type="number" step="0.01" min="0" className="ds-input" 
                          value={formData.purchasePrice} onChange={e => setFormData({...formData, purchasePrice: e.target.value})} 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="ds-form-label">Current Stock</label>
                        <input 
                          type="number" step="0.1" className="ds-input" 
                          value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} 
                        />
                      </div>
                      <div>
                        <label className="ds-form-label">Unit</label>
                        <select className="ds-select w-full" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}>
                          <option value="pcs">Pieces (pcs)</option>
                          <option value="hrs">Hours (hrs)</option>
                          <option value="kg">Kilograms (kg)</option>
                          <option value="days">Days</option>
                          <option value="flat">Flat Rate</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="ds-form-label">Low Stock Threshold</label>
                      <input 
                        type="number" className="ds-input" 
                        value={formData.lowStock} onChange={e => setFormData({...formData, lowStock: e.target.value})} 
                      />
                    </div>

                    <div>
                      <label className="ds-form-label">Description</label>
                      <textarea 
                        className="ds-input resize-y min-h-[80px]" 
                        value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} 
                      />
                    </div>
                  </div>
                </form>
              )}
            </>
          )}
        </div>

        {/* Footer (Only for edit tab) */}
        {activeTab === 'edit' && (
          <div className="flex-shrink-0 p-6 border-t border-[#eaeaea] flex justify-end gap-3 bg-[var(--ds-gray-50)]">
            <button type="button" onClick={handleClose} className="ds-btn-ghost">Cancel</button>
            <button 
              type="submit" 
              form="drawer-form"
              disabled={isSubmitting} 
              className="ds-btn-dark gap-2 min-w-[120px] justify-center"
            >
              {isSubmitting ? <span className="animate-pulse">Saving...</span> : <><Save className="w-4 h-4" /> <span>Save Product</span></>}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(drawerContent, document.body);
};

export default InventoryItemDrawer;
