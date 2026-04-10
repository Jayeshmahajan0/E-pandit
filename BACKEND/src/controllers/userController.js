const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const supabase = require("../config/supabase");

// ──────────────────────────────────────────────
// Mock data (used when Supabase is not configured)
// ──────────────────────────────────────────────
const mockUsers = [
  {
    id: "usr_001",
    role: "user",
    full_name: "Rahul Deshmukh",
    email: "rahul@epandit.com",
    phone: "9876543210",
    district: "Pune",
    state: "Maharashtra",
    is_verified: true,
    created_at: "2025-01-10T00:00:00Z",
  },
];

const mockPandits = [
  {
    id: "pnd_001",
    role: "pandit",
    full_name: "Pandit Ramesh Sharma",
    email: "ramesh@epandit.com",
    phone: "9876543211",
    district: "Pune",
    state: "Maharashtra",
    specializations: ["Satyanarayan Katha", "Griha Pravesh", "Vivah"],
    experience_years: 20,
    languages: ["Hindi", "Sanskrit", "English"],
    price_per_pooja: 2100,
    about: "20+ years of experience in Vedic rituals",
    is_online: true,
    is_verified: true,
    rating: 4.9,
    reviews_count: 234,
    created_at: "2024-06-01T00:00:00Z",
  },
  {
    id: "pnd_002",
    role: "pandit",
    full_name: "Pandit Arjun Mishra",
    email: "arjun@epandit.com",
    phone: "9876543212",
    district: "Pune",
    state: "Maharashtra",
    specializations: ["Ganesh Puja", "Navgraha Shanti", "Rudrabhishek"],
    experience_years: 8,
    languages: ["Hindi", "Sanskrit", "Marathi"],
    price_per_pooja: 1500,
    about: "Specialist in Ganesh Puja and planetary remedies",
    is_online: true,
    is_verified: true,
    rating: 4.8,
    reviews_count: 189,
    created_at: "2024-09-15T00:00:00Z",
  },
  {
    id: "pnd_003",
    role: "pandit",
    full_name: "Pandit Vishnu Dutta",
    email: "vishnu@epandit.com",
    phone: "9876543213",
    district: "Mumbai",
    state: "Maharashtra",
    specializations: ["Vivah", "Mundan", "Vastu Shanti", "Satyanarayan Katha"],
    experience_years: 35,
    languages: ["Hindi", "Sanskrit", "Gujarati", "English"],
    price_per_pooja: 3000,
    about: "35 years of sacred rituals across India",
    is_online: false,
    is_verified: true,
    rating: 4.95,
    reviews_count: 412,
    created_at: "2023-01-01T00:00:00Z",
  },
  {
    id: "pnd_004",
    role: "pandit",
    full_name: "Pandit Suresh Joshi",
    email: "suresh@epandit.com",
    phone: "9876543214",
    district: "Pune",
    state: "Maharashtra",
    specializations: ["Satyanarayan Katha", "Vivah", "Griha Pravesh"],
    experience_years: 12,
    languages: ["Hindi", "Marathi", "Sanskrit"],
    price_per_pooja: 1800,
    about: "Experienced in traditional Maharashtrian rituals",
    is_online: true,
    is_verified: true,
    rating: 4.7,
    reviews_count: 156,
    created_at: "2024-03-20T00:00:00Z",
  },
];

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.full_name, role: user.role },
    process.env.JWT_SECRET || "dev_secret_change_me",
    { expiresIn: "7d" }
  );
};

// ──────────────────────────────────────────────
// POST /api/users/register
// ──────────────────────────────────────────────
const registerUser = async (req, res, next) => {
  try {
    const { fullName, email, phone, password, role = "user" } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: "Full name, email, and password are required" });
    }

    if (supabase) {
      const { data: existing } = await supabase.from("profiles").select("id").eq("email", email).single();
      if (existing) {
        return res.status(409).json({ success: false, message: "User with this email already exists" });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const { data: newUser, error } = await supabase
        .from("profiles")
        .insert({ full_name: fullName, email, phone: phone || null, password_hash: passwordHash, role })
        .select()
        .single();

      if (error) throw error;
      const token = generateToken(newUser);
      return res.status(201).json({
        success: true,
        message: "Account created successfully",
        data: { user: { id: newUser.id, fullName: newUser.full_name, email: newUser.email, role: newUser.role }, token },
      });
    }

    const mockUser = { id: "usr_" + Date.now(), full_name: fullName, email, phone, role };
    const token = generateToken(mockUser);
    res.status(201).json({
      success: true,
      message: "Account created successfully (mock)",
      data: { user: { id: mockUser.id, fullName, email, phone, role }, token },
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// POST /api/users/register-pandit
// ──────────────────────────────────────────────
const registerPandit = async (req, res, next) => {
  try {
    const { fullName, email, phone, password, specializations, experienceYears, languages, pricePerPooja, about, state, district } = req.body;

    if (!fullName || !email || !password || !specializations) {
      return res.status(400).json({ success: false, message: "Name, email, password, and specializations are required" });
    }

    if (supabase) {
      const { data: existing } = await supabase.from("profiles").select("id").eq("email", email).single();
      if (existing) return res.status(409).json({ success: false, message: "Email already registered" });

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const { data: pandit, error } = await supabase
        .from("profiles")
        .insert({
          full_name: fullName, email, phone, password_hash: passwordHash,
          role: "pandit", specializations, experience_years: experienceYears,
          languages, price_per_pooja: pricePerPooja, about, state, district,
        })
        .select()
        .single();

      if (error) throw error;
      const token = generateToken(pandit);
      return res.status(201).json({ success: true, message: "Pandit registered successfully", data: { pandit, token } });
    }

    const mockPandit = { id: "pnd_" + Date.now(), full_name: fullName, email, role: "pandit", specializations };
    const token = generateToken(mockPandit);
    res.status(201).json({ success: true, message: "Pandit registered (mock)", data: { pandit: mockPandit, token } });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// POST /api/users/login
// ──────────────────────────────────────────────
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: "Email and password are required" });

    if (supabase) {
      const { data: user, error } = await supabase.from("profiles").select("*").eq("email", email).single();
      if (error || !user) return res.status(401).json({ success: false, message: "Invalid email or password" });

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) return res.status(401).json({ success: false, message: "Invalid email or password" });

      const token = generateToken(user);
      return res.json({
        success: true, message: "Login successful",
        data: {
          user: { id: user.id, fullName: user.full_name, email: user.email, phone: user.phone, role: user.role, isVerified: user.is_verified, isOnline: user.is_online },
          token,
        },
      });
    }

    // Mock — try pandits first, then users
    const allMock = [...mockUsers, ...mockPandits];
    const mockUser = allMock.find((u) => u.email === email) || mockUsers[0];
    const token = generateToken(mockUser);
    res.json({
      success: true, message: "Login successful (mock)",
      data: {
        user: { id: mockUser.id, fullName: mockUser.full_name, email: mockUser.email, phone: mockUser.phone, role: mockUser.role, isVerified: mockUser.is_verified },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// GET /api/users/profile/:id
// ──────────────────────────────────────────────
const getUserProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (supabase) {
      const { data: user, error } = await supabase
        .from("profiles")
        .select("id, role, full_name, email, phone, date_of_birth, gender, avatar_url, state, district, pin_code, specializations, experience_years, languages, price_per_pooja, about, is_online, is_verified, preferred_poojas, preferred_languages, created_at")
        .eq("id", id)
        .single();

      if (error || !user) return res.status(404).json({ success: false, message: "User not found" });

      // Get avg rating if pandit
      let avgRating = null;
      let reviewsCount = 0;
      if (user.role === "pandit") {
        const { data: reviews } = await supabase.from("reviews").select("rating").eq("pandit_id", id);
        if (reviews && reviews.length > 0) {
          reviewsCount = reviews.length;
          avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        }
      }

      return res.json({ success: true, data: { ...user, avgRating, reviewsCount } });
    }

    const allMock = [...mockUsers, ...mockPandits];
    const mockUser = allMock.find((u) => u.id === id) || mockUsers[0];
    res.json({ success: true, data: mockUser });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// PUT /api/users/profile/:id
// ──────────────────────────────────────────────
const updateUserProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (supabase) {
      const { data, error } = await supabase.from("profiles").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id).select().single();
      if (error) throw error;
      return res.json({ success: true, message: "Profile updated", data });
    }

    res.json({ success: true, message: "Profile updated (mock)", data: { id, ...updates } });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// GET /api/users/nearby-pandits
// ──────────────────────────────────────────────
const getNearbyPandits = async (req, res, next) => {
  try {
    const { district, poojaType } = req.query;

    if (supabase) {
      let query = supabase
        .from("profiles")
        .select("id, full_name, email, phone, avatar_url, specializations, experience_years, languages, price_per_pooja, about, district, state, is_online, is_verified, latitude, longitude")
        .eq("role", "pandit")
        .eq("is_active", true);

      if (district) query = query.eq("district", district);
      if (poojaType) query = query.contains("specializations", [poojaType]);

      const { data: pandits, error } = await query;
      if (error) throw error;

      // Get ratings for each pandit
      const panditIds = pandits.map((p) => p.id);
      const { data: allReviews } = await supabase.from("reviews").select("pandit_id, rating").in("pandit_id", panditIds);

      const panditsWithRating = pandits.map((p) => {
        const reviews = allReviews ? allReviews.filter((r) => r.pandit_id === p.id) : [];
        const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
        return { ...p, rating: Math.round(avgRating * 10) / 10, reviewsCount: reviews.length };
      });

      return res.json({ success: true, data: panditsWithRating, count: panditsWithRating.length });
    }

    // Mock
    let filtered = mockPandits;
    if (district) filtered = filtered.filter((p) => p.district === district);
    if (poojaType) filtered = filtered.filter((p) => p.specializations.includes(poojaType));

    res.json({ success: true, data: filtered, count: filtered.length });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// PUT /api/users/toggle-online/:id
// ──────────────────────────────────────────────
const toggleOnlineStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isOnline } = req.body;

    if (supabase) {
      const { data, error } = await supabase.from("profiles").update({ is_online: isOnline, updated_at: new Date().toISOString() }).eq("id", id).select("id, is_online").single();
      if (error) throw error;
      return res.json({ success: true, message: isOnline ? "You are now online 🟢" : "You are now offline 🔴", data });
    }

    res.json({ success: true, message: isOnline ? "Online (mock)" : "Offline (mock)", data: { id, is_online: isOnline } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  registerPandit,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getNearbyPandits,
  toggleOnlineStatus,
};
