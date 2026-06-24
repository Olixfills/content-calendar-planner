import { PLATFORMS, STATUSES, PillarConfig } from '../types';
import { Search, RotateCcw, SlidersHorizontal } from 'lucide-react';

interface FilterBarProps {
  search: string;
  setSearch: (s: string) => void;
  selectedPillar: string;
  setSelectedPillar: (p: string) => void;
  selectedPlatform: string;
  setSelectedPlatform: (p: string) => void;
  selectedStatus: string;
  setSelectedStatus: (s: string) => void;
  viewMode: 'calendar' | 'list';
  setViewMode: (v: 'calendar' | 'list') => void;
  onAddClick: () => void;
  pillars: PillarConfig[];
}

export default function FilterBar({
  search,
  setSearch,
  selectedPillar,
  setSelectedPillar,
  selectedPlatform,
  setSelectedPlatform,
  selectedStatus,
  setSelectedStatus,
  viewMode,
  setViewMode,
  pillars
}: FilterBarProps) {
  
  const hasActiveFilters = 
    search !== '' || 
    selectedPillar !== 'all' || 
    selectedPlatform !== 'all' || 
    selectedStatus !== 'all';

  const resetFilters = () => {
    setSearch('');
    setSelectedPillar('all');
    setSelectedPlatform('all');
    setSelectedStatus('all');
  };

  return (
    <div className="mb-6">
      
      {/* Primary Navigation / Filter row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 mb-4 gap-4">
        
        {/* Left tabs: Calendar vs List View */}
        <div className="flex gap-6">
          <button 
            onClick={() => setViewMode('calendar')}
            className={`text-sm font-semibold pb-2 border-b-2 transition-all cursor-pointer ${
              viewMode === 'calendar'
                ? 'text-slate-900 dark:text-white border-indigo-600'
                : 'text-slate-400 hover:text-slate-600 border-transparent'
            }`}
          >
            Calendar View
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`text-sm font-semibold pb-2 border-b-2 transition-all cursor-pointer ${
              viewMode === 'list'
                ? 'text-slate-900 dark:text-white border-indigo-600'
                : 'text-slate-400 hover:text-slate-600 border-transparent'
            }`}
          >
            List View
          </button>
        </div>

        {/* Right controls: Search bar */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search content..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-4 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg w-full sm:w-56 outline-none text-slate-800 dark:text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
          </div>
        </div>

      </div>

      {/* Inline Multi-Selectors segment */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-3">
        
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </div>

          {/* Pillar Selector */}
          <select
            value={selectedPillar}
            onChange={(e) => setSelectedPillar(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-lg outline-none cursor-pointer transition-all dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
          >
            <option value="all">📁 All Pillars</option>
            {pillars.map(p => (
              <option key={p.id} value={p.name}>{p.name}</option>
            ))}
          </select>

          {/* Platform Selector */}
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-lg outline-none cursor-pointer transition-all dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
          >
            <option value="all">📱 All Platforms</option>
            {PLATFORMS.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          {/* Status Selector */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-lg outline-none cursor-pointer transition-all dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
          >
            <option value="all">⚡ All Statuses</option>
            {STATUSES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Clear Action */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}

      </div>

    </div>
  );
}
