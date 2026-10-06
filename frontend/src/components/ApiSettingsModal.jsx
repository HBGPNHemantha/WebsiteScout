import React, { useState } from 'react';
import {
  X,
  Settings,
  Key,
  CheckCircle2,
  AlertTriangle,
  Zap,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { useLeads } from '../context/LeadContext';
import { testGoogleApiKey } from '../services/api';

export default function ApiSettingsModal() {
  const { isSettingsOpen, setIsSettingsOpen, apiConfig, refreshApiConfig, showToast } = useLeads();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!isSettingsOpen) return null;

  const handleTestKey = async (e) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);

    try {
      // Pass empty string — backend now checks OSM connectivity, not a Google key
      const res = await testGoogleApiKey('');
      setTestResult({ success: true, message: res.data.message });
      showToast('OSM connection verified!', 'success');
      refreshApiConfig();
    } catch (err) {
      setTestResult({ success: false, message: err.message });
      showToast('OSM connection test failed: ' + err.message, 'error');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-100 via-indigo-50/50 to-slate-100 dark:from-slate-900 dark:via-indigo-950/50 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">Data Engine Settings</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">OpenStreetMap — No API Key Required</p>
            </div>
          </div>

          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          
          {/* Active Engine Status */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider block">
              Active Scout Engine
            </span>
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${apiConfig?.osmReachable === false ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {apiConfig?.osmReachable === false
                    ? 'Places Simulation Engine (OSM offline)'
                    : 'Live OpenStreetMap — Nominatim + Overpass'}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {apiConfig?.osmReachable === false
                    ? 'OSM is currently unreachable. Using simulation engine with geo-accurate coordinates.'
                    : 'Connected to OpenStreetMap. Fetching real business data from Overpass API — no API key needed.'}
                </p>
              </div>
            </div>
          </div>

          {/* OSM Connectivity Test */}
          <form onSubmit={handleTestKey} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center space-x-2">
              <Key className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Test OpenStreetMap Connectivity
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              No API key is needed. Click the button below to verify that the Nominatim geocoding service is reachable from your server.
            </p>

            <button
              type="submit"
              disabled={testing}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow transition flex items-center space-x-1.5"
            >
              {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>Test OSM Connection</span>}
            </button>

            {testResult && (
              <div
                className={`p-3 rounded-lg text-xs flex items-start space-x-2 border ${
                  testResult.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                    : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 mt-0.5 flex-shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </form>

          {/* How It Works */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>How the data engine works</span>
            </h3>

            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-2 leading-relaxed bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <p>
                🗺️ <strong>Geocoding</strong> — Area names are resolved to coordinates using{' '}
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Nominatim</span> (OpenStreetMap).
              </p>
              <p>
                📡 <strong>Business Search</strong> — Real businesses are fetched from the{' '}
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Overpass API</span> using OSM tags.
              </p>
              <p>
                🗄️ <strong>Caching</strong> — Results are cached in MongoDB for 30 days for instant repeat searches.
              </p>
              <p>
                🔁 <strong>Fallback</strong> — If OSM has sparse data for an area, the Simulation Engine activates automatically.
              </p>
              <p className="pt-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                ✅ Zero API keys. Zero cost. No credit card.
              </p>
            </div>

            <a
              href="https://www.openstreetmap.org"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
            >
              <span>OpenStreetMap.org</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
