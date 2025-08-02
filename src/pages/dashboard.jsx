// pages/dashboard.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router'; // 1. Import useRouter
import StatCard from '../components/StatCard';
import InvoiceTable from '../components/InvoiceTable';
import QuickActions from '../components/QuickActions';
import RecentActivity from '../components/RecentActivity';
import { useAuth } from '../context/AuthContext';
import { DollarSign, FileText, Clock, TrendingUp, Search, Filter } from 'lucide-react';
import { PlusCircle, Users, Download } from 'lucide-react';
import TemplatesSidebar from '../components/TemplatesSidebar'; 

const Dashboard = () => {

    const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth(); // <-- 2. Get user data from the context

  // --- All other hooks must also be at the top level ---
  const [invoices, setInvoices] = useState([]);
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
        // Fetch invoices and stats at the same time
        const [invoicesRes, statsRes] = await Promise.all([
          fetch('/api/invoices'),
          fetch('/api/dashboard-stats')
        ]);

        if (!invoicesRes.ok) throw new Error('Failed to load invoices.');
        if (!statsRes.ok) throw new Error('Failed to load dashboard statistics.');

        const invoicesData = await invoicesRes.json();
        const statsData = await statsRes.json();

        setInvoices(invoicesData);
        setStats(statsData); // <-- Save the stats to state

      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, []);

  // --- useMemo for filtering invoices ---
  const filteredInvoices = useMemo(() =>
    invoices.filter(invoice => {
      const clientName = invoice.client?.name?.toLowerCase() || '';
      const invoiceNumber = invoice.invoiceNumber?.toLowerCase() || '';
      const status = invoice.status?.toLowerCase() || '';
      const search = searchTerm.toLowerCase();
      const matchesSearch = clientName.includes(search) || invoiceNumber.includes(search);
      const matchesStatus = statusFilter.toLowerCase() === 'all' || status === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    }), [invoices, searchTerm, statusFilter]);

     // --- Handlers for the Quick Actions ---
  const handleNewInvoice = () => {
    router.push('/new-invoice');
  };

  const handleAddClient = () => {
    // This now redirects to the clients page with the special action parameter
    router.push('/clients?action=add');
  };

  const handleOpenTemplates = () => {
    setIsTemplatesSidebarOpen(true);
  };

  const handleExport = () => {
    // Placeholder for now
    alert('Export functionality will be implemented soon!');
  };

  // --- Action Handlers ---
  const handleSelectInvoice = (invoiceId) => {
    setSelectedInvoices(prev => prev.includes(invoiceId) ? prev.filter(id => id !== invoiceId) : [...prev, invoiceId]);
  };

  const handleSelectAll = () => {
    if (selectedInvoices.length === filteredInvoices.length && filteredInvoices.length > 0) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(filteredInvoices.map(invoice => invoice.id));
    }
  };

  const handleDeleteInvoice = async (invoiceId) => {
    if (!window.confirm("Are you sure you want to delete this invoice?")) return;
    const originalInvoices = [...invoices];
    setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed to delete the invoice on the server.");
    } catch (error) {
      console.error(error);
      alert("Error: Could not delete the invoice.");
      setInvoices(originalInvoices);
    }
  };

   const quickActionsList = [
    {
      title: 'New Invoice',
      description: 'Create a new invoice',
      icon: PlusCircle,
      color: 'bg-blue-600 hover:bg-blue-700',
      onClick: () => router.push('/new-invoice'),
    },
    {
      title: 'Add Client',
      description: 'Add new client',
      icon: Users,
      color: 'bg-emerald-600 hover:bg-emerald-700',
      onClick: () => router.push('/clients?action=add'), // <-- This is the key
    },
    {
      title: 'Templates',
      description: 'Manage templates',
      icon: FileText,
      color: 'bg-indigo-600 hover:bg-indigo-700',
      onClick: () => setIsTemplatesOpen(true), // <-- Opens the sidebar
    },
    {
      title: 'Export Data',
      description: 'Download reports',
      icon: Download,
      color: 'bg-purple-600 hover:bg-purple-700',
      onClick: () => alert('Exporting coming soon!'), // <-- Placeholder
    },
  ];

  const handleMarkAsPaid = async (invoiceId) => {
    const originalInvoices = [...invoices];
    setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, status: 'PAID' } : inv));
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PAID' }),
      });
      if (!res.ok) throw new Error("Failed to update status.");
      const updatedInvoice = await res.json();
      setInvoices(prev => prev.map(inv => inv.id === invoiceId ? updatedInvoice : inv));
    } catch (error) {
      console.error(error);
      alert("Error: Could not mark as paid.");
      setInvoices(originalInvoices);
    }
  };

  const handleDownloadPDF = (invoiceId) => {
    console.log('Download PDF:', invoiceId);
  };

  const handleInvoiceEdit = (invoiceId) => {
    // Now `router` is defined and this will work
    router.push(`/edit-invoice/${invoiceId}`);
  };

  const getFirstName = () => {
    if (!user || !user.name) {
      return 'Guest'; // Fallback if user or name doesn't exist
    }
    // Splits the full name by spaces and returns the first part
    return user.name.split(' ')[0];
  };



  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p>Loading invoices...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto ">
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {getFirstName()}!</h1>
            <p className="text-gray-600">Here's what's happening with your invoices today.</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search invoices..."
                className="pl-10 pr-4 py-2 border text-gray-400 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
  {/* Show a loading state or skeleton cards */}
  {isLoading ? (
    <>
      <p>Loading stats...</p>
      {/* You could also render 4 skeleton loader cards here for a better UI */}
    </>
  ) : error ? (
    // Show an error message if the API call failed
    <p className="text-red-500 col-span-4">Could not load dashboard stats: {error}</p>
  ) : stats && (
    // Render the dynamic cards once data is successfully loaded
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
  )}
</div>
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <QuickActions actions={quickActionsList} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <InvoiceTable
              invoices={filteredInvoices}
              selectedInvoices={selectedInvoices}
              onSelectAll={handleSelectAll}
              onSelectInvoice={handleSelectInvoice}
              onMarkAsPaid={handleMarkAsPaid}
              onDeleteInvoice={handleDeleteInvoice}
              onDownloadPDF={handleDownloadPDF}
              onEditInvoice={handleInvoiceEdit}
            />
          </div>
          <div>
            <RecentActivity />
          </div>
        </div>
      </div>

 {/* The Sidebar component lives here, controlled by state */}
      <TemplatesSidebar 
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
      />

    </div>
  );
};

export default Dashboard;
