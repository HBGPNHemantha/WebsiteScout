import React from 'react';
import {
  Star,
  Globe,
  Phone,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ChevronDown,
  Navigation,
  FileText,
} from 'lucide-react';
import { useLeads } from '../context/LeadContext';
import { PIPELINE_STATUSES, cleanPhoneForTel, getWhatsAppUrl } from '../utils/helpers';

export default function LeadTable() {
  const {
    filteredLeads,
    selectedLeadIds,
    toggleSelectLead,
    selectAllFilteredLeads,
    changeLeadStatus,
    setPitchModalLead,
    setDetailsModalLead,
    setSelectedLeadId,
    setHoveredLeadId,
  } = useLeads();

  const allSelected =
    filteredLeads.length > 0 && selectedLeadIds.size === filteredLeads.length;

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/80 backdrop-blur-md">
      <table className="w-full text-left text-xs text-slate-300">
        <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800 text-[10px]">
          <tr>
            <th className="p-3.5 w-10 text-center">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={() => selectAllFilteredLeads(filteredLeads)}
                className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500/20 w-3.5 h-3.5 cursor-pointer"
              />
            </th>
            <th className="p-3.5">Business Name</th>
            <th className="p-3.5">Category</th>
            <th className="p-3.5">Website Status</th>
            <th className="p-3.5">Rating & Reviews</th>
            <th className="p-3.5">Phone & Outreach</th>
            <th className="p-3.5">Pipeline Status</th>
            <th className="p-3.5 text-right">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-800/60">
          {filteredLeads.map((b) => {
            const leadId = b._id || b.placeId;
            const isSelected = selectedLeadIds.has(leadId);
            const statusConfig = PIPELINE_STATUSES[b.status] || PIPELINE_STATUSES.not_contacted;
            const whatsappLink = getWhatsAppUrl(b.phone, b.name, 'Alex', b.category);
            const telLink = cleanPhoneForTel(b.phone) ? `tel:${cleanPhoneForTel(b.phone)}` : null;

            return (
              <tr
                key={leadId}
                onMouseEnter={() => setHoveredLeadId(leadId)}
                onMouseLeave={() => setHoveredLeadId(null)}
                className={`hover:bg-slate-800/40 transition ${
                  isSelected ? 'bg-indigo-950/20' : ''
                }`}
              >
                {/* Checkbox */}
                <td className="p-3.5 text-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelectLead(leadId)}
                    className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-indigo-500/20 w-3.5 h-3.5 cursor-pointer"
                  />
                </td>

                {/* Name & Address */}
                <td className="p-3.5 font-medium text-slate-100 max-w-[220px]">
                  <div
                    onClick={() => setDetailsModalLead(b)}
                    className="font-bold hover:text-indigo-400 cursor-pointer truncate"
                  >
                    {b.name}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                    {b.address || b.searchArea}
                  </div>
                </td>

                {/* Category */}
                <td className="p-3.5">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 capitalize text-[11px] border border-slate-700">
                    {b.category}
                  </span>
                </td>

                {/* Website Status */}
                <td className="p-3.5">
                  {b.hasWebsite ? (
                    <a
                      href={b.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1 text-[11px] text-slate-400 hover:text-slate-200"
                    >
                      <Globe className="w-3 h-3 text-slate-500" />
                      <span className="truncate max-w-[100px]">Has Site</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ) : (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-extrabold animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      <span>NO WEBSITE</span>
                    </span>
                  )}
                </td>

                {/* Rating */}
                <td className="p-3.5">
                  {b.rating > 0 ? (
                    <div className="flex items-center space-x-1 text-amber-400 font-semibold">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{b.rating.toFixed(1)}</span>
                      <span className="text-slate-500 font-normal">({b.totalRatings || 0})</span>
                    </div>
                  ) : (
                    <span className="text-slate-500 text-[11px]">N/A</span>
                  )}
                </td>

                {/* Phone & Outreach Links */}
                <td className="p-3.5">
                  <div className="flex items-center space-x-1.5">
                    {telLink && (
                      <a
                        href={telLink}
                        onClick={() => {
                          if (b.status === 'not_contacted') changeLeadStatus(leadId, 'contacted');
                        }}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition"
                        title={`Call ${b.phone}`}
                      >
                        <Phone className="w-3.5 h-3.5 text-blue-400" />
                      </a>
                    )}

                    {whatsappLink && (
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => {
                          if (b.status === 'not_contacted') changeLeadStatus(leadId, 'contacted');
                        }}
                        className="p-1.5 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 rounded border border-emerald-800/60 transition"
                        title="WhatsApp Chat"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                      </a>
                    )}

                    <button
                      onClick={() => setPitchModalLead(b)}
                      className="p-1.5 bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 rounded border border-indigo-800/60 transition"
                      title="Pitch Generator"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                    </button>
                  </div>
                </td>

                {/* Pipeline Status Select */}
                <td className="p-3.5">
                  <select
                    value={b.status}
                    onChange={(e) => changeLeadStatus(leadId, e.target.value)}
                    className={`text-xs font-semibold py-1 px-2 rounded-lg border bg-slate-950 focus:outline-none ${statusConfig.bgLight}`}
                  >
                    {Object.values(PIPELINE_STATUSES).map((st) => (
                      <option key={st.key} value={st.key} className="bg-slate-900 text-slate-200">
                        {st.label}
                      </option>
                    ))}
                  </select>
                </td>

                {/* Actions */}
                <td className="p-3.5 text-right">
                  <div className="flex items-center justify-end space-x-1">
                    <button
                      onClick={() => setSelectedLeadId(leadId)}
                      className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded transition"
                      title="View on Map"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDetailsModalLead(b)}
                      className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition"
                      title="Lead Details & History"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
