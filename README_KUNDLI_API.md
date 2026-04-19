# Kundli & Matching API Integration

Currently, the E-Pandit platform uses a realistic **Mock Astro Engine** to simulate Kundli generation and Vivah Milan (Match Making). This allows the frontend to be fully built and tested without consuming paid API credits.

When you are ready to connect to a real astrology provider (such as Prokerala or VedicRishi), follow the instructions below to swap out the mock engine.

## Step-by-Step Guide

### 1. Choose Your Provider
- **Prokerala Astrology API** (https://api.prokerala.com/v2/astrology)
- **Vedic Rishi API** / **AstroAPI** (https://astrologyapi.com/)

Sign up for a developer account on your chosen platform and obtain your `CLIENT_ID` and `CLIENT_SECRET` (or `API_KEY`).

### 2. Update Environment Variables
Open your `BACKEND/.env` file and add your credentials:
```env
# Example for Prokerala
PROKERALA_CLIENT_ID=your_client_id_here
PROKERALA_CLIENT_SECRET=your_client_secret_here

# Example for VedicRishi / AstroAPI
ASTRO_API_USER_ID=your_user_id
ASTRO_API_KEY=your_api_key
```

### 3. Replace the Mock Functions in `kundliController.js`
Open `BACKEND/src/controllers/kundliController.js`. You will replace the `generateKundli` and `matchKundli` functions with standard `axios` calls.

#### Example: Switching to Prokerala API (Kundli Generation)
First, install `axios` if you haven't already:
```bash
npm install axios
```

Then, update the controller:

```javascript
const axios = require('axios');

const generateKundli = async (req, res, next) => {
  try {
    const { name, dob, time, location } = req.body;
    
    // 1. You usually need to fetch an OAuth token first for Prokerala
    // ... token fetching logic ...

    // 2. Format the date/time string as required by the API
    const datetime = `${dob}T${time}:00Z`;

    // 3. Make the actual request (example: getting planetary positions)
    const response = await axios.get('https://api.prokerala.com/v2/astrology/planet-position', {
      params: {
        datetime,
        coordinates: '18.5204,73.8567', // Replace with geocoded lat/lng from location string
        ayanamsa: 1
      },
      headers: {
        'Authorization': `Bearer YOUR_ACCESS_TOKEN`
      }
    });

    // 4. Transform the response to match the frontend's expected format
    // Map the real API's response into our `planets_in_houses` structure:
    // (An array of 12 arrays containing planet names)
    // ... transformation logic ...

    res.json({ success: true, data: formattedResponse });
  } catch (error) {
    next(error);
  }
};
```

### 4. Note on the North Indian Chart SVG
The frontend `<KundliChart />` component expects the `planets_in_houses` data as an array of 12 arrays, where index 0 represents the 1st House (Lagna), index 1 is the 2nd House, etc. 

Most APIs return planets with a specific `house` integer (1-12). You will need to write a small loop in `kundliController.js` to map their array into our 2D array format.

```javascript
// Example Transformer
const apiPlanets = response.data.data; // [{ name: 'Sun', house: 1 }, { name: 'Moon', house: 4 }]
const planets_in_houses = Array.from({ length: 12 }, () => []);

apiPlanets.forEach(p => {
    // Array is 0-indexed, so House 1 goes to index 0
    planets_in_houses[p.house - 1].push(p.name); 
});
```

By keeping this transformation logic in your backend controller, your frontend code (`KundliChart.tsx`) will **not need to be modified at all** when you switch APIs!
