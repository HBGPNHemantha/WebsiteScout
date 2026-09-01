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
  const [testKeyInput, setTestKeyInput] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!isSettingsOpen) return null;

  const handleTestKey = async (e) => {
    e.preventDefault();
    if (!testKeyInput.trim()) return;
    setTesting(true);
    setTestResult(null);

    try {
      const res = await testGoogleApiKey(testKeyInput.trim());
      setTestResult({ success: true, message: res.data.message });
      showToast('API Key verified successfully!', 'success');
      refreshApiConfig();
    } catch (err) {
      setTestResult({ success: false, message: err.message });
      showToast('Key test failed: ' + err.message, 'error');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-100">API & Engine Settings</h2>
              <p className="text-xs text-slate-400">Google Places API Keys & Data Engines</p>
            </div>
          </div>

          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          
          {/* Active Engine Status */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
              Active Scout Engine
            </span>
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${apiConfig?.hasServerKey ? 'bg-emerald-500 animate-pulse' : 'bg-indigo-500'}`} />
              <div>
                <p className="text-sm font-bold text-slate-100">
                  {apiConfig?.hasServerKey ? 'Live Google Places API' : 'Places Simulation Engine'}
                </p>
                <p className="text-xs text-slate-400">
                  {apiConfig?.hasServerKey
                    ? 'Connected directly to Google Cloud Places API (Text Search & Details proxy).'
                    : 'Instant preview mode active! Simulates real local businesses and "no website" leads with geo-accurate coordinates for any city in the world.'}
                </p>
              </div>
            </div>
          </div>

          {/* Test Google Places Key */}
          <form onSubmit={handleTestKey} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2">
              <Key className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Test Google Places API Key
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Paste an API key to test live connectivity against the Google Places endpoint.
            </p>

            <div className="flex gap-2">
              <input
                type="password"
                value={testKeyInput}
                onChange={(e) => setTestKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={testing || !testKeyInput.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow transition flex items-center space-x-1.5"
              >
                {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>Test Key</span>}
              </button>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-lg text-xs flex items-start space-x-2 border ${
                  testResult.success
                    ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800/60'
                    : 'bg-rose-950/50 text-rose-300 border-rose-800/60'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </form>

          {/* Configuration Instructions */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>How to add your permanent API keys</span>
            </h3>

            <div className="text-xs text-slate-400 space-y-2 leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-slate-850">
              <p>
                1. Open <code className="text-indigo-300 bg-slate-900 px-1 py-0.5 rounded">backend/.env</code> file.
              </p>
              <p>
                2. Set <code className="text-indigo-300 bg-slate-900 px-1 py-0.5 rounded">GOOGLE_MAPS_SERVER_API_KEY=AIzaSy...</code>
              </p>
              <p>
                3. Ensure <strong>Places API</strong> and <strong>Maps JavaScript API</strong> are enabled in your Google Cloud Console.
              </p>
            </div>

            <a
              href="https://console.cloud.google.com/google/maps-apis/overview"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
            >
              <span>Open Google Cloud Console</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
