const express = require('express');
const router = express.Router();
const Business = require('../models/Business');
const SearchHistory = require('../models/SearchHistory');
const { optionalAuth } = require('../middleware/auth');

/**
 * @route   GET /api/analytics/dashboard
 * @desc    Get aggregated stats: total leads, no website %, pipeline stage breakdown, top areas, recent searches
 */
router.get('/dashboard', optionalAuth, async (req, res) => {
  try {
    const [
      totalCount,
      noWebsiteCount,
      hasWebsiteCount,
      statusCounts,
      topAreas,
      topCategories,
      recentSearches,
      followUpsDue
    ] = await Promise.all([
      Business.countDocuments({}),
      Business.countDocuments({ hasWebsite: false }),
      Business.countDocuments({ hasWebsite: true }),
      Business.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Business.aggregate([
        { $group: { _id: '$searchArea', count: { $sum: 1 }, noWebsites: { $sum: { $cond: [{ $eq: ['$hasWebsite', false] }, 1, 0] } } } },
        { $sort: { count: -1 } },
        { $limit: 8 }
      ]),
      Business.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 }, noWebsites: { $sum: { $cond: [{ $eq: ['$hasWebsite', false] }, 1, 0] } } } },
        { $sort: { count: -1 } },
        { $limit: 8 }
      ]),
      SearchHistory.find({}).sort({ searchedAt: -1 }).limit(6),
      Business.countDocuments({
        followUpDate: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lte: new Date(new Date().setHours(23, 59, 59, 999))
        }
      })
    ]);

    // Format status breakdown
    const statusMap = {
      not_contacted: 0,
      contacted: 0,
      interested: 0,
      follow_up: 0,
      converted: 0,
      not_interested: 0
    };
    statusCounts.forEach(s => {
      if (s._id && statusMap[s._id] !== undefined) {
        statusMap[s._id] = s.count;
      }
    });

    const contactedTotal = statusMap.contacted + statusMap.interested + statusMap.follow_up + statusMap.converted + statusMap.not_interested;
    const outreachRate = totalCount > 0 ? Number(((contactedTotal / totalCount) * 100).toFixed(1)) : 0;
    const conversionRate = contactedTotal > 0 ? Number(((statusMap.converted / contactedTotal) * 100).toFixed(1)) : 0;
    const noWebsiteRate = totalCount > 0 ? Number(((noWebsiteCount / totalCount) * 100).toFixed(1)) : 0;

    res.json({
      success: true,
      data: {
        summary: {
          totalLeads: totalCount,
          noWebsiteCount,
          hasWebsiteCount,
          noWebsiteRate,
          contactedTotal,
          outreachRate,
          conversionRate,
          convertedCount: statusMap.converted,
          followUpsDue
        },
        pipeline: statusMap,
        topAreas: topAreas.map(a => ({ area: a._id || 'Unknown', count: a.count, noWebsites: a.noWebsites })),
        topCategories: topCategories.map(c => ({ category: c._id || 'General', count: c.count, noWebsites: c.noWebsites })),
        recentSearches: recentSearches.map(s => ({
          id: s._id,
          category: s.category,
          area: s.area,
          totalFound: s.totalFound,
          noWebsiteCount: s.noWebsiteCount,
          searchedAt: s.searchedAt
        }))
      }
    });
  } catch (err) {
    console.error('Error fetching dashboard analytics:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve analytics.' });
  }
});

module.exports = router;
