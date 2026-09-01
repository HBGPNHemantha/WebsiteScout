import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  searchLeads,
  getBusinesses,
  updateBusinessStatus,
  updateBusinessNotes,
  updateFollowUpDate,
  deleteBusiness,
  bulkAction,
  getDashboardAnalytics,
  getApiSettingsStatus
} from '../services/api';

const LeadContext = createContext();

export function LeadProvider({ children }) {
  // Navigation & View states
  const [activeTab, setActiveTab] = useState('scout'); // 'scout' | 'pipeline' | 'all_leads'
  const [viewMode, setViewMode] = useState('split');   // 'split' | 'list' | 'table' | 'map'

  // Data states
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchMeta, setSearchMeta] = useState(null);
  const [lastSearchQuery, setLastSearchQuery] = useState({ category: 'bookshops', area: 'Kurunegala' });
  const [dashboardStats, setDashboardStats] = useState(null);
  const [apiConfig, setApiConfig] = useState(null);

  // Selected lead for modals & map interaction
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [hoveredLeadId, setHoveredLeadId] = useState(null);
  const [pitchModalLead, setPitchModalLead] = useState(null);
  const [detailsModalLead, setDetailsModalLead] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Bulk actions selection
  const [selectedLeadIds, setSelectedLeadIds] = useState(new Set());

  // Filter states
  const [filters, setFilters] = useState({
    status: 'all',
    websiteFilter: 'no_website', // 'no_website' | 'all' | 'has_website'
    minRating: 0,
    searchQuery: '',
    sortBy: 'rating', // 'rating' | 'reviews' | 'name' | 'newest'
  });

  // Toast notification state
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Fetch initial system status and dashboard stats
  const refreshDashboard = useCallback(async () => {
    try {
      const res = await getDashboardAnalytics();
      if (res.data.success) {
        setDashboardStats(res.data.data);
      }
    } catch (err) {
      console.warn('Dashboard fetch error:', err.message);
    }
  }, []);

  const refreshApiConfig = useCallback(async () => {
    try {
      const res = await getApiSettingsStatus();
      if (res.data.success) {
        setApiConfig(res.data.data);
      }
    } catch (err) {
      console.warn('API config fetch error:', err.message);
    }
  }, []);

  // Fetch all leads from database
  const fetchAllLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getBusinesses({ limit: 300 });
      if (res.data.success) {
        setLeads(res.data.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to fetch stored leads', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Execute Search
  const executeSearch = async ({ category, area, bypassCache = false }) => {
    setLoading(true);
    setSearchMeta(null);
    setLastSearchQuery({ category, area });
    setSelectedLeadIds(new Set());

    try {
      const res = await searchLeads({ category, area, bypassCache });
      if (res.data.success) {
        setLeads(res.data.data);
        setSearchMeta(res.data.meta);
        showToast(
          `Found ${res.data.meta.totalFound} businesses (${res.data.meta.noWebsiteCount} qualified leads without websites)`,
          'success'
        );
        refreshDashboard();
      }
    } catch (err) {
      showToast(err.message || 'Failed to execute business search', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Status Change Handler
  const changeLeadStatus = async (leadId, newStatus) => {
    // Optimistic UI update
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead._id === leadId || lead.placeId === leadId) {
          return {
            ...lead,
            status: newStatus,
            contactedAt: newStatus !== 'not_contacted' ? new Date() : lead.contactedAt,
          };
        }
        return lead;
      })
    );

    // Trigger celebration confetti for conversion!
    if (newStatus === 'converted') {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#6366f1', '#f59e0b', '#ec4899'],
        });
      } catch (e) {
        // ignore if confetti fails
      }
    }

    try {
      const res = await updateBusinessStatus(leadId, newStatus);
      if (res.data.success) {
        showToast(`Status updated to "${newStatus.replace('_', ' ')}"`, 'success');
        refreshDashboard();
      }
    } catch (err) {
      showToast(`Failed to update status: ${err.message}`, 'error');
      // Revert if error
      fetchAllLeads();
    }
  };

  // Notes update handler
  const saveLeadNotes = async (leadId, notes) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead._id === leadId || lead.placeId === leadId ? { ...lead, notes } : lead
      )
    );

    try {
      await updateBusinessNotes(leadId, notes);
      showToast('Notes saved successfully', 'success');
    } catch (err) {
      showToast(`Failed to save notes: ${err.message}`, 'error');
    }
  };

  // Follow-up date handler
  const saveFollowUpDate = async (leadId, followUpDate) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead._id === leadId || lead.placeId === leadId ? { ...lead, followUpDate } : lead
      )
    );

    try {
      await updateFollowUpDate(leadId, followUpDate);
      showToast('Follow-up reminder set', 'success');
      refreshDashboard();
    } catch (err) {
      showToast(`Failed to update follow-up date: ${err.message}`, 'error');
    }
  };

  // Remove lead handler
  const removeLead = async (leadId) => {
    setLeads((prev) => prev.filter((l) => l._id !== leadId && l.placeId !== leadId));
    try {
      await deleteBusiness(leadId);
      showToast('Lead removed from database', 'info');
      refreshDashboard();
    } catch (err) {
      showToast(`Failed to delete: ${err.message}`, 'error');
      fetchAllLeads();
    }
  };

  // Bulk Actions
  const handleBulkStatusChange = async (status) => {
    const ids = Array.from(selectedLeadIds);
    if (ids.length === 0) return;

    setLeads((prev) =>
      prev.map((l) => (ids.includes(l._id) || ids.includes(l.placeId) ? { ...l, status } : l))
    );

    try {
      await bulkAction({ ids, action: 'update_status', status });
      showToast(`Updated ${ids.length} leads to "${status.replace('_', ' ')}"`, 'success');
      setSelectedLeadIds(new Set());
      refreshDashboard();
    } catch (err) {
      showToast(`Bulk update failed: ${err.message}`, 'error');
      fetchAllLeads();
    }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedLeadIds);
    if (ids.length === 0) return;

    setLeads((prev) => prev.filter((l) => !ids.includes(l._id) && !ids.includes(l.placeId)));

    try {
      await bulkAction({ ids, action: 'delete' });
      showToast(`Deleted ${ids.length} leads`, 'info');
      setSelectedLeadIds(new Set());
      refreshDashboard();
    } catch (err) {
      showToast(`Bulk delete failed: ${err.message}`, 'error');
      fetchAllLeads();
    }
  };

  const toggleSelectLead = (id) => {
    setSelectedLeadIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAllFilteredLeads = (filteredItems) => {
    if (selectedLeadIds.size === filteredItems.length && filteredItems.length > 0) {
      setSelectedLeadIds(new Set());
    } else {
      const allIds = new Set(filteredItems.map((item) => item._id || item.placeId));
      setSelectedLeadIds(allIds);
    }
  };

  // Filtered Leads computation
  const filteredLeads = useMemo(() => {
    return leads
      .filter((lead) => {
        // Status filter
        if (filters.status !== 'all' && lead.status !== filters.status) {
          return false;
        }

        // Website filter
        if (filters.websiteFilter === 'no_website' && lead.hasWebsite) {
          return false;
        }
        if (filters.websiteFilter === 'has_website' && !lead.hasWebsite) {
          return false;
        }

        // Rating filter
        if (filters.minRating > 0 && (lead.rating || 0) < filters.minRating) {
          return false;
        }

        // Search query
        if (filters.searchQuery.trim() !== '') {
          const q = filters.searchQuery.toLowerCase().trim();
          const matchName = lead.name?.toLowerCase().includes(q);
          const matchAddr = lead.address?.toLowerCase().includes(q);
          const matchPhone = lead.phone?.toLowerCase().includes(q);
          const matchNotes = lead.notes?.toLowerCase().includes(q);
          if (!matchName && !matchAddr && !matchPhone && !matchNotes) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'rating') {
          return (b.rating || 0) - (a.rating || 0);
        }
        if (filters.sortBy === 'reviews') {
          return (b.totalRatings || 0) - (a.totalRatings || 0);
        }
        if (filters.sortBy === 'name') {
          return (a.name || '').localeCompare(b.name || '');
        }
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [leads, filters]);

  // Initial load
  useEffect(() => {
    refreshDashboard();
    refreshApiConfig();
    // Default initial quick search for demo/preview
    executeSearch({ category: 'bookshops', area: 'Kurunegala' });
  }, []);

  return (
    <LeadContext.Provider
      value={{
        activeTab,
        setActiveTab,
        viewMode,
        setViewMode,
        leads,
        filteredLeads,
        loading,
        searchMeta,
        lastSearchQuery,
        dashboardStats,
        apiConfig,
        filters,
        setFilters,
        selectedLeadId,
        setSelectedLeadId,
        hoveredLeadId,
        setHoveredLeadId,
        pitchModalLead,
        setPitchModalLead,
        detailsModalLead,
        setDetailsModalLead,
        isSettingsOpen,
        setIsSettingsOpen,
        selectedLeadIds,
        toggleSelectLead,
        selectAllFilteredLeads,
        executeSearch,
        changeLeadStatus,
        saveLeadNotes,
        saveFollowUpDate,
        removeLead,
        handleBulkStatusChange,
        handleBulkDelete,
        fetchAllLeads,
        refreshDashboard,
        refreshApiConfig,
        toast,
        showToast,
      }}
    >
      {children}
    </LeadContext.Provider>
  );
}

export function useLeads() {
  return useContext(LeadContext);
}
