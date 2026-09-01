import React from 'react';
import Navbar from './components/Navbar';
import SearchBar from './components/SearchBar';
import ViewToggle from './components/ViewToggle';
import LeadList from './components/LeadList';
import LeadTable from './components/LeadTable';
import MapView from './components/MapView';
import FiltersSidebar from './components/FiltersSidebar';
import BulkActionBar from './components/BulkActionBar';
import PitchGeneratorModal from './components/PitchGeneratorModal';
import LeadDetailsModal from './components/LeadDetailsModal';
import DashboardView from './components/DashboardView';
import ApiSettingsModal from './components/ApiSettingsModal';
import AuthModal from './components/AuthModal';
import { useLeads } from './context/LeadContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function App() {
  const { activeTab, viewMode, toast, searchMeta } = useLeads();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Navigation Header */}
      <Navbar />

      {/* Global Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 animate-slide-in">
          <div
            className={`flex items-center space-x-2.5 px-4 py-3 rounded-xl shadow-2xl border text-xs font-semibold backdrop-blur-md ${
              toast.type === 'error'
                ? 'bg-rose-950/90 text-rose-200 border-rose-800/80 shadow-rose-950/40'
                : toast.type === 'info'
                ? 'bg-slate-900/90 text-slate-200 border-slate-700 shadow-slate-950/40'
                : 'bg-emerald-950/90 text-emerald-200 border-emerald-800/80 shadow-emerald-950/40'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            ) : toast.type === 'info' ? (
              <Info className="w-4 h-4 text-blue-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* TAB 1: Scout Leads */}
        {activeTab === 'scout' && (
          <div className="space-y-6">
            
            {/* Search Hero */}
            <SearchBar />

            {/* View & Summary Bar */}
            <ViewToggle />

            {/* View Layouts */}
            {viewMode === 'split' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Column: Filters + Lead Cards */}
                <div className="lg:col-span-6 space-y-4">
                  <FiltersSidebar />
                  <LeadList />
                </div>

                {/* Right Column: Sticky Interactive Map */}
                <div className="lg:col-span-6 lg:sticky lg:top-20 h-[580px] lg:h-[calc(100vh-140px)]">
                  <MapView />
                </div>

              </div>
            )}

            {viewMode === 'list' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-4 lg:sticky lg:top-20">
                  <FiltersSidebar />
                </div>
                <div className="lg:col-span-8">
                  <LeadList />
                </div>
              </div>
            )}

            {viewMode === 'table' && (
              <div className="space-y-4">
                <FiltersSidebar />
                <LeadTable />
              </div>
            )}

            {viewMode === 'map' && (
              <div className="h-[calc(100vh-200px)] min-h-[500px]">
                <MapView />
              </div>
            )}

          </div>
        )}

        {/* TAB 2: Pipeline CRM & Analytics */}
        {activeTab === 'pipeline' && <DashboardView />}

        {/* TAB 3: Saved Leads Database */}
        {activeTab === 'all_leads' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-100">Saved Lead Database</h1>
                <p className="text-xs text-slate-400">All local businesses scouted and tracked across sessions</p>
              </div>
            </div>
            <ViewToggle />
            <FiltersSidebar />
            <LeadTable />
          </div>
        )}

      </main>

      {/* Floating Modals & Bulk Actions */}
      <BulkActionBar />
      <PitchGeneratorModal />
      <LeadDetailsModal />
      <ApiSettingsModal />
      <AuthModal />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p>WebsiteScout — Google Places Lead Generation Engine & Pipeline CRM</p>
      </footer>

    </div>
  );
}
