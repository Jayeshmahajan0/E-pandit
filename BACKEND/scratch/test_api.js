const axios = require('axios');

async function testProkerala() {
  const clientId = "eaada0a8-2722-41c4-a1ef-c4e4e7b42817";
  const clientSecret = "tJGVCTG3hs27bwPoQFeVV7IX8YHQhpIUt8grG3oh";

  console.log("Testing Prokerala API directly...");
  try {
    const tokenRes = await axios.post('https://api.prokerala.com/token', 
      `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    console.log("Token Response:", tokenRes.data);
    const accessToken = tokenRes.data.access_token;

    const planetsRes = await axios.get('https://api.prokerala.com/v2/astrology/planet-position', {
      params: {
        datetime: '2024-01-01T10:00:00Z',
        coordinates: '28.6139,77.2090', // Delhi
        ayanamsa: 1
      },
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    console.log("Planets Response Full:", JSON.stringify(planetsRes.data, null, 2));
    console.log("✅ Prokerala API is WORKING.");
  } catch (err) {
    console.error("❌ Prokerala API Error:", err.response ? err.response.data : err.message);
  }
}

testProkerala();
