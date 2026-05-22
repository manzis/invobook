import React, { useState, useEffect, useMemo } from 'react';
import { CreditCard, CheckCircle2, XCircle, AlertCircle, FileText, Calendar, Eye, ShieldAlert, Loader2 } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useToast } from '../context/ToastContext';

const ProofModal = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return createPortal(
    <div
      onClick={onClose}
      style={{
        fixed: 'fixed',
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '24px',
        cursor: 'zoom-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          padding: '12px',
          borderRadius: '12px',
          maxWidth: '90%',
          maxHeight: '90%',
          overflow: 'auto',
          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
          cursor: 'default',
        }}
      >
        <img
          src={imageUrl}
          alt="Payment Receipt Proof"
          style={{
            maxWidth: '100%',
            maxHeight: '75vh',
            objectFit: 'contain',
            borderRadius: '6px',
            display: 'block',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
          <span style={{ fontSize: '13px', color: 'var(--ds-gray-500)' }}>Proof of Payment Receipt</span>
          <button
            onClick={onClose}
            style={{
              padding: '6px 14px',
              background: 'var(--ds-black)',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const PaymentsPage = () => {
  const { toast } = useToast();
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currency, setCurrency] = useState('NPR');
  
  const [selectedProofUrl, setSelectedProofUrl] = useState(null);
  
  // Verification states
  const [actioningPaymentId, setActioningPaymentId] = useState(null);
  const [rejectNote, setRejectNote] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const [paymentsRes, settingsRes] = await Promise.all([
        fetch('/api/payments'),
        fetch('/api/invoice-settings'),
      ]);
      if (paymentsRes.ok) {
        const data = await paymentsRes.json();
        setPayments(data);
      }
      if (settingsRes.ok) {
        const settings = await settingsRes.json();
        setCurrency(settings.currency || 'NPR');
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
    }).format(parseFloat(amount));
  };

  const handleVerify = async (paymentId) => {
    if (!window.confirm('Are you sure you want to verify this payment? This will update the invoice balance.')) return;
    
    setIsProcessing(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, action: 'verify' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to verify payment.');
      
      toast('Payment verified successfully!');
      fetchPayments();
    } catch (err) {
      toast(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectNote.trim()) {
      toast('Please enter a rejection reason.');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: actioningPaymentId,
          action: 'reject',
          rejectNote,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to reject payment.');

      toast('Payment rejected.');
      setShowRejectInput(false);
      setActioningPaymentId(null);
      setRejectNote('');
      fetchPayments();
    } catch (err) {
      toast(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Stats calculations
  const stats = useMemo(() => {
    const verified = payments.filter(p => p.status === 'verified');
    const pending = payments.filter(p => p.status === 'pending');
    const rejected = payments.filter(p => p.status === 'rejected');

    const totalVerifiedAmount = verified.reduce((sum, p) => sum + parseFloat(p.amount), 0);

    return {
      totalVerified: totalVerifiedAmount,
      pendingCount: pending.length,
      rejectedCount: rejected.length,
    };
  }, [payments]);

  // Filtering payments
  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const matchesStatus = activeFilter === 'all' || p.status === activeFilter;
      
      const clientName = p.invoice?.client?.name || '';
      const clientCompany = p.invoice?.client?.company || '';
      const invNumber = p.invoice?.invoiceNumber || '';
      const refNo = p.referenceNo || '';
      
      const matchesSearch = 
        clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clientCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        refNo.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [payments, activeFilter, searchTerm]);

  return (
    <div className="ds-page-inner">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight m-0" style={{ color: 'var(--ds-black)' }}>Payments</h1>
          <p className="text-sm m-0 mt-1" style={{ color: 'var(--ds-gray-500)' }}>
            Track and verify client payments submitted via share links.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="ds-card-static p-6 flex flex-col gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium m-0" style={{ color: 'var(--ds-gray-500)' }}>Total Verified Income</p>
            <p className="text-2xl font-bold m-0 mt-1" style={{ color: 'var(--ds-black)' }}>
              {formatCurrency(stats.totalVerified)}
            </p>
          </div>
        </div>

        <div className="ds-card-static p-6 flex flex-col gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-amber-50 text-amber-600">
            <Loader2 className={`w-5 h-5 ${stats.pendingCount > 0 ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <p className="text-xs font-medium m-0" style={{ color: 'var(--ds-gray-500)' }}>Pending Verification</p>
            <p className="text-2xl font-bold m-0 mt-1" style={{ color: 'var(--ds-black)' }}>
              {stats.pendingCount}
            </p>
          </div>
        </div>

        <div className="ds-card-static p-6 flex flex-col gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-rose-50 text-rose-600">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium m-0" style={{ color: 'var(--ds-gray-500)' }}>Rejected Submissions</p>
            <p className="text-2xl font-bold m-0 mt-1" style={{ color: 'var(--ds-black)' }}>
              {stats.rejectedCount}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="ds-card-static p-4 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Filters */}
        <div className="flex gap-1 bg-[var(--ds-gray-50)] p-1 rounded-lg">
          {['all', 'pending', 'verified', 'rejected'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                background: activeFilter === filter ? '#fff' : 'transparent',
                color: activeFilter === filter ? 'var(--ds-black)' : 'var(--ds-gray-500)',
                boxShadow: activeFilter === filter ? '0 1px 3px 0 rgb(0 0 0 / 0.1)' : 'none',
              }}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search client, invoice number, ref..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="ds-input py-2 px-3 text-sm w-full sm:w-64"
        />
      </div>

      {/* Rejection Modal */}
      {showRejectInput && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '24px',
        }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', maxWidth: '400px', width: '100%', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: 700 }}>Reject Payment Proof</h3>
            <form onSubmit={handleRejectSubmit}>
              <textarea
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                required
                rows={3}
                placeholder="Describe why you are rejecting this proof (e.g. incorrect amount, reference invalid)..."
                style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none', resize: 'none', marginBottom: '16px' }}
              />
              <div style={{ display: 'flex', justifyContent: 'end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => { setShowRejectInput(false); setActioningPaymentId(null); }}
                  className="ds-btn"
                  style={{ background: '#f1f5f9', color: '#334155' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="ds-btn ds-btn-danger"
                >
                  {isProcessing ? 'Processing...' : 'Confirm Reject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payments Table */}
      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[var(--ds-gray-400)]" />
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="ds-card-static text-center py-12">
          <AlertCircle className="w-10 h-10 mx-auto mb-3 text-[var(--ds-gray-400)]" />
          <h3 className="text-sm font-semibold m-0" style={{ color: 'var(--ds-black)' }}>No payments found</h3>
          <p className="text-xs m-0 mt-1" style={{ color: 'var(--ds-gray-500)' }}>
            Any payment proof submitted by clients will appear here.
          </p>
        </div>
      ) : (
        <div className="ds-table-wrap">
          <div className="overflow-x-auto">
            <table className="ds-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Client</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Reference</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => {
                  const clientName = payment.invoice?.client?.company || payment.invoice?.client?.name || 'N/A';
                  return (
                    <tr key={payment.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[var(--ds-gray-400)]" />
                          <span className="font-medium" style={{ color: 'var(--ds-black)' }}>
                            {payment.invoice?.invoiceNumber}
                          </span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--ds-gray-700)' }}>{clientName}</td>
                      <td className="font-semibold" style={{ color: 'var(--ds-black)' }}>
                        {formatCurrency(payment.amount)}
                      </td>
                      <td style={{ textTransform: 'capitalize', color: 'var(--ds-gray-700)' }}>
                        {payment.method.replace('_', ' ')}
                      </td>
                      <td style={{ color: 'var(--ds-gray-500)', fontFamily: 'monospace' }}>
                        {payment.referenceNo || 'N/A'}
                      </td>
                      <td>
                        <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--ds-gray-500)' }}>
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-block',
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          textTransform: 'uppercase',
                          background: payment.status === 'verified' ? '#dcfce7' : payment.status === 'rejected' ? '#fee2e2' : '#fef9c3',
                          color: payment.status === 'verified' ? '#166534' : payment.status === 'rejected' ? '#991b1b' : '#854d0e',
                        }}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {payment.proofImageUrl && (
                            <button
                              onClick={() => setSelectedProofUrl(payment.proofImageUrl)}
                              className="ds-icon-btn"
                              title="View Proof Receipt"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          
                          {payment.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleVerify(payment.id)}
                                className="p-1.5 rounded-md hover:bg-emerald-50 text-emerald-600 transition-colors"
                                style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
                                title="Verify Payment"
                              >
                                <CheckCircle2 className="w-4.5 h-4.5" />
                              </button>
                              
                              <button
                                onClick={() => { setActioningPaymentId(payment.id); setShowRejectInput(true); }}
                                className="p-1.5 rounded-md hover:bg-rose-50 text-rose-600 transition-colors"
                                style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
                                title="Reject Payment"
                              >
                                <XCircle className="w-4.5 h-4.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Proof Modal overlay */}
      {selectedProofUrl && (
        <ProofModal imageUrl={selectedProofUrl} onClose={() => setSelectedProofUrl(null)} />
      )}
    </div>
  );
};

export default PaymentsPage;