import React from 'react';
import {
  TrendingUp,
  Users,
  Globe,
  CheckCircle2,
  PhoneCall,
  Clock,
  MapPin,
  Compass,
  ArrowUpRight,
  DollarSign,
  PieChart,
} from 'lucide-react';
import { useLeads } from '../context/LeadContext';
import { PIPELINE_STATUSES } from '../utils/helpers';

export default function DashboardView() {
  const { dashboardStats, executeSearch, setActiveTab, setFilters } = useLeads();

  const summary = dashboardStats?.summary || {
    totalLeads: 0,
    noWebsiteCount: 0,
    hasWebsiteCount: 0,
    noWebsiteRate: 0,
    contactedTotal: 0,
    outreachRate: 0,
    conversionRate: 0,
    convertedCount: 0,
    followUpsDue: 0,
  };

  const pipeline = dashboardStats?.pipeline || {
    not_contacted: 0,
    contacted: 0,
    interested: 0,
    follow_up: 0,
    converted: 0,
    not_interested: 0,
  };

  const topAreas = dashboardStats?.topAreas || [];
  const topCategories = dashboardStats?.topCategories || [];
  const recentSearches = dashboardStats?.recentSearches || [];

  // Estimated pipeline value assuming $500 avg website package
  const pipelineValue = (pipeline.interested * 500 + pipeline.follow_up * 500 + pipeline.converted * 650);

  const handleStageClick = (statusKey) => {
    setFilters((prev) => ({ ...prev, status: statusKey }));
    setActiveTab('scout');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Agency Sales Pipeline & Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time conversion metrics for missing-website client acquisition
          </p>
        </div>

        <button
          onClick={() => setActiveTab('scout')}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition"
        >
          <Compass className="w-4 h-4" />
          <span>Scout New Leads</span>
        </button>
      </div>

      {/* Top KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Scouted Leads */}
        <div className="p-5 rounded-2xl bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl relative overflow-hidden transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Leads Scouted</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">{summary.totalLeads}</span>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{summary.noWebsiteCount} without site</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            <strong className="text-slate-700 dark:text-slate-200">{summary.noWebsiteRate}%</strong> qualifying rate
          </div>
        </div>

        {/* Outreach Rate */}
        <div className="p-5 rounded-2xl bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl relative overflow-hidden transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Outreach Progress</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <PhoneCall className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">{summary.outreachRate}%</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">({summary.contactedTotal} contacted)</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            {pipeline.not_contacted} fresh leads ready for outreach
          </div>
        </div>

        {/* Closed / Converted Deals */}
        <div className="p-5 rounded-2xl bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl relative overflow-hidden transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Converted Clients</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{summary.convertedCount}</span>
            <span className="text-xs text-emerald-700 dark:text-emerald-400/80 font-semibold">{summary.conversionRate}% win rate</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            {pipeline.interested} interested prospects in funnel
          </div>
        </div>

        {/* Estimated Pipeline Value */}
        <div className="p-5 rounded-2xl bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl relative overflow-hidden transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pipeline Value</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
              ${pipelineValue.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Est. Deals</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-700 dark:text-amber-400/80">
            {summary.followUpsDue} follow-ups scheduled
          </div>
        </div>

      </div>

      {/* Visual Pipeline Funnel */}
      <div className="p-6 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-xl space-y-4 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Sales Pipeline Stages</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Click any stage to filter leads in Scout view</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.values(PIPELINE_STATUSES).map((st) => {
            const count = pipeline[st.key] || 0;
            const pct = summary.totalLeads > 0 ? Math.round((count / summary.totalLeads) * 100) : 0;

            return (
              <div
                key={st.key}
                onClick={() => handleStageClick(st.key)}
                className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${st.bgLight} hover:shadow-md`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${st.dotBg}`} />
                  <span className="text-[10px] font-bold opacity-75">{pct}%</span>
                </div>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{count}</div>
                <div className="text-xs font-semibold mt-1">{st.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Breakdown: Top Areas and Top Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Areas */}
        <div className="p-6 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-xl space-y-4 transition-colors">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-rose-500 dark:text-rose-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Top Scouted Locations</h2>
          </div>

          <div className="space-y-2">
            {topAreas.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 py-4 text-center">No location data yet</p>
            ) : (
              topAreas.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    executeSearch({ category: 'bookshops', area: item.area });
                    setActiveTab('scout');
                  }}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/70 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-800/80 cursor-pointer transition"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 w-4">{idx + 1}</span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{item.area}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-extrabold text-rose-600 dark:text-rose-400">
                      {item.noWebsites} Leads
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">({item.count} total)</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Categories */}
        <div className="p-6 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-xl space-y-4 transition-colors">
          <div className="flex items-center space-x-2">
            <PieChart className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">High-Opportunity Niches</h2>
          </div>

          <div className="space-y-2">
            {topCategories.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 py-4 text-center">No category data yet</p>
            ) : (
              topCategories.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    executeSearch({ category: item.category, area: 'Kurunegala' });
                    setActiveTab('scout');
                  }}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/70 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-800/80 cursor-pointer transition"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 w-4">{idx + 1}</span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 capitalize">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                      {item.noWebsites} Without Site
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">({item.count} total)</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Recent Searches Activity */}
      <div className="p-6 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-xl space-y-4 transition-colors">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Recent Search Activity</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Category</th>
                <th className="p-3">Area / City</th>
                <th className="p-3">Qualified Leads (No Site)</th>
                <th className="p-3">Total Results</th>
                <th className="p-3">Searched At</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {recentSearches.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="p-3 font-semibold text-slate-900 dark:text-slate-200 capitalize">{s.category}</td>
                  <td className="p-3 text-slate-700 dark:text-slate-300">{s.area}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 font-extrabold text-[11px] border border-rose-200 dark:border-rose-500/30">
                      {s.noWebsiteCount} leads
                    </span>
                  </td>
                  <td className="p-3 text-slate-500 dark:text-slate-400">{s.totalFound}</td>
                  <td className="p-3 text-slate-500 dark:text-slate-400 text-[11px]">
                    {new Date(s.searchedAt).toLocaleString()}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => {
                        executeSearch({ category: s.category, area: s.area });
                        setActiveTab('scout');
                      }}
                      className="px-3 py-1 bg-slate-100 hover:bg-indigo-600 hover:text-white dark:bg-slate-800 dark:hover:bg-indigo-600 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 transition"
                    >
                      Re-Scout
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
