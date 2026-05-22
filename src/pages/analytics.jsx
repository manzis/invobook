import React, { useState, useEffect } from 'react';
import RecentActivity from '../components/RecentActivity';
import {
  DollarSign,
  FileText,
  Users,
  BarChart3,
  PieChart,
  Activity,
  Target,
} from 'lucide-react';

const formatCurrency = (amount) => {
  return (parseFloat(amount) || 0).toLocaleString('en-US', { style: 'currency', currency: 'INR' });
};

const statusDotClass = {
  Paid: 'bg-[#059669]',
  Pending: 'bg-[var(--ds-badge-text)]',
  Overdue: 'bg-[var(--ds-ship-red)]',
  Draft: 'bg-[var(--ds-gray-400)]',
};

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/analytics?timeRange=${timeRange}`);
        if (!res.ok) throw new Error('Failed to fetch analytics data');
        const fetchedData = await res.json();
        setAnalyticsData(fetchedData);
      } catch (error) {
        console.error(error);
        setAnalyticsData(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalyticsData();
  }, [timeRange]);

  if (isLoading || !analyticsData) {
    return (
      <div className="ds-page-inner flex items-center justify-center min-h-[40vh]">
        <div className="ds-spinner" role="status" aria-label="Loading analytics" />
      </div>
    );
  }

  const { keyMetrics, topClients, statusData: apiStatusData, revenueData } = analyticsData;

  const statusData = [
    { status: 'Paid', ...apiStatusData.PAID },
    { status: 'Pending', ...apiStatusData.PENDING },
    { status: 'Overdue', ...apiStatusData.OVERDUE },
    { status: 'Draft', ...apiStatusData.DRAFT },
  ];

  const maxRevenueForChart = Math.max(...revenueData.map((item) => item.revenue), 1);

  const metricCards = [
    { label: 'Total Revenue', value: formatCurrency(keyMetrics.totalRevenue), icon: DollarSign },
    { label: 'Total Invoices', value: keyMetrics.totalInvoices, icon: FileText },
    { label: 'Active Clients', value: keyMetrics.activeClients, icon: Users },
    { label: 'Avg. Paid Invoice', value: formatCurrency(keyMetrics.avgInvoiceValue), icon: Target },
  ];

  return (
    <div className="ds-page-inner">
      <div className="ds-page-header">
        <div>
          <h1 className="ds-section-title">Analytics</h1>
          <p className="ds-page-subtitle">Track your business performance and insights</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="ds-select"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metricCards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="ds-card-static">
            <div className="flex items-center justify-between">
              <div>
                <p className="ds-stat-label">{label}</p>
                <p className="ds-stat-value text-[28px]">{value}</p>
              </div>
              <div className="w-12 h-12 ds-surface-muted rounded-lg flex items-center justify-center">
                <Icon className="w-6 h-6 text-[var(--ds-gray-500)]" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="ds-card-static">
          <div className="flex items-center justify-between mb-6">
            <h3 className="ds-card-title text-[20px]">Revenue Trend</h3>
            <BarChart3 className="w-5 h-5 text-[var(--ds-gray-400)]" />
          </div>
          <div className="space-y-4">
            {revenueData.map((item) => (
              <div key={item.month} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="ds-mono-label w-8">{item.month}</span>
                  <div className="flex-1 bg-[var(--ds-gray-100)] rounded-full h-2 w-32">
                    <div
                      className="bg-[var(--ds-black)] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(item.revenue / maxRevenueForChart) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[var(--ds-black)]">
                    {formatCurrency(item.revenue)}
                  </p>
                  <p className="text-xs text-[var(--ds-gray-500)]">{item.invoices} invoices</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="ds-card-static">
          <div className="flex items-center justify-between mb-6">
            <h3 className="ds-card-title text-[20px]">Top Clients</h3>
            <PieChart className="w-5 h-5 text-[var(--ds-gray-400)]" />
          </div>
          <div className="space-y-4">
            {topClients.map((client, index) => (
              <div key={client.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      index === 0
                        ? 'bg-[var(--ds-black)]'
                        : index === 1
                          ? 'bg-[var(--ds-gray-500)]'
                          : 'bg-[var(--ds-gray-400)]'
                    }`}
                  />
                  <span className="text-sm font-medium text-[var(--ds-black)]">{client.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[var(--ds-black)]">
                    {formatCurrency(client.revenue)}
                  </p>
                  <p className="text-xs text-[var(--ds-gray-500)]">
                    {client.percentage.toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="ds-card-static mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="ds-card-title text-[20px]">Invoice Status Overview</h3>
          <Activity className="w-5 h-5 text-[var(--ds-gray-400)]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {statusData.map((status) => (
            <div key={status.status} className="text-center">
              <div className="w-16 h-16 ds-surface-muted rounded-full flex items-center justify-center mx-auto mb-3 ds-shadow-ring">
                <span className="text-[var(--ds-black)] font-semibold text-lg">{status.count}</span>
              </div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <span
                  className={`w-2 h-2 rounded-full ${statusDotClass[status.status] || 'bg-[var(--ds-gray-400)]'}`}
                />
                <h4 className="font-semibold text-[var(--ds-black)]">{status.status}</h4>
              </div>
              <p className="text-sm text-[var(--ds-gray-600)]">{formatCurrency(status.amount)}</p>
            </div>
          ))}
        </div>
      </div>

      <RecentActivity />
    </div>
  );
};

export default Analytics;
