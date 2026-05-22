import React from 'react';
import { Search, SlidersHorizontal, LayoutGrid, List, ChevronDown } from 'lucide-react';

const SubNav = ({
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Search...",
  
  onFilterClick,
  hasActiveFilters,
  
  viewMode, // 'grid' | 'list'
  onViewModeChange,
  
  onAddNewClick,
  addNewLabel = "Add New..."
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
      {/* Search Input */}
      <div className="relative w-full sm:flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ds-gray-400)] pointer-events-none" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="ds-input pl-9 w-full h-[36px] bg-white border-[var(--ds-gray-100)]"
        />
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        {/* Filter Button */}
        {onFilterClick && (
          <button
            onClick={onFilterClick}
            className={`h-[36px] w-[36px] flex items-center justify-center border border-[var(--ds-gray-100)] rounded-md transition-colors relative ${
              hasActiveFilters ? 'bg-[var(--ds-gray-100)]' : 'bg-white hover:bg-[var(--ds-gray-50)]'
            } text-[var(--ds-gray-600)]`}
            title="Filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {hasActiveFilters && (
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-blue-600" />
            )}
          </button>
        )}

        {/* View Mode Toggles */}
        {onViewModeChange && (
          <div className="flex items-center border border-[var(--ds-gray-100)] rounded-md bg-[var(--ds-gray-50)] p-0.5 h-[36px]">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`h-full w-9 flex items-center justify-center rounded-sm transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white shadow-sm text-[var(--ds-black)]' 
                  : 'text-[var(--ds-gray-500)] hover:text-[var(--ds-gray-800)]'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`h-full w-9 flex items-center justify-center rounded-sm transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white shadow-sm text-[var(--ds-black)]' 
                  : 'text-[var(--ds-gray-500)] hover:text-[var(--ds-gray-800)]'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Add New Button */}
        {onAddNewClick && (
          <button
            onClick={onAddNewClick}
            className="h-[36px] px-3 flex items-center gap-1.5 bg-[var(--ds-black)] hover:bg-[#333] text-white rounded-md text-sm font-medium transition-colors shadow-sm ml-1"
          >
            {addNewLabel}
            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SubNav;
