import React, { useState } from 'react';
import {
  X,
  MapPin,
  Phone,
  Globe,
  Star,
  Calendar,
  Sparkles,
  MessageSquare,
  Trash2,
  ExternalLink,
  Navigation,
  Clock,
  Tag,
} from 'lucide-react';
import { useLeads } from '../context/LeadContext';
import { PIPELINE_STATUSES, cleanPhoneForTel, getWhatsAppUrl } from '../utils/helpers';

export default function LeadDetailsModal() {
  const {
    detailsModalLead,
    setDetailsModalLead,
    changeLeadStatus,
    saveLeadNotes,
    saveFollowUpDate,
    removeLead,
    setPitchModalLead,
    showToast,
  } = useLeads();

  const [notes, setNotes] = useState(detailsModalLead?.notes || '');
  const [followUp, setFollowUp] = useState(
    detailsModalLead?.followUpDate
      ? new Date(detailsModalLead.followUpDate).toISOString().split('T')[0]
      : ''
  );

  if (!detailsModalLead) return null;

  const leadId = detailsModalLead._id || detailsModalLead.placeId;
  const statusConfig = PIPELINE_STATUSES[detailsModalLead.status] || PIPELINE_STATUSES.not_contacted;
  const whatsappLink = getWhatsAppUrl(detailsModalLead.phone, detailsModalLead.name, 'Alex', detailsModalLead.category);
  const telLink = cleanPhoneForTel(detailsModalLead.phone) ? `tel:${cleanPhoneForTel(detailsModalLead.phone)}` : null;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${detailsModalLead.name} ${detailsModalLead.address || detailsModalLead.searchArea}`
  )}`;

  const handleSaveNotes = () => {
    saveLeadNotes(leadId, notes);
  };

  const handleSaveFollowUp = (e) => {
    const val = e.target.value;
    setFollowUp(val);
    saveFollowUpDate(leadId, val || null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-b border-slate-800 flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 capitalize border border-slate-700">
                {detailsModalLead.category}
              </span>
              <span className="text-xs text-slate-400">in {detailsModalLead.searchArea}</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-100 mt-1.5">
              {detailsModalLead.name}
            </h2>
          </div>

          <button
            onClick={() => setDetailsModalLead(null)}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Status & Website Presence Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-950 rounded-xl border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Pipeline Stage</span>
              <select
                value={detailsModalLead.status}
                onChange={(e) => changeLeadStatus(leadId, e.target.value)}
                className={`w-full text-xs font-bold py-2 px-3 rounded-lg border bg-slate-900 ${statusConfig.bgLight}`}
              >
                {Object.values(PIPELINE_STATUSES).map((st) => (
                  <option key={st.key} value={st.key} className="bg-slate-900 text-slate-200">
                    {st.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Website Status</span>
              {detailsModalLead.hasWebsite ? (
                <a
                  href={detailsModalLead.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1.5 text-xs text-slate-300 hover:text-indigo-300 py-2"
                >
                  <Globe className="w-4 h-4 text-slate-400" />
                  <span className="truncate">{detailsModalLead.websiteUrl}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <div className="py-1.5">
                  <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-extrabold animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>NO WEBSITE (QUALIFIED LEAD)</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Contact & Location Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-2">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Contact Information</span>
              
              <div className="flex items-center space-x-2 text-xs text-slate-200">
                <Phone className="w-4 h-4 text-blue-400" />
                <span className="font-semibold">{detailsModalLead.phone || 'No phone number'}</span>
              </div>

              {detailsModalLead.rating > 0 && (
                <div className="flex items-center space-x-1.5 text-xs text-amber-400 pt-1">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span className="font-bold">{detailsModalLead.rating.toFixed(1)}</span>
                  <span className="text-slate-500">({detailsModalLead.totalRatings || 0} reviews on Google)</span>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-2">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Location & Maps</span>
              
              <div className="flex items-start space-x-2 text-xs text-slate-300">
                <MapPin className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{detailsModalLead.address || detailsModalLead.searchArea}</span>
              </div>

              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1 text-[11px] text-indigo-400 hover:text-indigo-300 pt-1"
              >
                <Navigation className="w-3 h-3" />
                <span>Open in Google Maps</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

          </div>

          {/* Follow-up Reminder & Notes */}
          <div className="space-y-4">
            
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Follow-up Reminder Date</span>
              </label>
              <input
                type="date"
                value={followUp}
                onChange={handleSaveFollowUp}
                className="w-full sm:w-64 p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Lead Notes & Outreach Activity
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Log customer requirements, pricing discussed, owner name..."
                rows={4}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow transition"
                >
                  Save Notes
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          
          <button
            onClick={() => {
              removeLead(leadId);
              setDetailsModalLead(null);
            }}
            className="flex items-center space-x-1.5 px-3 py-2 text-rose-400 hover:bg-rose-500/10 rounded-xl text-xs font-semibold transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Lead</span>
          </button>

          <div className="flex items-center space-x-2">
            {whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                onClick={() => changeLeadStatus(leadId, 'contacted')}
                className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow transition"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
            )}

            <button
              onClick={() => {
                setPitchModalLead(detailsModalLead);
                setDetailsModalLead(null);
              }}
              className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow transition"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>Pitch Script</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
