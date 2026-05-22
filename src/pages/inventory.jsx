import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Plus, Search, Filter, Box, AlertCircle, Edit, Trash2 } from 'lucide-react';
import InventoryModal from '../components/inventory/InventoryModal';
import InventoryStatsCards from '../components/inventory/InventoryStatsCards';
import { useToast } from '../context/ToastContext';

const InventoryPage = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, in, low, out
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const { toast } = useToast();

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.append('search', searchQuery);
      if (statusFilter !== 'all') queryParams.append('status', statusFilter);
      if (categoryFilter !== 'all') queryParams.append('category', categoryFilter);

      const res = await fetch(`/api/inventory?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast('Failed to load inventory items.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchItems();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, statusFilter, categoryFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const res = await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast('Item deleted successfully.');
        fetchItems();
      } else {
        toast('Failed to delete item.');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast('An error occurred.');
    }
  };

  const getStockBadge = (item) => {
    if (item.quantity <= 0) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-[rgba(255,91,79,0.1)] text-[var(--ds-ship-red)]">Out of Stock</span>;
    }
    if (item.quantity <= item.lowStock) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-[rgba(245,166,35,0.1)] text-[#F5A623]">Low Stock</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium rounded-full bg-[rgba(0,112,243,0.1)] text-[var(--ds-vercel-blue)]">In Stock</span>;
  };

  return (
    <>
      <Head>
        <title>Inventory | Invobook</title>
      </Head>
      <div className="ds-page-inner">
        <div className="ds-page-header flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--ds-black)] tracking-tight">Inventory</h1>
            <p className="text-sm text-[var(--ds-gray-500)] mt-1">Manage your product catalog and stock levels.</p>
          </div>
          <button 
            onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
            className="ds-btn-dark gap-2 shrink-0 w-full md:w-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>

        <InventoryStatsCards refreshTrigger={items} />

        <div className="ds-card-static mt-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ds-gray-400)]" />
              <input 
                type="text" 
                placeholder="Search products by name, SKU..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ds-input pl-10"
              />
            </div>
            <div className="flex gap-4">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="ds-select min-w-[140px]"
              >
                <option value="all">All Status</option>
                <option value="in">In Stock</option>
                <option value="low">Low Stock</option>
                <option value="out">Out of Stock</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="ds-table w-full">
              <thead>
                <tr>
                  <th className="ds-th">Product</th>
                  <th className="ds-th">SKU / Category</th>
                  <th className="ds-th">Rate</th>
                  <th className="ds-th">Stock</th>
                  <th className="ds-th text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--ds-gray-100)]">
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-[var(--ds-gray-400)]">
                      Loading inventory...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Box className="w-12 h-12 text-[var(--ds-gray-300)] mb-4" />
                        <h3 className="text-lg font-medium text-[var(--ds-black)]">No products found</h3>
                        <p className="text-sm text-[var(--ds-gray-500)] mt-1 max-w-sm">
                          Add your first product to start tracking inventory levels and streamline your invoicing.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  items.map(item => (
                    <tr key={item.id} className="group hover:bg-[var(--ds-gray-50)] transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-[var(--ds-radius-button)] bg-[var(--ds-gray-100)] flex items-center justify-center shrink-0">
                            <Box className="w-5 h-5 text-[var(--ds-gray-400)]" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[var(--ds-black)]">{item.name}</p>
                            {item.description && <p className="text-xs text-[var(--ds-gray-500)] mt-0.5 truncate max-w-[200px]">{item.description}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm text-[var(--ds-gray-600)]">{item.sku || '-'}</span>
                          {item.category && <span className="text-xs text-[var(--ds-gray-400)]">{item.category}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-[var(--ds-black)]">
                        {parseFloat(item.rate).toFixed(2)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-[var(--ds-black)]">{item.quantity} <span className="text-[var(--ds-gray-400)]">{item.unit}</span></span>
                          {getStockBadge(item)}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => { setEditingItem(item); setIsModalOpen(true); }}
                            className="ds-icon-btn text-[var(--ds-gray-500)] hover:text-[var(--ds-black)]"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="ds-icon-btn text-[var(--ds-gray-500)] hover:text-[var(--ds-ship-red)] hover:bg-[rgba(255,91,79,0.1)]"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <InventoryModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          item={editingItem}
          onSuccess={fetchItems}
        />
      </div>
    </>
  );
};

export default InventoryPage;
