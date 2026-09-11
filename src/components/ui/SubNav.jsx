import React from 'react';
import { Search, SlidersHorizontal, LayoutGrid, List, ChevronDown, X } from 'lucide-react';

const SubNav = ({
  typeSwitcher,
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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3">
      {/* Search Input */}
      <div className="relative w-full sm:flex-1 order-2 sm:order-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ds-gray-400)] pointer-events-none" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="ds-input pl-9 pr-[80px] w-full h-[36px] bg-white border-[var(--ds-gray-100)]"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-[28px] px-2 flex items-center gap-1 text-[var(--ds-gray-500)] hover:text-[var(--ds-black)] hover:bg-[var(--ds-gray-50)] rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-xs font-medium">Clear</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto py-0.5 order-1 sm:order-2">
        {typeSwitcher && (
          <div className="flex-1 sm:flex-initial">
            {typeSwitcher}
          </div>
        )}
        {/* Filter Button */}
        {onFilterClick && (
          <button
            type="button"
            onClick={onFilterClick}
            className={`h-[36px] w-[36px] min-w-[36px] shrink-0 flex items-center justify-center border border-[var(--ds-gray-100)] rounded-md transition-colors relative ${
              hasActiveFilters ? 'bg-[var(--ds-gray-100)]' : 'bg-white hover:bg-[var(--ds-gray-50)]'
            } text-[var(--ds-gray-600)]`}
            title="Filters"
          >
            <SlidersHorizontal className="w-4 h-4 shrink-0" />
            {hasActiveFilters && (
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-blue-600" />
            )}
          </button>
        )}

        {/* View Mode Toggles */}
        {onViewModeChange && (
          <div className="shrink-0 flex items-center border border-[var(--ds-gray-100)] rounded-md bg-[var(--ds-gray-50)] p-0.5 h-[36px]">
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              className={`h-full w-8 sm:w-9 flex items-center justify-center rounded-sm transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white shadow-sm text-[var(--ds-black)]' 
                  : 'text-[var(--ds-gray-500)] hover:text-[var(--ds-gray-800)]'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              className={`h-full w-8 sm:w-9 flex items-center justify-center rounded-sm transition-colors ${
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
            type="button"
            onClick={onAddNewClick}
            className="shrink-0 h-[36px] px-2.5 sm:px-3 flex items-center gap-1 sm:gap-1.5 bg-[var(--ds-black)] hover:bg-[#333] text-white rounded-md text-xs sm:text-sm font-medium transition-colors shadow-sm"
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
