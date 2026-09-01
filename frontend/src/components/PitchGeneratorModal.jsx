import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Copy,
  Check,
  MessageSquare,
  Phone,
  Mail,
  Send,
  ExternalLink,
  Edit3,
} from 'lucide-react';
import { useLeads } from '../context/LeadContext';
import { useAuth } from '../context/AuthContext';
import { generatePitchTemplates, getWhatsAppUrl } from '../utils/helpers';

export default function PitchGeneratorModal() {
  const { pitchModalLead, setPitchModalLead, showToast, changeLeadStatus } = useLeads();
  const { user } = useAuth();

  const [activePitchType, setActivePitchType] = useState('whatsapp'); // 'whatsapp' | 'cold_call' | 'cold_email' | 'sms'
  const [agencyName, setAgencyName] = useState(user?.agencyName || 'Apex Web Studio');
  const [senderName, setSenderName] = useState(user?.name || 'Alex');
  const [copied, setCopied] = useState(false);

  if (!pitchModalLead) return null;

  const templates = generatePitchTemplates(pitchModalLead, agencyName, senderName);
  const currentTemplate = templates[activePitchType] || templates.whatsapp;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Pitch copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappDirectUrl = getWhatsAppUrl(
    pitchModalLead.phone,
    pitchModalLead.name,
    senderName,
    pitchModalLead.category
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shadow-inner">
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-100 flex items-center gap-2">
                <span>Sales Pitch Generator</span>
              </h2>
              <p className="text-xs text-slate-400">
                Tailored outreach for <strong className="text-indigo-300">{pitchModalLead.name}</strong> ({pitchModalLead.category})
              </p>
            </div>
          </div>

          <button
            onClick={() => setPitchModalLead(null)}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Agency Config Bar */}
        <div className="px-5 py-3 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-bold block">Your Name</label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-500 uppercase font-bold block">Agency / Business</label>
              <input
                type="text"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400">Lead Target:</span>
            <p className="font-semibold text-slate-300">{pitchModalLead.phone || 'No phone listed'}</p>
          </div>
        </div>

        {/* Pitch Format Tabs */}
        <div className="px-5 pt-4 flex space-x-2 border-b border-slate-800 overflow-x-auto">
          
          <button
            onClick={() => setActivePitchType('whatsapp')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-bold rounded-t-xl border-b-2 transition ${
              activePitchType === 'whatsapp'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp Pitch</span>
          </button>

          <button
            onClick={() => setActivePitchType('cold_call')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-bold rounded-t-xl border-b-2 transition ${
              activePitchType === 'cold_call'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Cold Call Script</span>
          </button>

          <button
            onClick={() => setActivePitchType('cold_email')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-bold rounded-t-xl border-b-2 transition ${
              activePitchType === 'cold_email'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Cold Email</span>
          </button>

          <button
            onClick={() => setActivePitchType('sms')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-bold rounded-t-xl border-b-2 transition ${
              activePitchType === 'sms'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Short SMS</span>
          </button>

        </div>

        {/* Pitch Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          
          {/* Cold Email Subject Line Preview */}
          {activePitchType === 'cold_email' && currentTemplate.subject && (
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Subject Line:</span>
              <p className="text-xs text-slate-200 font-semibold">{currentTemplate.subject}</p>
            </div>
          )}

          {/* Script Content */}
          <div className="relative">
            <textarea
              readOnly
              value={currentTemplate.text}
              rows={9}
              className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono leading-relaxed resize-none focus:outline-none shadow-inner"
            />
            
            <button
              onClick={() => handleCopy(currentTemplate.text)}
              className="absolute top-3 right-3 flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 shadow-md transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Copy Script</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                changeLeadStatus(pitchModalLead._id || pitchModalLead.placeId, 'contacted');
                showToast('Marked as Contacted!', 'success');
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition"
            >
              Mark Lead as "Contacted"
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {activePitchType === 'whatsapp' && whatsappDirectUrl && (
              <a
                href={whatsappDirectUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => {
                  changeLeadStatus(pitchModalLead._id || pitchModalLead.placeId, 'contacted');
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Open in WhatsApp</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            <button
              onClick={() => setPitchModalLead(null)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
            >
              Done
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
