const axios = require('axios');

const getPanchangForDate = async (req, res, next) => {
  try {
    const { date, lat, lng } = req.query;
    
    // Default to today if no date provided
    const targetDate = date ? new Date(date) : new Date();
    
    // Attempt real API if PRokerala token exists
    const prokeralaToken = process.env.PROKERALA_TOKEN;
    
    if (prokeralaToken) {
      // Future integration with real Prokerala API
      // Since Prokerala uses OAuth2, we normally handle token generation here
      // This is a placeholder for real API integration
      console.log('Would use real Prokerala API');
    }
    
    // Mock Fallback Generation
    const dayOfWeek = targetDate.getDay();
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    // Some static arrays to generate plausible mock data
    const tithis = ["Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima", "Amavasya"];
    const nakshatras = ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashirsha", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"];
    const yogas = ["Vishkumbha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyana", "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"];
    const karanas = ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti"];
    
    // Simple deterministic pseudo-random index based on date
    const dateNum = targetDate.getDate() + (targetDate.getMonth() * 31) + (targetDate.getFullYear() * 365);
    
    // Generate derived timings based on dateNum
    const sunriseMin = 10 + (dateNum % 30); // 06:10 to 06:40
    const sunsetMin = 15 + (dateNum % 30); // 06:15 to 06:45
    
    const rahuStartH = 9 + (dateNum % 6);
    const yamaStartH = 13 + (dateNum % 4);
    
    const abhijitStartH = 11;
    const abhijitStartM = 30 + (dateNum % 20);

    const zodiacs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
    const mantras = [
      "Om Namah Shivaya", 
      "Om Namo Bhagavate Vasudevaya", 
      "Om Gam Ganapataye Namaha", 
      "Om Dum Durgayei Namaha",
      "Om Hanumate Namah",
      "Gayatri Mantra",
      "Maha Mrityunjaya Mantra"
    ];

    const panchangData = {
      date: targetDate.toISOString().split('T')[0],
      day: days[dayOfWeek],
      tithi: tithis[dateNum % tithis.length],
      nakshatra: nakshatras[dateNum % nakshatras.length],
      yoga: yogas[dateNum % yogas.length],
      karana: karanas[dateNum % karanas.length],
      sunrise: `06:${sunriseMin.toString().padStart(2, '0')} AM`,
      sunset: `06:${sunsetMin.toString().padStart(2, '0')} PM`,
      auspicious_periods: [
        { name: "Abhijit Muhurat", start: `${abhijitStartH}:${abhijitStartM} AM`, end: `${abhijitStartH + 1}:${abhijitStartM - 10} PM` },
        { name: "Amrit Kaal", start: "02:30 PM", end: "04:10 PM" }
      ],
      inauspicious_periods: [
        { name: "Rahu Kaal", start: `${rahuStartH}:30 AM`, end: `${rahuStartH + 1}:00 AM` },
        { name: "Yama Gandam", start: `${yamaStartH}:00 PM`, end: `${yamaStartH + 1}:30 PM` }
      ],
      insights: {
        moonSign: zodiacs[dateNum % zodiacs.length],
        sunSign: zodiacs[(targetDate.getMonth() + 3) % 12],
        mantra: mantras[dateNum % mantras.length]
      }
    };

    return res.json({ success: true, data: panchangData });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPanchangForDate
};
