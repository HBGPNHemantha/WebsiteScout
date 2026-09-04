import React from 'react';
import { Search, Sparkles, Filter, AlertTriangle } from 'lucide-react';
import LeadCard from './LeadCard';
import { useLeads } from '../context/LeadContext';

export default function LeadList() {
  const { filteredLeads, loading, filters, setFilters, executeSearch, lastSearchQuery } = useLeads();

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((n) => (
          <div
            key={n}
            className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 animate-pulse space-y-3"
          >
            <div className="flex justify-between items-center">
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-24" />
            </div>
            <div className="h-4 bg-slate-200/60 dark:bg-slate-800/60 rounded w-2/3" />
            <div className="h-8 bg-slate-200/40 dark:bg-slate-800/40 rounded w-full mt-2" />
          </div>
        ))}
      </div>
    );
  }

  if (filteredLeads.length === 0) {
    return (
      <div className="p-8 text-center bg-white/80 dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl transition-colors">
        <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
          <Search className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No leads match your current filters</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
          Try clearing filters, searching for a different niche, or searching nearby areas.
        </p>
        <button
          type="button"
          onClick={() =>
            setFilters({
              status: 'all',
              websiteFilter: 'all',
              minRating: 0,
              searchQuery: '',
              sortBy: 'rating',
            })
          }
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 transition"
        >
          Reset Filters
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filteredLeads.map((business) => (
        <LeadCard key={business._id || business.placeId} business={business} />
      ))}
    </div>
  );
}
