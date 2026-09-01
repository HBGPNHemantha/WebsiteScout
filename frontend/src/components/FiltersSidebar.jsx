import React from 'react';
import {
  Filter,
  Search,
  Star,
  Globe,
  AlertCircle,
  CheckCircle2,
  X,
  RotateCcw,
} from 'lucide-react';
import { useLeads } from '../context/LeadContext';
import { PIPELINE_STATUSES } from '../utils/helpers';

export default function FiltersSidebar() {
  const { filters, setFilters, leads } = useLeads();

  // Compute status counts
  const statusCounts = leads.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {});

  const noWebsiteCount = leads.filter((l) => !l.hasWebsite).length;
  const hasWebsiteCount = leads.filter((l) => l.hasWebsite).length;

  const handleReset = () => {
    setFilters({
      status: 'all',
      websiteFilter: 'no_website',
      minRating: 0,
      searchQuery: '',
      sortBy: 'rating',
    });
  };

  return (
    <aside className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-5 backdrop-blur-md">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2 text-slate-200 font-bold text-sm">
          <Filter className="w-4 h-4 text-indigo-400" />
          <span>Filters & Sort</span>
        </div>
        <button
          onClick={handleReset}
          className="text-[11px] text-slate-400 hover:text-indigo-400 flex items-center space-x-1 transition"
          title="Reset all filters"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Real-time Keyword Search */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
          Filter by Keyword
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
            placeholder="Search name, phone, notes..."
            className="w-full pl-9 pr-8 py-2 bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters({ ...filters, searchQuery: '' })}
              className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Website Presence Filter */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
          Website Presence
        </label>
        <div className="grid grid-cols-1 gap-1.5">
          <button
            type="button"
            onClick={() => setFilters({ ...filters, websiteFilter: 'no_website' })}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold border transition ${
              filters.websiteFilter === 'no_website'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>Missing Website (Leads)</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
              {noWebsiteCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilters({ ...filters, websiteFilter: 'all' })}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold border transition ${
              filters.websiteFilter === 'all'
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>Show All Businesses</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
              {leads.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilters({ ...filters, websiteFilter: 'has_website' })}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold border transition ${
              filters.websiteFilter === 'has_website'
                ? 'bg-slate-800 text-slate-200 border-slate-700 shadow-sm'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Has Website (Filtered Out)</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
              {hasWebsiteCount}
            </span>
          </button>
        </div>
      </div>

      {/* Pipeline Status Filter */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
          Pipeline Status
        </label>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setFilters({ ...filters, status: 'all' })}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
              filters.status === 'all'
                ? 'bg-indigo-600 text-white font-bold'
                : 'text-slate-300 hover:bg-slate-800/70'
            }`}
          >
            <span>All Statuses</span>
            <span className="text-[10px] opacity-80">{leads.length}</span>
          </button>

          {Object.values(PIPELINE_STATUSES).map((st) => (
            <button
              key={st.key}
              type="button"
              onClick={() => setFilters({ ...filters, status: st.key })}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                filters.status === st.key
                  ? 'bg-slate-800 text-white font-bold border border-slate-700'
                  : 'text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${st.dotBg}`} />
                <span>{st.label}</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-950 text-slate-400 border border-slate-850">
                {statusCounts[st.key] || 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Minimum Rating Filter */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
          Minimum Rating
        </label>
        <div className="grid grid-cols-4 gap-1">
          {[0, 3.5, 4.0, 4.5].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setFilters({ ...filters, minRating: val })}
              className={`py-1.5 text-xs font-semibold rounded-lg border transition ${
                filters.minRating === val
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              {val === 0 ? 'Any' : `${val}+ ★`}
            </button>
          ))}
        </div>
      </div>

      {/* Sort Option */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
          Sort Results By
        </label>
        <select
          value={filters.sortBy}
          onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
          className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="rating">Highest Rating First</option>
          <option value="reviews">Most Reviews Count</option>
          <option value="name">Alphabetical (A - Z)</option>
          <option value="newest">Recently Discovered</option>
        </select>
      </div>

    </aside>
  );
}
