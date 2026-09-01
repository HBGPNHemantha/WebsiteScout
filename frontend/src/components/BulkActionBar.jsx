import React, { useState } from 'react';
import {
  CheckSquare,
  CheckCircle2,
  Trash2,
  Download,
  X,
  ChevronDown,
  PhoneCall,
  Sparkles,
} from 'lucide-react';
import { useLeads } from '../context/LeadContext';
import { PIPELINE_STATUSES, triggerCsvDownload } from '../utils/helpers';

export default function BulkActionBar() {
  const {
    selectedLeadIds,
    leads,
    handleBulkStatusChange,
    handleBulkDelete,
    selectAllFilteredLeads,
    showToast,
  } = useLeads();

  const [showStatusOptions, setShowStatusOptions] = useState(false);

  if (selectedLeadIds.size === 0) return null;

  const selectedCount = selectedLeadIds.size;
  const selectedBusinesses = leads.filter(
    (l) => selectedLeadIds.has(l._id) || selectedLeadIds.has(l.placeId)
  );

  const handleExportSelected = () => {
    try {
      const headers = [
        'Business Name',
        'Category',
        'Search Area',
        'Has Website',
        'Website URL',
        'Phone',
        'Address',
        'Rating',
        'Total Reviews',
        'Lead Status',
        'Notes',
      ];
      const rows = selectedBusinesses.map((b) => [
        `"${(b.name || '').replace(/"/g, '""')}"`,
        `"${(b.category || '').replace(/"/g, '""')}"`,
        `"${(b.searchArea || '').replace(/"/g, '""')}"`,
        `"${b.hasWebsite ? 'YES' : 'NO'}"`,
        `"${(b.websiteUrl || '').replace(/"/g, '""')}"`,
        `"${(b.phone || '').replace(/"/g, '""')}"`,
        `"${(b.address || '').replace(/"/g, '""')}"`,
        b.rating || 0,
        b.totalRatings || 0,
        `"${b.status || 'not_contacted'}"`,
        `"${(b.notes || '').replace(/"/g, '""')}"`,
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      triggerCsvDownload(csvContent, `websitescout_selected_${selectedCount}_leads.csv`);
      showToast(`Exported ${selectedCount} selected leads to CSV`, 'success');
    } catch (err) {
      showToast('Export failed: ' + err.message, 'error');
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-bounce-subtle">
      <div className="flex flex-wrap items-center space-x-2 sm:space-x-3 bg-slate-900/95 border border-indigo-500/40 text-slate-100 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
        
        {/* Count Badge */}
        <div className="flex items-center space-x-2 pr-3 border-r border-slate-700">
          <span className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-extrabold text-white">
            {selectedCount}
          </span>
          <span className="text-xs font-semibold text-slate-200 hidden sm:inline">
            selected
          </span>
        </div>

        {/* Quick Mark as Contacted */}
        <button
          type="button"
          onClick={() => handleBulkStatusChange('contacted')}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow transition"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Mark Contacted</span>
        </button>

        {/* Status Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowStatusOptions(!showStatusOptions)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
          >
            <span>Change Status</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {showStatusOptions && (
            <div className="absolute bottom-full left-0 mb-2 w-44 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1 space-y-1">
              {Object.values(PIPELINE_STATUSES).map((st) => (
                <button
                  key={st.key}
                  type="button"
                  onClick={() => {
                    handleBulkStatusChange(st.key);
                    setShowStatusOptions(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800 rounded-lg flex items-center space-x-2 transition"
                >
                  <span className={`w-2 h-2 rounded-full ${st.dotBg}`} />
                  <span>{st.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Export Selected */}
        <button
          type="button"
          onClick={handleExportSelected}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
          title="Export selected leads"
        >
          <Download className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden md:inline">Export</span>
        </button>

        {/* Bulk Delete */}
        <button
          type="button"
          onClick={handleBulkDelete}
          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition"
          title="Delete selected leads"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Clear selection */}
        <button
          type="button"
          onClick={() => selectAllFilteredLeads([])}
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition"
          title="Deselect all"
        >
          <X className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
}
