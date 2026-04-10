const supabase = require("../config/supabase");

const mockReviews = [
  { id: "rv_001", booking_id: "bk_001", user_id: "usr_001", pandit_id: "pnd_001", rating: 5, comment: "Excellent pooja! Very knowledgeable pandit ji.  ", created_at: "2026-03-20T13:00:00Z" },
  { id: "rv_002", booking_id: "bk_002", user_id: "usr_001", pandit_id: "pnd_002", rating: 4, comment: "Good experience, very professional.", created_at: "2026-03-25T11:00:00Z" },
];

// POST /api/reviews
const createReview = async (req, res, next) => {
  try {
    const { bookingId, userId, panditId, rating, comment } = req.body;

    if (!bookingId || !userId || !panditId || !rating) {
      return res.status(400).json({ success: false, message: "bookingId, userId, panditId, and rating are required" });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
    }

    if (supabase) {
      // Check if already reviewed
      const { data: existing } = await supabase.from("reviews").select("id").eq("booking_id", bookingId).single();
      if (existing) return res.status(409).json({ success: false, message: "You have already reviewed this booking" });

      const { data, error } = await supabase
        .from("reviews")
        .insert({ booking_id: bookingId, user_id: userId, pandit_id: panditId, rating, comment })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json({ success: true, message: "Review submitted!  ", data });
    }

    const review = { id: "rv_" + Date.now(), booking_id: bookingId, user_id: userId, pandit_id: panditId, rating, comment, created_at: new Date().toISOString() };
    mockReviews.push(review);
    res.status(201).json({ success: true, message: "Review submitted (mock)", data: review });
  } catch (error) {
    next(error);
  }
};

// GET /api/reviews/pandit/:panditId
const getPanditReviews = async (req, res, next) => {
  try {
    const { panditId } = req.params;

    if (supabase) {
      const { data, error } = await supabase
        .from("reviews")
        .select("*, user:user_id(full_name, avatar_url)")
        .eq("pandit_id", panditId)
        .order("created_at", { ascending: false });
      if (error) throw error;

      const avgRating = data.length > 0 ? data.reduce((s, r) => s + r.rating, 0) / data.length : 0;
      return res.json({ success: true, data: { reviews: data, avgRating: Math.round(avgRating * 10) / 10, totalReviews: data.length } });
    }

    const reviews = mockReviews.filter((r) => r.pandit_id === panditId);
    const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
    res.json({ success: true, data: { reviews, avgRating: Math.round(avgRating * 10) / 10, totalReviews: reviews.length } });
  } catch (error) {
    next(error);
  }
};

module.exports = { createReview, getPanditReviews };
