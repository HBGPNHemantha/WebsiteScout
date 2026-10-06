const axios = require('axios');
const Business = require('../models/Business');

// Known city centroids for mock simulation fallback
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

// Map common category names to OSM amenity/shop/leisure/craft tags
const CATEGORY_TO_OSM = {
  restaurant: [{ k: 'amenity', v: 'restaurant' }, { k: 'amenity', v: 'fast_food' }],
  restaurants: [{ k: 'amenity', v: 'restaurant' }, { k: 'amenity', v: 'fast_food' }],
  cafe: [{ k: 'amenity', v: 'cafe' }],
  cafes: [{ k: 'amenity', v: 'cafe' }],
  bakery: [{ k: 'shop', v: 'bakery' }],
  bakeries: [{ k: 'shop', v: 'bakery' }],
  bookshop: [{ k: 'shop', v: 'books' }],
  bookshops: [{ k: 'shop', v: 'books' }],
  dentist: [{ k: 'amenity', v: 'dentist' }],
  dentists: [{ k: 'amenity', v: 'dentist' }],
  pharmacy: [{ k: 'amenity', v: 'pharmacy' }],
  pharmacies: [{ k: 'amenity', v: 'pharmacy' }],
  gym: [{ k: 'leisure', v: 'fitness_centre' }, { k: 'leisure', v: 'sports_centre' }],
  gyms: [{ k: 'leisure', v: 'fitness_centre' }, { k: 'leisure', v: 'sports_centre' }],
  salon: [{ k: 'shop', v: 'hairdresser' }, { k: 'shop', v: 'beauty' }],
  salons: [{ k: 'shop', v: 'hairdresser' }, { k: 'shop', v: 'beauty' }],
  hotel: [{ k: 'tourism', v: 'hotel' }],
  hotels: [{ k: 'tourism', v: 'hotel' }],
  supermarket: [{ k: 'shop', v: 'supermarket' }],
  supermarkets: [{ k: 'shop', v: 'supermarket' }],
  hospital: [{ k: 'amenity', v: 'hospital' }],
  hospitals: [{ k: 'amenity', v: 'hospital' }],
  school: [{ k: 'amenity', v: 'school' }],
  schools: [{ k: 'amenity', v: 'school' }],
  bank: [{ k: 'amenity', v: 'bank' }],
  banks: [{ k: 'amenity', v: 'bank' }],
  garage: [{ k: 'shop', v: 'car_repair' }, { k: 'amenity', v: 'fuel' }],
  'auto repair': [{ k: 'shop', v: 'car_repair' }],
  plumber: [{ k: 'craft', v: 'plumber' }],
  plumbers: [{ k: 'craft', v: 'plumber' }],
  contractor: [{ k: 'craft', v: 'construction' }, { k: 'craft', v: 'carpenter' }],
};

/**
 * Geocode an area name to lat/lng using Nominatim (OpenStreetMap) — free, no API key needed.
 */
async function geocodeArea(area) {
  const normalized = (area || '').toLowerCase().trim();

  // Fast path: check known city centroids first
  for (const [city, data] of Object.entries(CITY_CENTROIDS)) {
    if (normalized.includes(city) || city.includes(normalized)) {
      console.log(`📍 Matched known city centroid for "${area}": ${data.lat}, ${data.lng}`);
      return data;
    }
  }

  // Call Nominatim
  try {
    const resp = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: { q: area, format: 'json', limit: 1, addressdetails: 1 },
      headers: { 'User-Agent': 'WebsiteScout/1.0 (lead-scouting-app)' },
      timeout: 8000,
    });

    if (resp.data && resp.data.length > 0) {
      const r = resp.data[0];
      const lat = parseFloat(r.lat);
      const lng = parseFloat(r.lon);
      const country = r.address?.country_code?.toUpperCase() || 'GLOBAL';
      console.log(`🌍 Nominatim geocoded "${area}" → lat=${lat}, lng=${lng} (${country})`);
      return { lat, lng, country, phonePrefix: '+1 555' };
    }
  } catch (err) {
    console.warn(`⚠️  Nominatim geocoding failed for "${area}":`, err.message);
  }

  // Hash-based deterministic fallback
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash << 5) - hash + normalized.charCodeAt(i);
    hash |= 0;
  }
  const lat = 6.5 + (Math.abs(hash % 1000) / 1000) * 45.0;
  const lng = -120.0 + (Math.abs((hash >> 3) % 2000) / 2000) * 240.0;
  console.warn(`🔁 Hash-based fallback coordinates for "${area}": ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
  return { lat, lng, country: 'GLOBAL', phonePrefix: '+1 555' };
}

/**
 * Build an Overpass QL query for given OSM tags within a radius.
 */
function buildOverpassQuery(tags, lat, lng, radiusMeters = 6000) {
  const tagFilters = tags
    .map(({ k, v }) =>
      `node["${k}"="${v}"](around:${radiusMeters},${lat},${lng});\nway["${k}"="${v}"](around:${radiusMeters},${lat},${lng});`
    )
    .join('\n');

  return `[out:json][timeout:25];\n(\n${tagFilters}\n);\nout center 40;`;
}

/**
 * Fetch businesses from the Overpass API (OpenStreetMap) — free, no API key needed.
 */
async function fetchFromOverpass(category, lat, lng) {
  const cleanCat = category.toLowerCase().trim();
  const knownTags = CATEGORY_TO_OSM[cleanCat];

  const usedTags = knownTags || [
    { k: 'amenity', v: cleanCat },
    { k: 'shop', v: cleanCat },
    { k: 'leisure', v: cleanCat },
    { k: 'craft', v: cleanCat },
  ];

  const query = buildOverpassQuery(usedTags, lat, lng);

  try {
    const resp = await axios.post(
      'https://overpass-api.de/api/interpreter',
      `data=${encodeURIComponent(query)}`,
      {
        headers: {
          'User-Agent': 'WebsiteScout/1.0 (contact@yourdomain.com)',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        timeout: 20000,
      }
    );

    const elements = resp.data?.elements || [];
    console.log(`📡 Overpass API returned ${elements.length} elements for "${category}"`);
    return elements;
  } catch (err) {
    console.warn('⚠️  Overpass API failed:', err.message);
    return [];
  }
}

/**
 * Convert a raw Overpass element to a WebsiteScout business object.
 */
function elementToBusiness(el, category, searchArea, index) {
  const tags = el.tags || {};
  const lat = el.lat ?? el.center?.lat ?? null;
  const lng = el.lon ?? el.center?.lon ?? null;
  if (!lat || !lng) return null;

  const name = tags.name || tags['name:en'] || `${category} ${index + 1}`;
  const phone = tags.phone || tags['contact:phone'] || tags['phone:mobile'] || '';
  const website = tags.website || tags['contact:website'] || tags['url'] || null;
  const hasWebsite = Boolean(website && website.trim() !== '');

  const addrParts = [
    tags['addr:housenumber'],
    tags['addr:street'],
    tags['addr:suburb'],
    tags['addr:city'] || searchArea,
  ].filter(Boolean);
  const address = addrParts.length > 1 ? addrParts.join(', ') : `${name}, ${searchArea}`;

  return {
    placeId: `osm_${el.type}_${el.id}`,
    name,
    category: category.charAt(0).toUpperCase() + category.slice(1),
    searchArea,
    address,
    phone,
    location: { lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) },
    hasWebsite,
    websiteUrl: website,
    rating: parseFloat((3.5 + ((index * 1.3) % 1.5)).toFixed(1)),
    totalRatings: Math.floor(10 + ((index * 37) % 250)),
    businessStatus: 'OPERATIONAL',
    isSimulated: false,
  };
}

/**
 * High-fidelity simulation engine (offline fallback, zero network required).
 */
function generateMockPlaces(category, area) {
  const normalized = area.toLowerCase().trim();
  let geo = null;
  for (const [city, data] of Object.entries(CITY_CENTROIDS)) {
    if (normalized.includes(city) || city.includes(normalized)) {
      geo = data;
      break;
    }
  }
  if (!geo) {
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
      hash = (hash << 5) - hash + normalized.charCodeAt(i);
      hash |= 0;
    }
    geo = {
      lat: 6.5 + (Math.abs(hash % 1000) / 1000) * 45.0,
      lng: -120.0 + (Math.abs((hash >> 3) % 2000) / 2000) * 240.0,
      country: 'GLOBAL',
      phonePrefix: '+1 555',
    };
  }

  const cleanCat = category.toLowerCase().trim();
  const titleCat = category.charAt(0).toUpperCase() + category.slice(1);

  const businessPrefixes = [
    'Royal', 'Apex', 'Premier', 'Golden', 'Heritage', 'Central', 'Express',
    'Modern', 'Greenline', 'Starlight', 'City Center', 'Grand', 'Pinnacle',
    'Classic', 'Metro', 'Urban', 'Silver Star', 'Sunlight', 'Elite', 'Omni',
  ];

  const categoryTemplates = {
    bookshop: ['Book Emporium', 'Books & Stationery', 'Readers Corner', 'Page Turners', 'Book Hub', 'Academic Book Depot'],
    bookshops: ['Book Emporium', 'Books & Stationery', 'Readers Corner', 'Page Turners', 'Book Hub', 'Academic Book Depot'],
    dentist: ['Dental Care Clinic', 'Family Dental Practice', 'Smile Dental Surgery', 'Advanced Oral Healthcare', 'Dental Studio'],
    dentists: ['Dental Care Clinic', 'Family Dental Practice', 'Smile Dental Surgery', 'Advanced Oral Healthcare', 'Dental Studio'],
    bakery: ['Artisan Bakery & Cafe', 'Pastry Shop', 'Fresh Crust Bakes', 'Golden Wheat Bakery', 'Sweet Treats & Buns'],
    bakeries: ['Artisan Bakery & Cafe', 'Pastry Shop', 'Fresh Crust Bakes', 'Golden Wheat Bakery', 'Sweet Treats & Buns'],
    plumber: ['Plumbing & Drainage', 'Emergency Plumbing Pros', 'Reliable Piping Services', 'Hydro Flow Plumbers'],
    plumbers: ['Plumbing & Drainage', 'Emergency Plumbing Pros', 'Reliable Piping Services', 'Hydro Flow Plumbers'],
    gym: ['Fitness & Crossfit Gym', 'Iron Strength Health Club', 'Pulse Fitness Studio', 'Powerhouse Training Gym'],
    gyms: ['Fitness & Crossfit Gym', 'Iron Strength Health Club', 'Pulse Fitness Studio', 'Powerhouse Training Gym'],
    restaurant: ['Diner & Bistro', 'Family Restaurant & Grill', 'Spice Garden Restaurant', 'Town Tavern', 'Authentic Food House'],
    restaurants: ['Diner & Bistro', 'Family Restaurant & Grill', 'Spice Garden Restaurant', 'Town Tavern', 'Authentic Food House'],
    salon: ['Hair & Beauty Studio', 'Luxe Salon & Spa', 'Classic Barber & Grooming', 'Glow Beauty Lounge'],
    salons: ['Hair & Beauty Studio', 'Luxe Salon & Spa', 'Classic Barber & Grooming', 'Glow Beauty Lounge'],
    'auto repair': ['Auto Garage & Mechanics', 'Precision Motors & Repair', 'Car Diagnostics Center', 'Engine & Brake Services'],
    contractor: ['Building & Construction', 'Home Renovations & Builders', 'Solid Ground Contractors'],
  };

  const templates = categoryTemplates[cleanCat] || [
    `${titleCat} Services`, `${titleCat} Hub`, `${titleCat} Solutions`, `${titleCat} Center`,
  ];

  const streetNames = [
    'Main Street', 'Commercial Road', 'Market Street', 'Hospital Road', 'Station Road',
    'High Street', 'Victoria Lane', 'Broadway Avenue', 'North Circular Road', 'Temple Road',
    'Lake View Drive', 'Church Street', 'Park Avenue', 'Industrial Zone Road',
  ];

  const count = 16;
  const results = [];

  for (let i = 0; i < count; i++) {
    const prefix = businessPrefixes[i % businessPrefixes.length];
    const suffix = templates[i % templates.length];
    const name = `${prefix} ${suffix}`;
    const street = streetNames[i % streetNames.length];
    const buildingNo = (i + 1) * 12 + ((i * 7) % 31);
    const address = `${buildingNo}, ${street}, ${area.trim()}`;

    const angle = (i / count) * 2 * Math.PI + 0.3;
    const distance = 0.005 + (Math.sin(i * 3.7) * 0.02);
    const lat = Number((geo.lat + Math.cos(angle) * distance).toFixed(6));
    const lng = Number((geo.lng + Math.sin(angle) * distance).toFixed(6));

    const hasWebsite = (i % 4 === 0);
    const websiteUrl = hasWebsite
      ? `https://www.${prefix.toLowerCase()}${cleanCat.replace(/\s+/g, '')}.com`
      : null;

    const phoneRand = Math.floor(100000 + (Math.sin(i + 1) * 899999 + 899999) % 900000);
    const phone = `${geo.phonePrefix} ${phoneRand}`;
    const rating = Number((3.6 + ((i * 1.3) % 1.4)).toFixed(1));
    const totalRatings = Math.floor(12 + ((i * 37) % 240));
    const placeId = `sim_place_${Buffer.from(`${name}_${area.trim()}`).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 24)}`;

    results.push({
      placeId, name, category: titleCat, searchArea: area.trim(), address, phone,
      location: { lat, lng }, hasWebsite, websiteUrl, rating, totalRatings,
      businessStatus: 'OPERATIONAL', isSimulated: true,
    });
  }

  return results;
}

/**
 * Main entry point — uses Nominatim (geocoding) + Overpass API (business data).
 * Completely free, no Google API key required.
 * Falls back to simulation engine if Overpass returns no results.
 */
async function searchPlaces({ category, area, bypassCache = false }) {
  const cleanCat = category.trim();
  const cleanArea = area.trim();

  console.log(`🔍 Scouting: "${cleanCat}" in "${cleanArea}" via OpenStreetMap (Nominatim + Overpass)...`);

  // 1. DB cache check (30 days)
  const THIRTY_DAYS_AGO = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  if (!bypassCache) {
    const cached = await Business.find({
      searchArea: { $regex: new RegExp(`^${cleanArea}$`, 'i') },
      category: { $regex: new RegExp(`^${cleanCat}$`, 'i') },
      lastFetchedAt: { $gte: THIRTY_DAYS_AGO },
    }).sort({ rating: -1 });

    if (cached.length > 0) {
      console.log(`⚡ ${cached.length} cached leads returned from DB.`);
      return {
        source: 'cache',
        count: cached.length,
        noWebsiteCount: cached.filter((b) => !b.hasWebsite).length,
        results: cached,
      };
    }
  }

  // 2. Geocode area with Nominatim
  const geo = await geocodeArea(cleanArea);

  // 3. Query Overpass API
  const elements = await fetchFromOverpass(cleanCat, geo.lat, geo.lng);

  // 4. Process OSM results — bulkWrite for atomic, high-performance DB upsert
  if (elements.length > 0) {
    const bizList = elements
      .map((el, i) => elementToBusiness(el, cleanCat, cleanArea, i))
      .filter(Boolean);

    if (bizList.length > 0) {
      const operations = bizList.map((biz) => ({
        updateOne: {
          filter: { placeId: biz.placeId },
          update: {
            $set: {
              name: biz.name,
              category: biz.category,
              searchArea: biz.searchArea,
              address: biz.address,
              phone: biz.phone,
              location: biz.location,
              hasWebsite: biz.hasWebsite,
              websiteUrl: biz.websiteUrl,
              rating: biz.rating,
              totalRatings: biz.totalRatings,
              businessStatus: biz.businessStatus,
              isSimulated: biz.isSimulated,
              lastFetchedAt: new Date(),
            },
            // Only set status on insert (don't overwrite user's pipeline status)
            $setOnInsert: { status: 'not_contacted' },
          },
          upsert: true,
        },
      }));

      await Business.bulkWrite(operations, { ordered: false });
    }

    // Fetch the freshly saved docs so we return full Mongoose documents
    const placeIds = bizList.map((b) => b.placeId);
    const processedLeads = await Business.find({ placeId: { $in: placeIds } });

    console.log(`✅ Saved ${processedLeads.length} OSM businesses via bulkWrite.`);
    return {
      source: 'openstreetmap_overpass',
      count: processedLeads.length,
      noWebsiteCount: processedLeads.filter((b) => !b.hasWebsite).length,
      results: processedLeads,
    };
  }

  // 5. Simulation fallback — bulkWrite for fast batch upsert
  console.log(`ℹ️  No OSM results for "${cleanCat}" in "${cleanArea}". Falling back to Simulation Engine.`);
  const mockResults = generateMockPlaces(cleanCat, cleanArea);

  const mockOperations = mockResults.map((item) => ({
    updateOne: {
      filter: { placeId: item.placeId },
      update: {
        $set: {
          ...item,
          lastFetchedAt: new Date(),
        },
        // Only set status on first insert — preserve user's pipeline status on update
        $setOnInsert: { status: 'not_contacted' },
      },
      upsert: true,
    },
  }));

  await Business.bulkWrite(mockOperations, { ordered: false });

  const placeIds = mockResults.map((r) => r.placeId);
  const savedBusinesses = await Business.find({ placeId: { $in: placeIds } });

  return {
    source: 'simulation',
    count: savedBusinesses.length,
    noWebsiteCount: savedBusinesses.filter((b) => !b.hasWebsite).length,
    results: savedBusinesses,
  };
}

module.exports = { searchPlaces, generateMockPlaces, geocodeArea };