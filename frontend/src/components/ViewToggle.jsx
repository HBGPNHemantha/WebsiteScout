import React from 'react';
import {
  Columns,
  List,
  Table,
  Map,
  Download,
  Filter,
  Globe2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useLeads } from '../context/LeadContext';
import { triggerCsvDownload } from '../utils/helpers';
import api from '../services/api';

export default function ViewToggle() {
  const {
    viewMode,
    setViewMode,
    filteredLeads,
    leads,
    filters,
    setFilters,
    showToast,
    lastSearchQuery,
  } = useLeads();

  const noWebsiteLeads = leads.filter((l) => !l.hasWebsite).length;
  const convertedLeads = leads.filter((l) => l.status === 'converted').length;

  const handleExport = async () => {
    try {
      const res = await api.get('/businesses/export', {
        params: {
          category: lastSearchQuery.category,
          area: lastSearchQuery.area,
          status: filters.status !== 'all' ? filters.status : undefined,
          hasWebsite:
            filters.websiteFilter === 'no_website'
              ? false
              : filters.websiteFilter === 'has_website'
              ? true
              : undefined,
        },
      });
      triggerCsvDownload(
        res.data,
        `websitescout_${lastSearchQuery.category}_${lastSearchQuery.area}_leads.csv`
      );
      showToast(`Exported ${filteredLeads.length} leads to CSV`, 'success');
    } catch (err) {
      showToast('Failed to export CSV: ' + err.message, 'error');
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
      
      {/* Left: Quick Stats Pills */}
      <div className="flex items-center space-x-2 text-xs">
        <div className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-semibold">
          <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
          <span>{noWebsiteLeads} Without Website</span>
        </div>

        <div className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{convertedLeads} Converted</span>
        </div>

        <span className="text-slate-500 hidden sm:inline">•</span>

        <span className="text-slate-400 text-xs hidden sm:inline">
          Showing <strong className="text-slate-200">{filteredLeads.length}</strong> of{' '}
          {leads.length} results
        </span>
      </div>

      {/* Right: View Toggles & Export */}
      <div className="flex items-center space-x-2">
        
        {/* View Segmented Switch */}
        <div className="flex items-center p-0.5 bg-slate-950 rounded-lg border border-slate-800">
          
          <button
            onClick={() => setViewMode('split')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition ${
              viewMode === 'split'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Split View (Map + List)"
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Split</span>
          </button>

          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition ${
              viewMode === 'list'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="List Cards View"
          >
            <List className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cards</span>
          </button>

          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition ${
              viewMode === 'table'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Table Spreadsheet View"
          >
            <Table className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Table</span>
          </button>

          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition ${
              viewMode === 'map'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Full Map View"
          >
            <Map className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Map</span>
          </button>

        </div>

        {/* Export CSV Button */}
        <button
          onClick={handleExport}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition"
          title="Export current filtered leads to CSV"
        >
          <Download className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden md:inline">Export CSV</span>
        </button>

      </div>

    </div>
  );
}
