const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * @route   GET /api/settings/status
 * @desc    Get engine status — now using OpenStreetMap (no API key required)
 */
router.get('/status', async (req, res) => {
  // Test Nominatim reachability quickly
  let osmReachable = false;
  try {
    const resp = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: { q: 'London', format: 'json', limit: 1 },
      headers: { 'User-Agent': 'WebsiteScout/1.0 (status-check)' },
      timeout: 4000,
    });
    osmReachable = Array.isArray(resp.data) && resp.data.length > 0;
  } catch (_) {
    osmReachable = false;
  }

  res.json({
    success: true,
    data: {
      // Legacy fields kept for frontend compatibility
      hasServerKey: true,   // OSM is always "available" — no key needed
      hasBrowserKey: false,
      browserKey: '',
      mode: osmReachable
        ? 'Live OpenStreetMap (Nominatim + Overpass API)'
        : 'Places Simulation Engine (OSM unreachable)',
      osmReachable,
      useMockFallback: !osmReachable,
      provider: 'openstreetmap',
    },
  });
});

/**
 * @route   POST /api/settings/test-key
 * @desc    Test Nominatim / Overpass connectivity (no key needed — just connectivity check)
 */
router.post('/test-key', async (req, res) => {
  // Since we use OSM, we simply verify Nominatim is reachable
  try {
    const resp = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: { q: 'cafe in London', format: 'json', limit: 1 },
      headers: { 'User-Agent': 'WebsiteScout/1.0 (connectivity-test)' },
      timeout: 6000,
    });

    if (Array.isArray(resp.data) && resp.data.length >= 0) {
      return res.json({
        success: true,
        message: 'OpenStreetMap (Nominatim) is reachable! No API key required — you are ready to scout.',
      });
    }
    return res.status(400).json({ success: false, error: 'Nominatim returned an unexpected response.' });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: `Cannot reach OpenStreetMap Nominatim: ${err.message}`,
    });
  }
});

module.exports = router;
