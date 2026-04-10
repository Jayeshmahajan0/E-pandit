const supabase = require("../config/supabase");

// ──────────────────────────────────────────────
// Location Data (static — same as frontend)
// ──────────────────────────────────────────────
const statesData = {
  Maharashtra: [
    "Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad",
    "Solapur", "Kolhapur", "Amravati", "Sangli", "Satara",
    "Ratnagiri", "Ahmednagar", "Jalgaon", "Latur", "Nanded",
  ],
  Gujarat: [
    "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar",
    "Bhavnagar", "Junagadh", "Jamnagar", "Anand", "Kutch",
  ],
  Karnataka: [
    "Bengaluru", "Mysuru", "Hubli-Dharwad", "Mangaluru",
    "Belagavi", "Kalaburagi", "Tumkuru", "Shimoga",
  ],
  Rajasthan: [
    "Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer",
    "Bikaner", "Jaisalmer", "Pushkar",
  ],
  "Uttar Pradesh": [
    "Lucknow", "Varanasi", "Agra", "Prayagraj", "Kanpur",
    "Noida", "Ghaziabad", "Mathura", "Ayodhya", "Meerut",
  ],
  "Madhya Pradesh": [
    "Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain", "Rewa", "Sagar",
  ],
  "Tamil Nadu": [
    "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli",
    "Salem", "Tirunelveli", "Kanchipuram", "Thanjavur",
  ],
};

// Mock priests data per district
const mockPriestsByDistrict = {
  Pune: [
    { id: "p1", name: "Pandit Arjun Mishra", rating: 4.8, specializations: ["Ganesh Puja", "Navgraha Shanti"] },
    { id: "p2", name: "Pandit Suresh Joshi", rating: 4.7, specializations: ["Satyanarayan Katha", "Vivah"] },
  ],
  Mumbai: [
    { id: "p3", name: "Pandit Ramesh Sharma", rating: 4.9, specializations: ["Satyanarayan Katha", "Griha Pravesh"] },
    { id: "p4", name: "Pandit Devendra Kulkarni", rating: 4.6, specializations: ["Vivah", "Mundan"] },
  ],
};

// ──────────────────────────────────────────────
// GET /api/locations/states
// ──────────────────────────────────────────────
const getStates = (req, res) => {
  const states = Object.keys(statesData);
  res.json({
    success: true,
    data: states,
  });
};

// ──────────────────────────────────────────────
// GET /api/locations/districts/:state
// ──────────────────────────────────────────────
const getDistrictsByState = (req, res) => {
  const { state } = req.params;
  const districts = statesData[state];

  if (!districts) {
    return res.status(404).json({
      success: false,
      message: `State "${state}" not found. Available states: ${Object.keys(statesData).join(", ")}`,
    });
  }

  res.json({
    success: true,
    data: districts,
  });
};

// ──────────────────────────────────────────────
// GET /api/locations/priests/:district
// ──────────────────────────────────────────────
const getPriestsByDistrict = async (req, res, next) => {
  try {
    const { district } = req.params;

    if (supabase) {
      // Query priests by location from Supabase
      const { data: priests, error } = await supabase
        .from("priests")
        .select("*")
        .ilike("location", `%${district}%`);

      if (error) throw error;

      return res.json({
        success: true,
        data: {
          district,
          priests: priests || [],
          count: priests ? priests.length : 0,
        },
      });
    }

    // Mock response
    const priests = mockPriestsByDistrict[district] || [];
    res.json({
      success: true,
      data: {
        district,
        priests,
        count: priests.length,
        message: priests.length === 0
          ? `No pandits found in ${district} yet. Try nearby districts.`
          : undefined,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStates,
  getDistrictsByState,
  getPriestsByDistrict,
};
