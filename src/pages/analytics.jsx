// /pages/analytics.jsx (Final version with dynamic data and original UI)

import React, { useState, useEffect } from 'react';
import RecentActivity from '../components/RecentActivity';
import { 
  TrendingUp, TrendingDown, DollarSign, FileText, Users, Calendar,
  BarChart3, PieChart, Activity, Target
} from 'lucide-react';

const formatCurrency = (amount) => {
  return (parseFloat(amount) || 0).toLocaleString('en-US', { style: 'currency', currency: 'INR' });
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
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="p-8"><p>Loading Analytics...</p></div>
      </div>
    );
  }

  // --- Prepare data for rendering to match your original UI structure ---
  const { keyMetrics, topClients, statusData: apiStatusData, revenueData } = analyticsData;
  
  const statusData = [
    { status: 'Paid', ...apiStatusData.PAID, color: 'bg-emerald-500' },
    { status: 'Pending', ...apiStatusData.PENDING, color: 'bg-amber-500' },
    { status: 'Overdue', ...apiStatusData.OVERDUE, color: 'bg-red-500' },
    { status: 'Draft', ...apiStatusData.DRAFT, color: 'bg-gray-500' },
  ];
  
  // Calculate the maximum revenue from the fetched monthly data for the bar chart scale
  const maxRevenueForChart = Math.max(...revenueData.map(item => item.revenue), 1);

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-4 md:p-8">
        {/* Header - EXACTLY as you provided */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
            <p className="text-gray-600">Track your business performance and insights</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
        </div>

        {/* Key Metrics - EXACTLY as you provided, but with dynamic data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(keyMetrics.totalRevenue)}</p>
                {/* Comparison data can be added later */}
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Invoices</p>
                <p className="text-3xl font-bold text-gray-900">{keyMetrics.totalInvoices}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Active Clients</p>
                <p className="text-3xl font-bold text-gray-900">{keyMetrics.activeClients}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Avg. Paid Invoice</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(keyMetrics.avgInvoiceValue)}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart - EXACTLY as you provided, but with dynamic data */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {revenueData.map((item) => (
                <div key={item.month} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-600 w-8">{item.month}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 w-32">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(item.revenue / maxRevenueForChart) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(item.revenue)}</p>
                    <p className="text-xs text-gray-500">{item.invoices} invoices</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Clients - EXACTLY as you provided, but with dynamic data */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Top Clients</h3>
              <PieChart className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {topClients.map((client, index) => (
                <div key={client.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${ index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-emerald-500' : index === 2 ? 'bg-purple-500' : index === 3 ? 'bg-amber-500' : 'bg-gray-500' }`}></div>
                    <span className="text-sm font-medium text-gray-900">{client.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(client.revenue)}</p>
                    <p className="text-xs text-gray-500">{client.percentage.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Invoice Status Overview - EXACTLY as you provided, but with dynamic data */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Invoice Status Overview</h3>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {statusData.map((status) => (
              <div key={status.status} className="text-center">
                <div className={`w-16 h-16 ${status.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                  <span className="text-white font-bold text-lg">{status.count}</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">{status.status}</h4>
                <p className="text-sm text-gray-600">{formatCurrency(status.amount)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity - UI Unchanged */}
        
          <RecentActivity />
          {/* ... your existing recent activity JSX ... */}
        
      </div>
    </div>
  );
};

export default Analytics;