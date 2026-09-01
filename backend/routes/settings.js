const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * @route   GET /api/settings/status
 * @desc    Get API key status and server configuration
 */
router.get('/status', (req, res) => {
  const hasServerKey = Boolean(
    process.env.GOOGLE_MAPS_SERVER_API_KEY &&
    process.env.GOOGLE_MAPS_SERVER_API_KEY.trim() !== '' &&
    process.env.GOOGLE_MAPS_SERVER_API_KEY !== 'your_google_maps_server_api_key_here'
  );

  const hasBrowserKey = Boolean(
    process.env.GOOGLE_MAPS_BROWSER_API_KEY &&
    process.env.GOOGLE_MAPS_BROWSER_API_KEY.trim() !== '' &&
    process.env.GOOGLE_MAPS_BROWSER_API_KEY !== 'your_google_maps_browser_api_key_here'
  );

  res.json({
    success: true,
    data: {
      hasServerKey,
      hasBrowserKey,
      browserKey: hasBrowserKey ? process.env.GOOGLE_MAPS_BROWSER_API_KEY : '',
      mode: hasServerKey ? 'Live Google Places API' : 'Places Simulation Engine (Instant Ready)',
      useMockFallback: process.env.USE_MOCK_FALLBACK === 'true' || !process.env.USE_MOCK_FALLBACK
    }
  });
});

/**
 * @route   POST /api/settings/test-key
 * @desc    Test Google Places API Key validity
 */
router.post('/test-key', async (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey) {
      return res.status(400).json({ success: false, error: 'Please provide an API key to test.' });
    }

    const testUrl = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
    const resp = await axios.get(testUrl, {
      params: {
        query: 'cafe in London',
        key: apiKey
      },
      timeout: 5000
    });

    if (resp.data.status === 'OK' || resp.data.status === 'ZERO_RESULTS') {
      return res.json({ success: true, message: 'Google Places API Key is valid and functional!' });
    } else {
      return res.status(400).json({
        success: false,
        error: `Google API responded with status: ${resp.data.status}. ${resp.data.error_message || ''}`
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: `Connection to Google Places API failed: ${err.message}`
    });
  }
});

module.exports = router;
