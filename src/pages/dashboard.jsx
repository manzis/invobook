// pages/dashboard.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import StatCard from '../components/StatCard';
import InvoiceTable from '../components/InvoiceTable';
import QuickActions from '../components/QuickActions';
import RecentActivity from '../components/RecentActivity';
import { useAuth } from '../context/AuthContext';
import { DollarSign, FileText, Clock, TrendingUp, Search, Filter } from 'lucide-react';
import { PlusCircle, Users, Download } from 'lucide-react';
import TemplatesSidebar from '../components/templatesSidebar';
import { useToast } from '../context/ToastContext';

const StatCardSkeleton = () => (
  <div className="ds-card-static p-6 flex flex-col gap-3 animate-pulse">
    <div className="flex justify-between items-center">
      <div className="h-4 bg-[var(--ds-gray-100)] rounded-md w-24"></div>
      <div className="w-8 h-8 bg-[var(--ds-gray-100)] rounded-[var(--ds-radius-button)]"></div>
    </div>
    <div className="h-8 bg-[var(--ds-gray-100)] rounded-md w-32"></div>
    <div className="h-4 bg-[var(--ds-gray-100)] rounded-md w-20"></div>
  </div>
);

const InvoiceTableSkeleton = () => (
  <div className="ds-table-wrap animate-pulse">
    <div className="overflow-x-auto">
      <table className="ds-table">
        <thead>
          <tr>
            <th><div className="w-4 h-4 bg-[var(--ds-gray-100)] rounded"></div></th>
            <th>Invoice</th>
            <th>Client</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Due Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3, 4, 5].map((idx) => (
            <tr key={idx}>
              <td><div className="w-4 h-4 bg-[var(--ds-gray-100)] rounded"></div></td>
              <td><div className="h-4 bg-[var(--ds-gray-100)] rounded-md w-16"></div></td>
              <td><div className="h-4 bg-[var(--ds-gray-100)] rounded-md w-24"></div></td>
              <td><div className="h-4 bg-[var(--ds-gray-100)] rounded-md w-20"></div></td>
              <td><div className="h-4 bg-[var(--ds-gray-100)] rounded-md w-24"></div></td>
              <td><div className="h-4 bg-[var(--ds-gray-100)] rounded-md w-24"></div></td>
              <td><div className="h-5 bg-[var(--ds-gray-100)] rounded-full w-16"></div></td>
              <td><div className="h-4 bg-[var(--ds-gray-100)] rounded-md w-12"></div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const Dashboard = () => {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();

  const [invoices, setInvoices] = useState([]);
  const [currency, setCurrency] = useState('USD');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [invoicesRes, statsRes, settingsRes] = await Promise.all([
          fetch('/api/invoices'),
          fetch('/api/dashboard-stats'),
          fetch('/api/invoice-settings'),
        ]);

        if (!invoicesRes.ok) throw new Error('Failed to load invoices.');
        if (!statsRes.ok) throw new Error('Failed to load dashboard statistics.');

        const invoicesData = await invoicesRes.json();
        const statsData = await statsRes.json();

        setInvoices(invoicesData);
        setStats(statsData);

        if (settingsRes.ok) {
          const settings = await settingsRes.json();
          setCurrency(settings.currency || 'USD');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const filteredInvoices = useMemo(
    () =>
      invoices.filter((invoice) => {
        const clientName = invoice.client?.name?.toLowerCase() || '';
        const invoiceNumber = invoice.invoiceNumber?.toLowerCase() || '';
        const status = invoice.status?.toLowerCase() || '';
        const search = searchTerm.toLowerCase();
        const matchesSearch = clientName.includes(search) || invoiceNumber.includes(search);
        const matchesStatus =
          statusFilter.toLowerCase() === 'all' || status === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
      }),
    [invoices, searchTerm, statusFilter]
  );

  const handleOpenTemplates = () => {
    setIsTemplatesOpen(true);
  };

  const quickActionsList = [
    {
      title: 'New Invoice',
      description: 'Create a new invoice',
      icon: PlusCircle,
      onClick: () => router.push('/new-invoice'),
    },
    {
      title: 'Add Client',
      description: 'Add new client',
      icon: Users,
      onClick: () => router.push('/clients?action=add'),
    },
    {
      title: 'Templates',
      description: 'Manage templates',
      icon: FileText,
      onClick: handleOpenTemplates,
    },
    {
      title: 'Export Data',
      description: 'Download reports',
      icon: Download,
      onClick: () => toast('Exporting coming soon!'),
    },
  ];

  const handleSelectInvoice = (invoiceId) => {
    setSelectedInvoices((prev) =>
      prev.includes(invoiceId) ? prev.filter((id) => id !== invoiceId) : [...prev, invoiceId]
    );
  };

  const handleSelectAll = () => {
    if (selectedInvoices.length === filteredInvoices.length && filteredInvoices.length > 0) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(filteredInvoices.map((invoice) => invoice.id));
    }
  };

  const handleDeleteInvoice = async (invoiceId) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;
    const originalInvoices = [...invoices];
    setInvoices((prev) => prev.filter((inv) => inv.id !== invoiceId));
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete the invoice on the server.');
    } catch (error) {
      console.error(error);
      toast('Error: Could not delete the invoice.');
      setInvoices(originalInvoices);
    }
  };

  const handleMarkAsPaid = async (invoiceId) => {
    const originalInvoices = [...invoices];
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === invoiceId ? { ...inv, status: 'PAID' } : inv))
    );
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PAID' }),
      });
      if (!res.ok) throw new Error('Failed to update status.');
      const updatedInvoice = await res.json();
      setInvoices((prev) => prev.map((inv) => (inv.id === invoiceId ? updatedInvoice : inv)));
    } catch (error) {
      console.error(error);
      toast('Error: Could not mark as paid.');
      setInvoices(originalInvoices);
    }
  };

  const handleDownloadPDF = (invoiceId) => {
    console.log('Download PDF:', invoiceId);
  };

  const handleInvoiceEdit = (invoiceId) => {
    router.push(`/edit-invoice/${invoiceId}`);
  };

  const getFirstName = () => {
    if (!user || !user.name) {
      return 'Guest';
    }
    return user.name.split(' ')[0];
  };

  return (
    <>
      <div className="ds-page-inner">
        <div className="ds-page-header">
          <div>
            <h1 className="ds-section-title">Welcome back, {getFirstName()}!</h1>
            <p className="ds-page-subtitle">
              Here&apos;s what&apos;s happening with your invoices today.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ds-gray-400)] pointer-events-none" />
              <input
                type="text"
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ds-input pl-10 w-56"
              />
            </div>
            <button type="button" className="ds-btn-ghost gap-2">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : error ? (
            <p className="text-[var(--ds-ship-red)] col-span-4">
              Could not load dashboard stats: {error}
            </p>
          ) : (
            stats && (
              <>
                <StatCard
                  title="Total Revenue"
                  value={stats.totalRevenue.value}
                  change={stats.totalRevenue.change}
                  trend={stats.totalRevenue.trend}
                  icon={DollarSign}
                  color="blue"
                />
                <StatCard
                  title="Pending Invoices"
                  value={stats.pendingInvoices.value}
                  change={stats.pendingInvoices.change}
                  trend={stats.pendingInvoices.trend}
                  icon={FileText}
                  color="yellow"
                />
                <StatCard
                  title="Overdue"
                  value={stats.overdueInvoices.value}
                  change={stats.overdueInvoices.change}
                  trend={stats.overdueInvoices.trend}
                  icon={Clock}
                  color="red"
                />
                <StatCard
                  title="This Month"
                  value={stats.revenueThisMonth.value}
                  change={stats.revenueThisMonth.change}
                  trend={stats.revenueThisMonth.trend}
                  icon={TrendingUp}
                  color="green"
                />
              </>
            )
          )}
        </div>

        <div className="mb-8">
          <h2 className="ds-card-title text-[20px] mb-4">Quick Actions</h2>
          <QuickActions actions={quickActionsList} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {isLoading ? (
              <InvoiceTableSkeleton />
            ) : (
              <InvoiceTable
                invoices={filteredInvoices}
                selectedInvoices={selectedInvoices}
                onSelectAll={handleSelectAll}
                onSelectInvoice={handleSelectInvoice}
                onMarkAsPaid={handleMarkAsPaid}
                onDeleteInvoice={handleDeleteInvoice}
                onDownloadPDF={handleDownloadPDF}
                onEditInvoice={handleInvoiceEdit}
                currency={currency}
              />
            )}
          </div>
          <div>
            <RecentActivity />
          </div>
        </div>
      </div>

      <TemplatesSidebar isOpen={isTemplatesOpen} onClose={() => setIsTemplatesOpen(false)} />
    </>
  );
};

export default Dashboard;
