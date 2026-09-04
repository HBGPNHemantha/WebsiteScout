import React, { useState } from 'react';
import {
  Phone,
  MessageSquare,
  Globe,
  Star,
  MapPin,
  Sparkles,
  Calendar,
  FileText,
  Trash2,
  ExternalLink,
  ChevronDown,
  Navigation,
} from 'lucide-react';
import { useLeads } from '../context/LeadContext';
import { PIPELINE_STATUSES, cleanPhoneForTel, getWhatsAppUrl } from '../utils/helpers';

export default function LeadCard({ business }) {
  const {
    changeLeadStatus,
    saveLeadNotes,
    saveFollowUpDate,
    removeLead,
    setSelectedLeadId,
    setHoveredLeadId,
    setPitchModalLead,
    setDetailsModalLead,
    selectedLeadIds,
    toggleSelectLead,
  } = useLeads();

  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [noteText, setNoteText] = useState(business.notes || '');
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const statusConfig = PIPELINE_STATUSES[business.status] || PIPELINE_STATUSES.not_contacted;
  const isSelected = selectedLeadIds.has(business._id) || selectedLeadIds.has(business.placeId);
  const leadId = business._id || business.placeId;

  const handleSaveNotes = () => {
    saveLeadNotes(leadId, noteText);
    setIsEditingNotes(false);
  };

  const whatsappLink = getWhatsAppUrl(business.phone, business.name, 'Alex', business.category);
  const telLink = cleanPhoneForTel(business.phone) ? `tel:${cleanPhoneForTel(business.phone)}` : null;

  return (
    <div
      onMouseEnter={() => setHoveredLeadId(leadId)}
      onMouseLeave={() => setHoveredLeadId(null)}
      className={`group relative rounded-xl border transition-all duration-200 p-4 sm:p-5 ${
        business.hasWebsite
          ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/60 opacity-80 hover:opacity-100'
          : 'bg-white dark:bg-slate-900/90 border-slate-200/90 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:shadow-lg dark:hover:shadow-xl dark:hover:shadow-indigo-500/5'
      } ${isSelected ? 'ring-2 ring-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/20' : ''}`}
    >
      
      {/* Top Header: Selection Checkbox, Name, Category, Website Status Badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleSelectLead(leadId)}
            className="mt-1 rounded bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500/20 w-4 h-4 cursor-pointer"
          />
          <div>
            <h3
              onClick={() => setDetailsModalLead(business)}
              className="text-base font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition flex items-center gap-2"
            >
              <span>{business.name}</span>
            </h3>

            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize border border-slate-200 dark:border-slate-700/60">
                {business.category}
              </span>

              {/* Rating */}
              {business.rating > 0 ? (
                <span className="flex items-center space-x-1 text-xs text-amber-500 dark:text-amber-400 font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{business.rating.toFixed(1)}</span>
                  <span className="text-slate-400 dark:text-slate-500 font-normal">({business.totalRatings || 0})</span>
                </span>
              ) : (
                <span className="text-[11px] text-slate-400 dark:text-slate-500">No reviews yet</span>
              )}
            </div>
          </div>
        </div>

        {/* Website Presence Badge */}
        <div>
          {business.hasWebsite ? (
            <a
              href={business.websiteUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1 text-[11px] font-semibold px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700 transition"
              title={business.websiteUrl}
            >
              <Globe className="w-3 h-3 text-slate-400" />
              <span>Has Website</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          ) : (
            <span className="inline-flex items-center space-x-1 text-[11px] font-extrabold px-2.5 py-1 rounded-md bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/40 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>NO WEBSITE</span>
            </span>
          )}
        </div>
      </div>

      {/* Address & Location */}
      <div className="mt-3 flex items-start space-x-2 text-xs text-slate-500 dark:text-slate-400">
        <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
        <span className="truncate">{business.address || `${business.searchArea}`}</span>
      </div>

      {/* Action Buttons: Phone Call, WhatsApp, Pitch Generator */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-2">
        
        {/* Click to Call */}
        {telLink ? (
          <a
            href={telLink}
            onClick={() => {
              if (business.status === 'not_contacted') {
                changeLeadStatus(leadId, 'contacted');
              }
            }}
            className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition"
            title={`Call ${business.phone}`}
          >
            <Phone className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
            <span className="truncate">{business.phone || 'Call'}</span>
          </a>
        ) : (
          <div className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-600 text-xs font-medium border border-slate-200 dark:border-slate-800 cursor-not-allowed">
            <Phone className="w-3.5 h-3.5" />
            <span>No Phone</span>
          </div>
        )}

        {/* WhatsApp Direct Chat */}
        {whatsappLink ? (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            onClick={() => {
              if (business.status === 'not_contacted') {
                changeLeadStatus(leadId, 'contacted');
              }
            }}
            className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800/60 transition"
            title="Open WhatsApp chat with prefilled pitch"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>WhatsApp</span>
          </a>
        ) : (
          <div className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-600 text-xs font-medium border border-slate-200 dark:border-slate-800 cursor-not-allowed">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </div>
        )}

        {/* Sales Pitch Script Trigger */}
        <button
          onClick={() => setPitchModalLead(business)}
          className="col-span-2 sm:col-span-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-200 dark:border-indigo-800/60 transition"
          title="Open customizable sales pitch scripts for cold call, email, and WhatsApp"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-yellow-400" />
          <span>Pitch Script</span>
        </button>

      </div>

      {/* Footer: Pipeline Status Dropdown & Notes/View on map */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
        
        {/* Status Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className={`flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition ${statusConfig.bgLight}`}
          >
            <span className={`w-2 h-2 rounded-full ${statusConfig.dotBg}`} />
            <span>{statusConfig.label}</span>
            <ChevronDown className="w-3 h-3 ml-1 opacity-70" />
          </button>

          {/* Status Selection Popup Menu */}
          {showStatusMenu && (
            <div className="absolute left-0 bottom-full mb-1 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-20 p-1 space-y-0.5">
              {Object.values(PIPELINE_STATUSES).map((st) => (
                <button
                  key={st.key}
                  type="button"
                  onClick={() => {
                    changeLeadStatus(leadId, st.key);
                    setShowStatusMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 text-xs font-medium rounded-lg flex items-center space-x-2 transition ${
                    business.status === st.key
                      ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-white font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${st.dotBg}`} />
                  <span>{st.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Tools: Notes Toggle, Details, Map Center */}
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => setIsEditingNotes(!isEditingNotes)}
            className={`p-1.5 rounded text-xs transition ${
              business.notes
                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={business.notes ? `Note: ${business.notes}` : 'Add lead notes'}
          >
            <FileText className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setSelectedLeadId(leadId)}
            className="p-1.5 rounded text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs transition"
            title="Focus on Map"
          >
            <Navigation className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => removeLead(leadId)}
            className="p-1.5 rounded text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs transition"
            title="Delete lead"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Inline Notes Editor */}
      {isEditingNotes && (
        <div className="mt-3 p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2 animate-fadeIn">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add notes (e.g. Spoke with owner John, wants 5-page quote by Tuesday)..."
            rows={2}
            className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsEditingNotes(false)}
              className="px-2 py-1 text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveNotes}
              className="px-2.5 py-1 text-[11px] bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-md shadow"
            >
              Save Note
            </button>
          </div>
        </div>
      )}

      {/* Display Existing Note Preview if not editing */}
      {!isEditingNotes && business.notes && (
        <div className="mt-2 text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/70 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800/80 italic line-clamp-2">
          "{business.notes}"
        </div>
      )}

    </div>
  );
}
