const axios = require('axios');
const Business = require('../models/Business');

// Known city centroids for realistic mock simulation
const CITY_CENTROIDS = {
  kurunegala: { lat: 7.4863, lng: 80.3623, country: 'LK', phonePrefix: '+94 37' },
  colombo: { lat: 6.9271, lng: 79.8612, country: 'LK', phonePrefix: '+94 11' },
  kandy: { lat: 7.2906, lng: 80.6337, country: 'LK', phonePrefix: '+94 81' },
  galle: { lat: 6.0535, lng: 80.2210, country: 'LK', phonePrefix: '+94 91' },
  london: { lat: 51.5074, lng: -0.1278, country: 'GB', phonePrefix: '+44 20' },
  'new york': { lat: 40.7128, lng: -74.0060, country: 'US', phonePrefix: '+1 212' },
  austin: { lat: 30.2672, lng: -97.7431, country: 'US', phonePrefix: '+1 512' },
  sydney: { lat: -33.8688, lng: 151.2093, country: 'AU', phonePrefix: '+61 2' },
  toronto: { lat: 43.6532, lng: -79.3832, country: 'CA', phonePrefix: '+1 416' },
  dubai: { lat: 25.2048, lng: 55.2708, country: 'AE', phonePrefix: '+971 4' },
  singapore: { lat: 1.3521, lng: 103.8198, country: 'SG', phonePrefix: '+65 6' },
  berlin: { lat: 52.5200, lng: 13.4050, country: 'DE', phonePrefix: '+49 30' },
  paris: { lat: 48.8566, lng: 2.3522, country: 'FR', phonePrefix: '+33 1' },
  tokyo: { lat: 35.6762, lng: 139.6503, country: 'JP', phonePrefix: '+81 3' },
  bangalore: { lat: 12.9716, lng: 77.5946, country: 'IN', phonePrefix: '+91 80' },
  mumbai: { lat: 19.0760, lng: 72.8777, country: 'IN', phonePrefix: '+91 22' },
};

// Deterministic pseudo-random coordinate generator for any arbitrary town/area
function getCoordinatesForArea(area) {
  const normalized = (area || '').toLowerCase().trim();
  for (const [city, data] of Object.entries(CITY_CENTROIDS)) {
    if (normalized.includes(city) || city.includes(normalized)) {
      return data;
    }
  }

  // Hash the area string to generate consistent coordinates in a plausible range
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash << 5) - hash + normalized.charCodeAt(i);
    hash |= 0;
  }
  const lat = 6.5 + (Math.abs(hash % 1000) / 1000) * 45.0; // Between 6.5 and 51.5
  const lng = -120.0 + (Math.abs((hash >> 3) % 2000) / 2000) * 240.0;
  return { lat, lng, country: 'GLOBAL', phonePrefix: '+1 555' };
}

/**
 * High-fidelity Mock Places Generator
 * Generates realistic businesses with realistic addresses, ratings, and phone numbers.
 * Designed to test the exact workflow: ~70% of businesses have NO website listed.
 */
function generateMockPlaces(category, area) {
  const geo = getCoordinatesForArea(area);
  const cleanCat = category.toLowerCase().trim();
  const titleCat = category.charAt(0).toUpperCase() + category.slice(1);
  const cleanArea = area.trim();

  const businessPrefixes = [
    'Royal', 'Apex', 'Premier', 'Golden', 'Heritage', 'Central', 'Express',
    'Modern', 'Greenline', 'Starlight', 'City Center', 'Grand', 'Pinnacle',
    'Classic', 'Metro', 'Urban', 'Silver Star', 'Sunlight', 'Elite', 'Omni'
  ];

  const categoryTemplates = {
    bookshop: ['Book Emporium', 'Books & Stationery', 'Readers Corner', 'Page Turners', 'Book Hub', 'Academic Book Depot', 'Publishers & Booksellers'],
    bookshops: ['Book Emporium', 'Books & Stationery', 'Readers Corner', 'Page Turners', 'Book Hub', 'Academic Book Depot', 'Publishers & Booksellers'],
    dentist: ['Dental Care Clinic', 'Family Dental Practice', 'Smile Dental Surgery', 'Advanced Oral Healthcare', 'Dental Studio', 'Orthodontic Center'],
    dentists: ['Dental Care Clinic', 'Family Dental Practice', 'Smile Dental Surgery', 'Advanced Oral Healthcare', 'Dental Studio', 'Orthodontic Center'],
    bakery: ['Artisan Bakery & Cafe', 'Pastry Shop', 'Fresh Crust Bakes', 'Golden Wheat Bakery', 'Sweet Treats & Buns', 'Morning Oven Bakery'],
    bakeries: ['Artisan Bakery & Cafe', 'Pastry Shop', 'Fresh Crust Bakes', 'Golden Wheat Bakery', 'Sweet Treats & Buns', 'Morning Oven Bakery'],
    plumber: ['Plumbing & Drainage', 'Emergency Plumbing Pros', 'Reliable Piping Services', 'Hydro Flow Plumbers', 'Sanitary & Pipe Works'],
    plumbers: ['Plumbing & Drainage', 'Emergency Plumbing Pros', 'Reliable Piping Services', 'Hydro Flow Plumbers', 'Sanitary & Pipe Works'],
    gym: ['Fitness & Crossfit Gym', 'Iron Strength Health Club', 'Pulse Fitness Studio', 'Powerhouse Training Gym', 'Flex Gym & Wellness'],
    gyms: ['Fitness & Crossfit Gym', 'Iron Strength Health Club', 'Pulse Fitness Studio', 'Powerhouse Training Gym', 'Flex Gym & Wellness'],
    restaurant: ['Diner & Bistro', 'Family Restaurant & Grill', 'Spice Garden Restaurant', 'Town Tavern', 'Authentic Food House', 'Cuisine Palace'],
    restaurants: ['Diner & Bistro', 'Family Restaurant & Grill', 'Spice Garden Restaurant', 'Town Tavern', 'Authentic Food House', 'Cuisine Palace'],
    salon: ['Hair & Beauty Studio', 'Luxe Salon & Spa', 'Classic Barber & Grooming', 'Glow Beauty Lounge', 'Chic Hair Salon'],
    salons: ['Hair & Beauty Studio', 'Luxe Salon & Spa', 'Classic Barber & Grooming', 'Glow Beauty Lounge', 'Chic Hair Salon'],
    'auto repair': ['Auto Garage & Mechanics', 'Precision Motors & Repair', 'Car Diagnostics Center', 'Engine & Brake Services', 'QuickFix Auto Care'],
    contractor: ['Building & Construction', 'Home Renovations & Builders', 'Solid Ground Contractors', 'Master Craftsman Builders']
  };

  const templates = categoryTemplates[cleanCat] || [
    `${titleCat} Services`, `${titleCat} Hub`, `${titleCat} Solutions`, `${titleCat} Center`, `${titleCat} Works`, `${titleCat} Studio`
  ];

  const streetNames = [
    'Main Street', 'Commercial Road', 'Market Street', 'Hospital Road', 'Station Road',
    'High Street', 'Victoria Lane', 'Broadway Avenue', 'North Circular Road', 'Kingsway Ave',
    'Temple Road', 'Lake View Drive', 'Church Street', 'Park Avenue', 'Industrial Zone Road'
  ];

  const results = [];
  const count = 16; // Return 16 realistic results

  for (let i = 0; i < count; i++) {
    const prefix = businessPrefixes[i % businessPrefixes.length];
    const suffix = templates[i % templates.length];
    const name = `${prefix} ${suffix}`;
    const street = streetNames[i % streetNames.length];
    const buildingNo = (i + 1) * 12 + ((i * 7) % 31);
    const address = `${buildingNo}, ${street}, ${cleanArea}`;
    
    // Spread coordinates slightly around the area centroid (+- 0.035 deg ~ 3-4km)
    const angle = (i / count) * 2 * Math.PI + 0.3;
    const distance = 0.005 + (Math.sin(i * 3.7) * 0.02);
    const lat = Number((geo.lat + Math.cos(angle) * distance).toFixed(6));
    const lng = Number((geo.lng + Math.sin(angle) * distance).toFixed(6));

    // 70% of businesses have NO website; 30% have a website
    const hasWebsite = (i % 4 === 0);
    const websiteUrl = hasWebsite ? `https://www.${prefix.toLowerCase()}${cleanCat.replace(/\s+/g, '')}.com` : null;

    const phoneRand = Math.floor(100000 + (Math.sin(i + 1) * 899999 + 899999) % 900000);
    const phone = `${geo.phonePrefix} ${phoneRand}`;

    const rating = Number((3.6 + ((i * 1.3) % 1.4)).toFixed(1));
    const totalRatings = Math.floor(12 + ((i * 37) % 240));

    // Create stable pseudo place_id based on name and area
    const placeId = `sim_place_${Buffer.from(`${name}_${cleanArea}`).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 24)}`;

    results.push({
      placeId,
      name,
      category: titleCat,
      searchArea: cleanArea,
      address,
      phone,
      location: { lat, lng },
      hasWebsite,
      websiteUrl,
      rating,
      totalRatings,
      businessStatus: 'OPERATIONAL',
      isSimulated: true
    });
  }

  return results;
}

/**
 * Searches Google Places API (Text Search) + Place Details
 * or falls back to realistic simulation engine if API key is not present.
 */
async function searchPlaces({ category, area, bypassCache = false, apiKey = null }) {
  const serverKey = apiKey || process.env.GOOGLE_MAPS_SERVER_API_KEY;
  const cleanCat = category.trim();
  const cleanArea = area.trim();

  console.log(`🔍 Scouting businesses for: "${cleanCat}" in "${cleanArea}"...`);

  // 1. Check DB Cache if not bypassed (within 30 days)
  const THIRTY_DAYS_AGO = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  if (!bypassCache) {
    const cachedBusinesses = await Business.find({
      searchArea: { $regex: new RegExp(`^${cleanArea}$`, 'i') },
      category: { $regex: new RegExp(`^${cleanCat}$`, 'i') },
      lastFetchedAt: { $gte: THIRTY_DAYS_AGO }
    }).sort({ rating: -1 });

    if (cachedBusinesses.length > 0) {
      console.log(`⚡ Retrieved ${cachedBusinesses.length} cached leads from database.`);
      return {
        source: 'cache',
        count: cachedBusinesses.length,
        noWebsiteCount: cachedBusinesses.filter(b => !b.hasWebsite).length,
        results: cachedBusinesses
      };
    }
  }

  // 2. If no valid Google API Key or mock mode requested, use realistic simulator
  if (!serverKey || serverKey.trim() === '' || serverKey === 'your_google_maps_server_api_key_here') {
    console.log(`ℹ️ No GOOGLE_MAPS_SERVER_API_KEY detected. Using intelligent Places Simulation Engine.`);
    const mockResults = generateMockPlaces(cleanCat, cleanArea);

    const savedBusinesses = [];
    for (const item of mockResults) {
      // Upsert into DB without overwriting user's pipeline status if already existing
      const existing = await Business.findOne({ placeId: item.placeId });
      if (existing) {
        existing.lastFetchedAt = new Date();
        existing.address = item.address || existing.address;
        existing.phone = item.phone || existing.phone;
        existing.rating = item.rating || existing.rating;
        existing.totalRatings = item.totalRatings || existing.totalRatings;
        existing.hasWebsite = item.hasWebsite;
        existing.websiteUrl = item.websiteUrl;
        await existing.save();
        savedBusinesses.push(existing);
      } else {
        const created = await Business.create({
          ...item,
          status: 'not_contacted',
          lastFetchedAt: new Date()
        });
        savedBusinesses.push(created);
      }
    }

    return {
      source: 'simulation',
      count: savedBusinesses.length,
      noWebsiteCount: savedBusinesses.filter(b => !b.hasWebsite).length,
      results: savedBusinesses
    };
  }

  // 3. Live Google Places API Search
  try {
    const query = `${cleanCat} in ${cleanArea}`;
    const textSearchUrl = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
    
    const textSearchResp = await axios.get(textSearchUrl, {
      params: {
        query,
        key: serverKey
      },
      timeout: 10000
    });

    if (textSearchResp.data.status !== 'OK' && textSearchResp.data.status !== 'ZERO_RESULTS') {
      console.warn(`Google Places API returned status: ${textSearchResp.data.status} (${textSearchResp.data.error_message || 'No error message'})`);
      if (process.env.USE_MOCK_FALLBACK === 'true' || !process.env.USE_MOCK_FALLBACK) {
        console.log('🔄 Falling back to simulation engine...');
        const mockResults = generateMockPlaces(cleanCat, cleanArea);
        const saved = [];
        for (const item of mockResults) {
          const doc = await Business.findOneAndUpdate(
            { placeId: item.placeId },
            { $set: { ...item, lastFetchedAt: new Date() } },
            { upsert: true, new: true }
          );
          saved.push(doc);
        }
        return {
          source: 'simulation_fallback',
          count: saved.length,
          noWebsiteCount: saved.filter(b => !b.hasWebsite).length,
          results: saved
        };
      }
      throw new Error(`Google Places API error: ${textSearchResp.data.status} - ${textSearchResp.data.error_message || ''}`);
    }

    const places = textSearchResp.data.results || [];
    console.log(`📍 Found ${places.length} places from Google Text Search. Checking website details...`);

    const processedLeads = [];

    // For each place, fetch details to check website presence
    // Limit to top 20 to balance rate limits and speed
    for (const place of places.slice(0, 20)) {
      try {
        const detailsUrl = 'https://maps.googleapis.com/maps/api/place/details/json';
        const detailsResp = await axios.get(detailsUrl, {
          params: {
            place_id: place.place_id,
            fields: 'name,formatted_address,formatted_phone_number,website,geometry,rating,user_ratings_total,business_status',
            key: serverKey
          },
          timeout: 7000
        });

        const details = detailsResp.data.result || {};
        const website = details.website || null;
        const hasWebsite = Boolean(website && website.trim() !== '');

        const businessData = {
          placeId: place.place_id,
          name: details.name || place.name,
          category: cleanCat,
          searchArea: cleanArea,
          address: details.formatted_address || place.formatted_address || '',
          phone: details.formatted_phone_number || '',
          location: {
            lat: details.geometry?.location?.lat || place.geometry?.location?.lat || 0,
            lng: details.geometry?.location?.lng || place.geometry?.location?.lng || 0,
          },
          hasWebsite,
          websiteUrl: website,
          rating: details.rating || place.rating || 0,
          totalRatings: details.user_ratings_total || place.user_ratings_total || 0,
          businessStatus: details.business_status || place.business_status || 'OPERATIONAL',
          lastFetchedAt: new Date()
        };

        // Upsert in DB while preserving existing lead status & notes
        const existing = await Business.findOne({ placeId: place.place_id });
        if (existing) {
          existing.lastFetchedAt = new Date();
          existing.address = businessData.address || existing.address;
          existing.phone = businessData.phone || existing.phone;
          existing.rating = businessData.rating;
          existing.totalRatings = businessData.totalRatings;
          existing.hasWebsite = businessData.hasWebsite;
          existing.websiteUrl = businessData.websiteUrl;
          await existing.save();
          processedLeads.push(existing);
        } else {
          const created = await Business.create(businessData);
          processedLeads.push(created);
        }
      } catch (detailErr) {
        console.error(`Failed to fetch details for place ${place.place_id}:`, detailErr.message);
      }
    }

    return {
      source: 'google_places_api',
      count: processedLeads.length,
      noWebsiteCount: processedLeads.filter(b => !b.hasWebsite).length,
      results: processedLeads
    };
  } catch (apiErr) {
    console.error('Google Places Search failed:', apiErr.message);
    // Fallback if network or quota issue
    const mockResults = generateMockPlaces(cleanCat, cleanArea);
    const saved = [];
    for (const item of mockResults) {
      const doc = await Business.findOneAndUpdate(
        { placeId: item.placeId },
        { $set: { ...item, lastFetchedAt: new Date() } },
        { upsert: true, new: true }
      );
      saved.push(doc);
    }
    return {
      source: 'simulation_fallback',
      count: saved.length,
      noWebsiteCount: saved.filter(b => !b.hasWebsite).length,
      results: saved
    };
  }
}

module.exports = { searchPlaces, generateMockPlaces, getCoordinatesForArea };
