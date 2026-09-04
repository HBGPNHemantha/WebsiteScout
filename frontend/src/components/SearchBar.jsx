import React, { useState } from 'react';
import { Search, MapPin, Sparkles, RefreshCw, Layers, History } from 'lucide-react';
import { useLeads } from '../context/LeadContext';

const POPULAR_CATEGORIES = [
  'bookshops',
  'dentists',
  'bakeries',
  'plumbers',
  'gyms',
  'cafes',
  'auto repair',
  'salons',
  'contractors',
  'lawyers',
];

const POPULAR_AREAS = [
  'Kurunegala',
  'Colombo',
  'Kandy',
  'London',
  'Austin, TX',
  'New York',
  'Toronto',
  'Sydney',
];

export default function SearchBar() {
  const { executeSearch, loading, lastSearchQuery, dashboardStats } = useLeads();
  const [category, setCategory] = useState(lastSearchQuery.category || 'bookshops');
  const [area, setArea] = useState(lastSearchQuery.area || 'Kurunegala');
  const [bypassCache, setBypassCache] = useState(false);
  const [showRecent, setShowRecent] = useState(false);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!category.trim() || !area.trim()) return;
    executeSearch({
      category: category.trim(),
      area: area.trim(),
      bypassCache,
    });
  };

  const handleSelectQuick = (cat, loc) => {
    setCategory(cat);
    if (loc) setArea(loc);
    executeSearch({
      category: cat,
      area: loc || area,
      bypassCache,
    });
  };

  const recentSearches = dashboardStats?.recentSearches || [];

  return (
    <div className="w-full bg-white dark:bg-gradient-to-b dark:from-slate-900/90 dark:to-slate-950/90 border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-4 sm:p-6 shadow-xl dark:shadow-2xl relative overflow-hidden backdrop-blur-lg transition-colors">
      
      {/* Decorative Glow Background */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Search Form */}
      <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          {/* Category Input */}
          <div className="md:col-span-5 relative">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Business Category / Niche
            </label>
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 w-5 h-5 text-indigo-500 dark:text-indigo-400 pointer-events-none" />
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. bookshops, dentists, plumbers..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-700/80 hover:border-slate-400 dark:hover:border-slate-600 focus:border-indigo-500 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-medium text-sm transition shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>
          </div>

          {/* Location / Area Input */}
          <div className="md:col-span-5 relative">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Target Location / Area
              </label>
              {recentSearches.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowRecent(!showRecent)}
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 flex items-center space-x-1"
                >
                  <History className="w-3 h-3" />
                  <span>Recent</span>
                </button>
              )}
            </div>
            <div className="relative flex items-center">
              <MapPin className="absolute left-3.5 w-5 h-5 text-rose-500 dark:text-rose-400 pointer-events-none" />
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Kurunegala, London, Austin TX..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-700/80 hover:border-slate-400 dark:hover:border-slate-600 focus:border-indigo-500 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-medium text-sm transition shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>

            {/* Recent Searches Dropdown */}
            {showRecent && recentSearches.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-30 p-2 space-y-1">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 px-2 py-1 font-semibold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  Recent Scout Searches
                </div>
                {recentSearches.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setCategory(s.category);
                      setArea(s.area);
                      setShowRecent(false);
                      executeSearch({ category: s.category, area: s.area, bypassCache });
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-indigo-600 hover:text-white rounded-lg flex items-center justify-between transition"
                  >
                    <span className="capitalize font-medium">
                      {s.category} in {s.area}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {s.noWebsiteCount} leads
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2 flex flex-col justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm text-white shadow-lg flex items-center justify-center space-x-2 transition-all ${
                loading
                  ? 'bg-indigo-700/60 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-500/25 hover:shadow-indigo-500/40 active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Scouting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>Scout Leads</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Quick Category Chips & Options */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1">
              Popular:
            </span>
            {POPULAR_CATEGORIES.slice(0, 7).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleSelectQuick(cat, area)}
                className={`text-xs px-2.5 py-1 rounded-lg border capitalize transition ${
                  category.toLowerCase() === cat
                    ? 'bg-indigo-50 dark:bg-indigo-600/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/50 font-semibold'
                    : 'bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Bypass Cache Toggle */}
          <label className="flex items-center space-x-2 cursor-pointer text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300">
            <input
              type="checkbox"
              checked={bypassCache}
              onChange={(e) => setBypassCache(e.target.checked)}
              className="rounded bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500/20 w-3.5 h-3.5"
            />
            <span>Bypass 30-day Cache (Re-fetch live)</span>
          </label>

        </div>

      </form>

    </div>
  );
}
