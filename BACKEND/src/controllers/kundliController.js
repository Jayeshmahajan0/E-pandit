const axios = require('axios');

// OAuth Token Cache
let cachedToken = null;
let tokenExpiry = null;

// Helper to get Prokerala Access Token
const getProkeralaToken = async () => {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const clientId = process.env.PROKERALA_CLIENT_ID;
  const clientSecret = process.env.PROKERALA_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Prokerala API credentials missing in .env");
  }

  const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const res = await axios.post('https://api.prokerala.com/token', 
      'grant_type=client_credentials',
      { 
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${authString}`
        } 
      }
    );

    cachedToken = res.data.access_token;
    // Cache until 5 minutes before expiry
    tokenExpiry = Date.now() + ((res.data.expires_in - 300) * 1000);
    return cachedToken;
  } catch (error) {
    console.error("Prokerala Auth Error:", error.response?.data || error.message);
    throw new Error("Failed to authenticate with Astrology API");
  }
};

// Helper for Geocoding (Convert city name to lat,lng)
const geocodeLocation = async (locationStr, coordsStr) => {
  // If the frontend already provided coords from geolocation button
  if (coordsStr && coordsStr.includes(',')) {
    return coordsStr; // e.g. "28.6139,77.2090"
  }

  // Otherwise, use free Nominatim API to search city
  try {
    const res = await axios.get(`https://nominatim.openstreetmap.org/search`, {
      params: {
        q: locationStr,
        format: 'json',
        limit: 1
      },
      headers: { 'User-Agent': 'EPandit-AstroApp/1.0' }
    });

    if (res.data && res.data.length > 0) {
      return `${res.data[0].lat},${res.data[0].lon}`;
    }
  } catch (err) {
    console.error("Geocoding failed:", err.message);
  }

  // Fallback to Delhi coordinates if geocoding completely fails
  return "28.6139,77.2090"; 
};

// @desc    Generate Janam Kundli
// @route   POST /api/kundli/generate
// @access  Public
const generateKundli = async (req, res, next) => {
  try {
    const { name, dob, time, location, coordinates } = req.body;

    if (!name || !dob || !time || !location) {
      return res.status(400).json({ success: false, message: "Please provide all required fields." });
    }

    const token = await getProkeralaToken();
    const resolvedCoordinates = await geocodeLocation(location, coordinates);
    
    // Format datetime: Prokerala expects strict ISO8601 (e.g. 2024-01-01T10:30:00Z)
    // Assuming the user input is local time, we should append offset or Z. Using Z for standard API.
    const datetime = `${dob}T${time}:00Z`;

    // 1. Fetch Planet Positions (for the Kundali Chart)
    const planetsRes = await axios.get('https://api.prokerala.com/v2/astrology/planet-position', {
      params: { datetime, coordinates: resolvedCoordinates, ayanamsa: 1 },
      headers: { 'Authorization': `Bearer ${token}` }
    });

    // 2. Fetch Manglik Dosha
    const manglikRes = await axios.get('https://api.prokerala.com/v2/astrology/mangal-dosha', {
      params: { datetime, coordinates: resolvedCoordinates, ayanamsa: 1 },
      headers: { 'Authorization': `Bearer ${token}` }
    });

    // Extract Data
    const apiPlanets = planetsRes.data.data?.planet_position || []; 
    const manglikData = manglikRes.data.data;

    // The Prokerala planet_position array contains objects with name, id, position.house
    // We need to map this to an array of 12 arrays for our SVG Kundli Chart
    const planets_in_houses = Array.from({ length: 12 }, () => []);
    
    // Default Ascendant to 1 if we can't find it
    let ascendantSign = 1;
    let moonSign = "Unknown";
    let sunSign = "Unknown";

    // First find Ascendant sign
    if (apiPlanets && apiPlanets.length > 0) {
      const ascendant = apiPlanets.find(p => p.name.toLowerCase() === 'ascendant');
      if (ascendant && ascendant.position) {
        ascendantSign = ascendant.position;
      }
    }

    if (apiPlanets && apiPlanets.length > 0) {
      apiPlanets.forEach(p => {
        if (p.name.toLowerCase() !== 'ascendant') {
          // Calculate House Index: (Planet Sign - Ascendant Sign + 12) % 12
          if (p.position) {
            const houseIndex = (p.position - ascendantSign + 12) % 12;
            planets_in_houses[houseIndex].push(p.name);
          }

          if (p.name.toLowerCase() === 'moon') moonSign = p.rasi?.name || "Unknown";
          if (p.name.toLowerCase() === 'sun') sunSign = p.rasi?.name || "Unknown";
        }
      });
    }

    const responseData = {
      user: { name, dob, time, location },
      ascendant: ascendantSign,
      planets_in_houses: planets_in_houses,
      nakshatra: "PREMIUM_LOCKED",
      moon_sign: moonSign,
      sun_sign: sunSign,
      manglik_status: {
        is_manglik: manglikData?.has_dosha || false,
        type: manglikData?.has_dosha ? "Present" : "No Dosha",
        description: manglikData?.description || "Mangal Dosha check complete."
      },
      dasha: {
        major: "PREMIUM_LOCKED",
        minor: "PREMIUM_LOCKED",
        ends_at: "N/A"
      }
    };

    res.json({ success: true, data: responseData });

  } catch (error) {
    console.error("Kundli Generation Error:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: "Failed to generate astrology data." });
  }
};

// @desc    Match Making (Vivah Milan)
// @route   POST /api/kundli/match
// @access  Public
const matchKundli = async (req, res, next) => {
  try {
    const { boy, girl } = req.body;

    if (!boy || !girl) {
      return res.status(400).json({ success: false, message: "Please provide both boy and girl details." });
    }

    const token = await getProkeralaToken();
    
    const boyCoords = await geocodeLocation(boy.location, boy.coordinates);
    const girlCoords = await geocodeLocation(girl.location, girl.coordinates);

    const girlDatetime = `${girl.dob}T${girl.time}:00Z`;
    const boyDatetime = `${boy.dob}T${boy.time}:00Z`;

    // Fetch Ashtakoot Milan
    const matchRes = await axios.get('https://api.prokerala.com/v2/astrology/ashtakoot-milan', {
      params: { 
        girl_coordinates: girlCoords, 
        girl_datetime: girlDatetime,
        boy_coordinates: boyCoords,
        boy_datetime: boyDatetime,
        ayanamsa: 1
      },
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const apiMatch = matchRes.data.data; // Has .total_points, .maximum_points, .milan
    
    // Map API Ashtakoot array to our frontend object format
    const ashtakootScores = {};
    if (apiMatch?.milan) {
      apiMatch.milan.forEach(item => {
        // API returns objects like { koot: "varna", points: 1, max_points: 1 }
        ashtakootScores[item.koot.toLowerCase()] = {
          max: item.max_points,
          scored: item.points
        };
      });
    }

    let totalScore = apiMatch?.total_points || 0;
    
    let compatibility = "Average";
    let color = "text-orange-500";
    if (totalScore >= 25) { compatibility = "Excellent"; color = "text-sacred-green"; }
    else if (totalScore >= 18) { compatibility = "Good"; color = "text-primary"; }
    else if (totalScore < 18) { compatibility = "Not Recommended"; color = "text-destructive"; }

    const responseData = {
      profiles: { boy: boy.name, girl: girl.name },
      total_score: totalScore,
      max_score: 36,
      compatibility,
      color,
      ashtakoot: ashtakootScores,
      conclusion: apiMatch?.message || `The matched score is ${totalScore} out of 36. The match is considered ${compatibility}.`
    };

    res.json({ success: true, data: responseData });

  } catch (error) {
    console.error("Kundli Matching Error:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: "Failed to perform match making." });
  }
};

module.exports = {
  generateKundli,
  matchKundli
};
