const supabase = require("../config/supabase");
const { sendEmail } = require("./notificationController");

// ── Mock bookings ───────────────────────────────
let mockBookings = [
  {
    id: "bk_001",
    user_id: "usr_001",
    pandit_id: "pnd_001",
    pooja_type: "Satyanarayan Katha",
    status: "completed",
    user_address: "Flat 302, Sunrise Apartments, Kothrud, Pune",
    amount: 5100,
    payment_status: "paid",
    payment_method: "upi",
    scheduled_date: "2026-03-20",
    scheduled_time: "09:00",
    created_at: "2026-03-18T10:00:00Z",
    completed_at: "2026-03-20T12:00:00Z",
    pandit_name: "Pandit Ramesh Sharma",
    user_name: "Rahul Deshmukh",
  },
  {
    id: "bk_002",
    user_id: "usr_001",
    pandit_id: "pnd_002",
    pooja_type: "Ganesh Puja",
    status: "completed",
    user_address: "B-12, Green Valley, Hinjewadi, Pune",
    amount: 2100,
    payment_status: "paid",
    payment_method: "cash",
    scheduled_date: "2026-03-25",
    scheduled_time: "07:00",
    created_at: "2026-03-23T08:00:00Z",
    completed_at: "2026-03-25T10:00:00Z",
    pandit_name: "Pandit Arjun Mishra",
    user_name: "Rahul Deshmukh",
  },
];

// ──────────────────────────────────────────────
// POST /api/bookings — Create booking request
// ──────────────────────────────────────────────
const createBooking = async (req, res, next) => {
  try {
    const { userId, panditId, poojaType, userAddress, userLat, userLng, scheduledDate, scheduledTime, amount, notes, paymentMethod = "cash" } = req.body;

    if (!userId || !panditId || !poojaType || !amount) {
      return res.status(400).json({ success: false, message: "userId, panditId, poojaType, and amount are required" });
    }

    if (supabase) {
      const { data: booking, error } = await supabase
        .from("bookings")
        .insert({
          user_id: userId, pandit_id: panditId, pooja_type: poojaType,
          status: "requested", user_address: userAddress,
          user_lat: userLat, user_lng: userLng,
          scheduled_date: scheduledDate, scheduled_time: scheduledTime,
          amount, notes, payment_method: paymentMethod,
        })
        .select(`
          *,
          pandit:pandit_id(email, full_name),
          user:user_id(full_name)
        `)
        .single();

      if (error) throw error;

      // Send email to Pandit ONLY if cash payment (for UPI, paymentController handles it after success)
      if (paymentMethod === "cash" && booking.pandit?.email) {
        const subject = "New Booking Request! 🙏";
        const message = `Hello ${booking.pandit.full_name},\n\nYou have received a new booking request from ${booking.user?.full_name} for a ${booking.pooja_type} on ${booking.scheduled_date} at ${booking.scheduled_time}.\n\nAddress: ${booking.user_address}\nAmount: ₹${booking.amount}\nPayment Method: Cash\n\nPlease login to your E-Pandit Dashboard to Accept or Reject this booking.`;
        await sendEmail(booking.pandit.email, subject, message);
      }

      return res.status(201).json({ success: true, message: "Booking request sent to pandit!", data: booking });
    }

    const mockBooking = {
      id: "bk_" + Date.now(),
      user_id: userId, pandit_id: panditId, pooja_type: poojaType,
      status: "requested", user_address: userAddress, amount,
      payment_method: paymentMethod, payment_status: "pending",
      scheduled_date: scheduledDate, scheduled_time: scheduledTime,
      notes, created_at: new Date().toISOString(),
    };
    mockBookings.push(mockBooking);
    res.status(201).json({ success: true, message: "Booking request sent (mock)", data: mockBooking });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// PUT /api/bookings/:id/accept
// ──────────────────────────────────────────────
const acceptBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (supabase) {
      const { data, error } = await supabase
        .from("bookings")
        .update({ status: "accepted", accepted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq("id", id).eq("status", "requested").select().single();
      if (error) throw error;
      if (!data) return res.status(404).json({ success: false, message: "Booking not found or already processed" });
      return res.json({ success: true, message: "Booking accepted!", data });
    }

    const booking = mockBookings.find((b) => b.id === id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    booking.status = "accepted";
    booking.accepted_at = new Date().toISOString();
    res.json({ success: true, message: "Booking accepted (mock)", data: booking });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// PUT /api/bookings/:id/reject
// ──────────────────────────────────────────────
const rejectBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (supabase) {
      const { data, error } = await supabase
        .from("bookings")
        .update({ status: "cancelled", cancelled_by: "pandit", cancellation_reason: reason, cancelled_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq("id", id).select().single();
      if (error) throw error;
      return res.json({ success: true, message: "Booking rejected", data });
    }

    const booking = mockBookings.find((b) => b.id === id);
    if (booking) { booking.status = "cancelled"; booking.cancelled_by = "pandit"; }
    res.json({ success: true, message: "Booking rejected (mock)", data: booking });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// PUT /api/bookings/:id/status — Update status
// ──────────────────────────────────────────────
const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["arriving", "in_progress", "completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(", ")}` });
    }

    const timestampField = { arriving: "arriving_at", in_progress: "started_at", completed: "completed_at" }[status];

    if (supabase) {
      const updateData = { status, [timestampField]: new Date().toISOString(), updated_at: new Date().toISOString() };
      if (status === "completed") updateData.payment_status = "paid";

      const { data, error } = await supabase.from("bookings").update(updateData).eq("id", id).select().single();
      if (error) throw error;
      return res.json({ success: true, message: `Booking ${status}`, data });
    }

    const booking = mockBookings.find((b) => b.id === id);
    if (booking) { booking.status = status; booking[timestampField] = new Date().toISOString(); if (status === "completed") booking.payment_status = "paid"; }
    res.json({ success: true, message: `Booking ${status} (mock)`, data: booking });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// PUT /api/bookings/:id/cancel
// ──────────────────────────────────────────────
const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason, cancelledBy } = req.body;

    if (supabase) {
      const { data, error } = await supabase
        .from("bookings")
        .update({ status: "cancelled", cancelled_by: cancelledBy, cancellation_reason: reason, cancelled_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq("id", id)
        .select("*, user:user_id(email, full_name)")
        .single();
      if (error) throw error;

      // Send cancellation email to the Booker only
      if (data.user?.email) {
        const subject = "Booking Cancelled - E-Pandit";
        const message = `Dear ${data.user.full_name},\n\nYour booking request for "${data.pooja_type}" has been cancelled.\nReason: ${reason || "Not specified"}\n\nIf you have any questions, please contact E-Pandit support.\n\nRegards,\nTeam E-Pandit`;
        await sendEmail(data.user.email, subject, message);
      }

      return res.json({ success: true, message: "Booking cancelled", data });
    }

    const booking = mockBookings.find((b) => b.id === id);
    if (booking) { booking.status = "cancelled"; booking.cancelled_by = cancelledBy; }
    res.json({ success: true, message: "Booking cancelled (mock)", data: booking });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// GET /api/bookings/:id
// ──────────────────────────────────────────────
const getBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (supabase) {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, user:user_id(id, full_name, phone, avatar_url), pandit:pandit_id(id, full_name, phone, avatar_url, specializations, experience_years, languages)")
        .eq("id", id).single();
      if (error) throw error;
      return res.json({ success: true, data });
    }

    const booking = mockBookings.find((b) => b.id === id) || mockBookings[0];
    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// GET /api/bookings/user/:userId
// ──────────────────────────────────────────────
const getUserBookings = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (supabase) {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, pandit:pandit_id(id, full_name, avatar_url, phone)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return res.json({ success: true, data, count: data.length });
    }

    const bookings = mockBookings.filter((b) => b.user_id === userId);
    res.json({ success: true, data: bookings, count: bookings.length });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// GET /api/bookings/pandit/:panditId
// ──────────────────────────────────────────────
const getPanditBookings = async (req, res, next) => {
  try {
    const { panditId } = req.params;
    const { status } = req.query;

    if (supabase) {
      let query = supabase
        .from("bookings")
        .select("*, user:user_id(id, full_name, avatar_url, phone)")
        .eq("pandit_id", panditId)
        .order("created_at", { ascending: false });

      if (status) query = query.eq("status", status);

      const { data, error } = await query;
      if (error) throw error;
      return res.json({ success: true, data, count: data.length });
    }

    let bookings = mockBookings.filter((b) => b.pandit_id === panditId);
    if (status) bookings = bookings.filter((b) => b.status === status);
    res.json({ success: true, data: bookings, count: bookings.length });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// PUT /api/bookings/:id/convert-to-cash
// ──────────────────────────────────────────────
const convertToCash = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (supabase) {
      const { data: booking, error } = await supabase
        .from("bookings")
        .update({ payment_method: "cash", updated_at: new Date().toISOString() })
        .eq("id", id)
        .select(`
          *,
          pandit:pandit_id(email, full_name),
          user:user_id(full_name)
        `)
        .single();
        
      if (error) throw error;
      if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

      // Send email to Pandit now that it is a cash booking
      if (booking.pandit?.email) {
        const subject = "New Booking Request! 🙏";
        const message = `Hello ${booking.pandit.full_name},\n\nYou have received a new booking request from ${booking.user?.full_name} for a ${booking.pooja_type} on ${booking.scheduled_date} at ${booking.scheduled_time}.\n\nAddress: ${booking.user_address}\nAmount: ₹${booking.amount}\nPayment Method: Cash (Converted from UPI)\n\nPlease login to your E-Pandit Dashboard to Accept or Reject this booking.`;
        await sendEmail(booking.pandit.email, subject, message);
      }

      return res.json({ success: true, message: "Converted to cash payment", data: booking });
    }

    return res.json({ success: false, message: "Only supported with Supabase" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  acceptBooking,
  rejectBooking,
  updateBookingStatus,
  cancelBooking,
  convertToCash,
  getBooking,
  getUserBookings,
  getPanditBookings,
};
