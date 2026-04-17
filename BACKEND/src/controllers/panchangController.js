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
      },

      // ── Mulank & Bhagyank ──────────────────────
      mulank: (() => {
        let sum = targetDate.getDate();
        while (sum > 9) { sum = String(sum).split('').reduce((a, b) => a + Number(b), 0); }
        return sum;
      })(),
      bhagyank: (() => {
        const dd = targetDate.getDate();
        const mm = targetDate.getMonth() + 1;
        const yyyy = targetDate.getFullYear();
        let sum = dd + mm + String(yyyy).split('').reduce((a, b) => a + Number(b), 0);
        while (sum > 9) { sum = String(sum).split('').reduce((a, b) => a + Number(b), 0); }
        return sum;
      })(),

      // ── Day-wise Bhavishya (Daily Prediction) ──
      bhavishya: (() => {
        const predictions = [
          { category: "Career", message: "A great day to take initiative in your professional life. New opportunities may knock at your door." },
          { category: "Health", message: "Take care of your digestive system today. Light meals and a short walk will do wonders." },
          { category: "Relationships", message: "Harmony in family life. A good day to resolve pending misunderstandings with loved ones." },
          { category: "Finance", message: "Avoid impulsive spending today. Focus on long-term investments and savings." },
          { category: "Spiritual", message: "Meditation and chanting today will bring inner peace. Visit a temple if possible." },
          { category: "Career", message: "A mentor figure may guide you today. Stay receptive to feedback and new learning." },
          { category: "Health", message: "Excellent day for starting a new fitness routine. Your energy levels are high." },
          { category: "Relationships", message: "Express gratitude to those close to you. Small gestures will strengthen bonds." },
          { category: "Finance", message: "Unexpected gains are possible. However, avoid lending money today." },
          { category: "Spiritual", message: "The cosmic energy supports deep introspection today. Journal your thoughts." },
          { category: "Career", message: "Teamwork will lead to success today. Collaborate with your peers for best results." },
          { category: "Health", message: "Stay hydrated and avoid oily food. Yoga or pranayama is recommended today." },
          { category: "Relationships", message: "A reunion with an old friend brings joy. Social gatherings are favored." },
          { category: "Finance", message: "A good day for property-related discussions. Review your budget carefully." },
          { category: "Spiritual", message: "Offer prayers during Brahma Muhurat for maximum spiritual benefit." },
        ];
        // Pick 3 predictions based on dateNum
        return [
          predictions[dateNum % predictions.length],
          predictions[(dateNum + 5) % predictions.length],
          predictions[(dateNum + 10) % predictions.length],
        ];
      })(),

      // ── Daily Horoscope per Zodiac Sign ──
      horoscope: zodiacs.map((sign, idx) => {
        const horoscopePool = [
          "Today brings a wave of confidence. Trust your instincts and take bold decisions.",
          "Financial matters require careful attention. A surprise gift may brighten your day.",
          "Romance is in the air. Express your feelings to your partner or crush today.",
          "Health needs extra care. Avoid stress and take regular breaks from work.",
          "A breakthrough at work is likely. Your hard work will finally pay off.",
          "Family time will bring peace. Cook something special for your loved ones.",
          "Travel plans may materialize suddenly. Be ready for an exciting short trip.",
          "Students will find today productive. Focus on studies for maximum benefit.",
          "Property matters may need attention. Legal documents should be reviewed carefully.",
          "Spiritual growth is highlighted. Visit a sacred place or start a new sadhana.",
          "Communication is your strength today. Use it to resolve pending conflicts.",
          "Creative energy is high. Artists and writers will find inspiration easily.",
        ];
        const luckyNumbers = [3, 7, 9, 1, 5, 2, 8, 4, 6, 11, 22, 13];
        const luckyColors = ["Red", "Gold", "Green", "Blue", "White", "Orange", "Purple", "Yellow", "Pink", "Maroon", "Silver", "Turquoise"];
        const ratings = ["Excellent", "Good", "Average", "Challenging", "Promising"];
        const signSeed = dateNum + idx;

        return {
          sign,
          prediction: horoscopePool[signSeed % horoscopePool.length],
          luckyNumber: luckyNumbers[signSeed % luckyNumbers.length],
          luckyColor: luckyColors[signSeed % luckyColors.length],
          overallRating: ratings[signSeed % ratings.length],
        };
      }),
    };

    return res.json({ success: true, data: panchangData });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPanchangForDate
};
