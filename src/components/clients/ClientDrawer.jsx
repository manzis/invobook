import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, User, Building, Receipt, Star, MapPin, Mail, Phone } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const ClientDrawer = ({ isOpen, onClose, client, onSuccess, isVendor = false, currency = 'USD' }) => {
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' or 'edit'
  const [formData, setFormData] = useState({
    name: '', email: '', company: '', phone: '', address: '', city: '', taxId: ''
  });
  
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const entityName = isVendor ? 'Vendor' : 'Client';

  useEffect(() => {
    if (isOpen && client) {
      setActiveTab('analytics');
      fetchClientData(client.id);
    } else if (isOpen && !client) {
      // Add mode
      setActiveTab('edit');
      setFormData({
        name: '', email: '', company: '', phone: '', address: '', city: '', taxId: ''
      });
      setAnalytics(null);
    }
  }, [isOpen, client]);

  const fetchClientData = async (id) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/clients/${id}`);
      if (res.ok) {
        const data = await res.json();
        setFormData({
          name: data.name || '',
          email: data.email || '',
          company: data.company || '',
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          taxId: data.taxId || ''
        });
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error(error);
      toast(`Failed to load ${entityName.toLowerCase()} analytics.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast('Name and Phone number are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const url = client ? `/api/clients/${client.id}` : '/api/clients';
      const method = client ? 'PUT' : 'POST';
      
      const payload = { ...formData };
      if (isVendor) {
        payload.type = 'VENDOR';
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const itemData = await res.json();
        toast(`${entityName} ${client ? 'updated' : 'added'} successfully.`);
        onSuccess(itemData, !!client); // Pass true if editing
        if (client) {
          fetchClientData(client.id);
          setActiveTab('analytics');
        } else {
          handleClose();
        }
      } else {
        const errorData = await res.json();
        toast(errorData.message || `Failed to save ${entityName.toLowerCase()}.`);
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

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
              {client ? formData.name || `${entityName} Details` : `Add New ${entityName}`}
            </h2>
            {client && formData.company && <p className="text-xs text-[var(--ds-gray-500)] mt-1">{formData.company}</p>}
          </div>
          <button onClick={handleClose} className="ds-icon-btn rounded-full hover:bg-[var(--ds-gray-100)] p-2">
            <X className="w-5 h-5 text-[var(--ds-gray-500)]" />
          </button>
        </div>

        {/* Tabs */}
        {client && (
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
              <p className="text-sm font-medium">Loading {entityName} Data...</p>
            </div>
          ) : (
            <>
              {/* ANALYTICS TAB */}
              {activeTab === 'analytics' && client && analytics && (
                <div className="p-6 space-y-8">
                  
                  {/* Status & Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="ds-card-static p-4 flex flex-col">
                      <span className="text-xs font-semibold uppercase text-[var(--ds-gray-500)] mb-1">Total {isVendor ? 'Purchases' : 'Invoiced'}</span>
                      <span className="text-2xl font-bold text-[var(--ds-vercel-blue)]">{formatCurrency(analytics.totalSpent)}</span>
                      <div className="flex items-center gap-1 mt-2 text-xs text-[var(--ds-gray-500)]">
                        Across {analytics.invoiceCount} invoices
                      </div>
                    </div>
                    
                    <div className="ds-card-static p-4 flex flex-col">
                      <span className="text-xs font-semibold uppercase text-[var(--ds-gray-500)] mb-1">Profile Status</span>
                      <span className="text-xl font-bold text-[var(--ds-black)] leading-tight">{analytics.profileStatus}</span>
                      {analytics.invoiceCount > 2 && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded w-fit">
                          <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" /> Constant Active
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contact Details Quick View */}
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--ds-black)] flex items-center gap-2 mb-3">
                      <User className="w-4 h-4 text-[var(--ds-gray-500)]" /> Contact Info
                    </h3>
                    <div className="ds-card-static divide-y divide-[var(--ds-gray-100)]">
                      {formData.email && (
                        <div className="p-3 flex items-center gap-3 text-sm">
                          <Mail className="w-4 h-4 text-[var(--ds-gray-400)]" />
                          <span className="text-[var(--ds-black)]">{formData.email}</span>
                        </div>
                      )}
                      {formData.phone && (
                        <div className="p-3 flex items-center gap-3 text-sm">
                          <Phone className="w-4 h-4 text-[var(--ds-gray-400)]" />
                          <span className="text-[var(--ds-black)]">{formData.phone}</span>
                        </div>
                      )}
                      {formData.address && (
                        <div className="p-3 flex items-center gap-3 text-sm">
                          <MapPin className="w-4 h-4 text-[var(--ds-gray-400)]" />
                          <span className="text-[var(--ds-black)]">{formData.address}{formData.city ? `, ${formData.city}` : ''}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Invoices List */}
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--ds-black)] flex items-center gap-2 mb-3">
                      <Receipt className="w-4 h-4 text-[var(--ds-gray-500)]" /> Recent {isVendor ? 'Purchases' : 'Sales'}
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
                              <span className="text-[var(--ds-gray-500)]">{inv.status}</span>
                              <span className="font-medium text-[var(--ds-black)]">{formatCurrency(inv.total)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-[var(--ds-gray-400)] bg-[var(--ds-gray-50)] p-4 rounded-lg border border-[#f5f5f5]">No invoices found for this {entityName.toLowerCase()}.</div>
                    )}
                  </div>

                </div>
              )}

              {/* EDIT TAB */}
              {activeTab === 'edit' && (
                <form id="drawer-form" onSubmit={handleSubmit} className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="ds-form-label">Full Name *</label>
                      <input 
                        type="text" required className="ds-input" 
                        value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} 
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="ds-form-label">Email</label>
                        <input 
                          type="email" className="ds-input" 
                          value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} 
                          placeholder="john@example.com"
                        />
                      </div>
                      <div>
                        <label className="ds-form-label">Phone *</label>
                        <input 
                          type="text" required className="ds-input" 
                          value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} 
                          placeholder="+1 234 567 890"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="ds-form-label">Company</label>
                        <input 
                          type="text" className="ds-input" 
                          value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} 
                          placeholder="Acme Corp"
                        />
                      </div>
                      <div>
                        <label className="ds-form-label">Tax ID</label>
                        <input 
                          type="text" className="ds-input" 
                          value={formData.taxId} onChange={e => setFormData({...formData, taxId: e.target.value})} 
                          placeholder="Tax/VAT Number"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="ds-form-label">City</label>
                        <input 
                          type="text" className="ds-input" 
                          value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} 
                          placeholder="New York"
                        />
                      </div>
                      <div>
                        <label className="ds-form-label">Address</label>
                        <input 
                          type="text" className="ds-input" 
                          value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} 
                          placeholder="123 Main St"
                        />
                      </div>
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
              {isSubmitting ? <span className="animate-pulse">Saving...</span> : <><Save className="w-4 h-4" /> <span>Save {entityName}</span></>}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(drawerContent, document.body);
};

export default ClientDrawer;
