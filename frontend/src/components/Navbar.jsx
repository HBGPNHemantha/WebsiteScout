import React from 'react';
import {
  Compass,
  LayoutDashboard,
  Database,
  SlidersHorizontal,
  Settings,
  Sun,
  Moon,
  User,
  LogOut,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useLeads } from '../context/LeadContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { activeTab, setActiveTab, apiConfig, setIsSettingsOpen, dashboardStats } = useLeads();
  const { darkMode, toggleDarkMode } = useTheme();
  const { user, logout, openAuthModal } = useAuth();

  const totalLeads = dashboardStats?.summary?.totalLeads || 0;
  const noWebsites = dashboardStats?.summary?.noWebsiteCount || 0;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('scout')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Compass className="w-6 h-6 text-white animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 via-indigo-900 to-indigo-600 dark:from-white dark:via-indigo-200 dark:to-indigo-400 bg-clip-text text-transparent">
                WebsiteScout
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 dark:border-indigo-500/30">
                v1.0
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
              Find businesses without websites & close sales leads
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1 p-1 bg-slate-100/90 dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
          <button
            onClick={() => setActiveTab('scout')}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'scout'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Scout Leads</span>
          </button>

          <button
            onClick={() => setActiveTab('pipeline')}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'pipeline'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Pipeline CRM</span>
            {totalLeads > 0 && (
              <span className="text-xs px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700/50">
                {noWebsites} leads
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('all_leads')}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'all_leads'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Saved Leads</span>
          </button>
        </nav>

        {/* Right Actions: Mode indicator, Settings, Theme, Auth */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* API Engine Badge */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className={`hidden lg:flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${
              apiConfig?.hasServerKey
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60'
            }`}
            title="Click to configure Google Maps API Keys or switch engines"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500 dark:text-yellow-400 animate-pulse" />
            <span>{apiConfig?.hasServerKey ? 'Google Places Live' : 'Simulation Engine'}</span>
          </button>

          {/* Settings Modal Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-transparent dark:hover:border-slate-700 transition"
            title="API & System Settings"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 transition shadow-sm"
            title={darkMode ? "Switch to Light mode" : "Switch to Dark mode"}
            aria-label="Toggle theme mode"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-amber-400 transition-transform duration-200 hover:rotate-45" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-600 transition-transform duration-200 hover:-rotate-12" />
            )}
          </button>

          {/* Auth Button / Profile Dropdown */}
          {user ? (
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="hidden sm:block text-left text-xs">
                <p className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[110px]">{user.name}</p>
                <p className="text-slate-500 dark:text-slate-400 text-[10px] truncate max-w-[110px]">{user.agencyName || 'Agency'}</p>
              </div>
              <button
                onClick={logout}
                className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition"
            >
              <User className="w-3.5 h-3.5" />
              <span>Agency Login</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
