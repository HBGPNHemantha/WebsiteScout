const express = require('express');
const router = express.Router();
const { searchPlaces } = require('../services/googlePlaces');
const SearchHistory = require('../models/SearchHistory');
const { optionalAuth } = require('../middleware/auth');

/**
 * @route   POST /api/search
 * @desc    Search businesses by category & location via Google Places, filter by website presence, and save to DB
 * @access  Public / Optional Auth
 */
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { category, area, bypassCache, apiKey } = req.body;

    if (!category || !area) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both category (e.g. "bookshops") and area (e.g. "Kurunegala").'
      });
    }

    const searchResult = await searchPlaces({
      category,
      area,
      bypassCache: Boolean(bypassCache),
      apiKey
    });

    // Record in search history
    try {
      await SearchHistory.create({
        category: category.trim(),
        area: area.trim(),
        totalFound: searchResult.count,
        noWebsiteCount: searchResult.noWebsiteCount,
        user: req.user ? req.user._id : null
      });
    } catch (historyErr) {
      console.warn('Failed to record search history:', historyErr.message);
    }

    return res.json({
      success: true,
      meta: {
        source: searchResult.source,
        totalFound: searchResult.count,
        noWebsiteCount: searchResult.noWebsiteCount,
        hasWebsiteCount: searchResult.count - searchResult.noWebsiteCount,
        category: category.trim(),
        area: area.trim()
      },
      data: searchResult.results
    });
  } catch (err) {
    console.error('Error during search endpoint execution:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Server error while executing business search.'
    });
  }
});

module.exports = router;
