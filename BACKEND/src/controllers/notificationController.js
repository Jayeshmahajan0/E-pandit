const supabase = require("../config/supabase");
const nodemailer = require("nodemailer");

// ── Email transporter (sample config) ───────────
let transporter = null;
try {
  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    console.log("   Email transporter configured");
  } else {
    console.log("     SMTP not configured — email notifications will be logged to console");
  }
} catch (err) {
  console.log("     Email setup failed:", err.message);
}

const mockNotifications = [];

// ── Notification templates ──────────────────────
const templates = {
  booking_request: (data) => ({
    title: "New Booking Request!  ",
    message: `${data.userName} wants to book you for ${data.poojaType}. Tap to accept.`,
  }),
  booking_accepted: (data) => ({
    title: "Booking Confirmed!   ",
    message: `${data.panditName} has accepted your booking for ${data.poojaType}. They will arrive soon.`,
  }),
  pandit_arriving: (data) => ({
    title: "Pandit is on the way! 🚗",
    message: `${data.panditName} is heading to your location for ${data.poojaType}.`,
  }),
  pooja_started: (data) => ({
    title: "Pooja Started  ",
    message: `Your ${data.poojaType} has begun with ${data.panditName}.`,
  }),
  pooja_completed: (data) => ({
    title: "Pooja Completed! 🎉",
    message: `Your ${data.poojaType} is complete. Please rate your experience.`,
  }),
  booking_cancelled: (data) => ({
    title: "Booking Cancelled ❌",
    message: `Your booking for ${data.poojaType} has been cancelled. ${data.reason || ""}`,
  }),
};

// ── Send email (mock-safe) ──────────────────────
const sendEmail = async (to, subject, text) => {
  if (transporter) {
    try {
      await transporter.sendMail({
        from: process.env.NOTIFICATION_FROM || "noreply@epandit.com",
        to, subject, text,
        html: `<div style="font-family:sans-serif;padding:20px;background:#FFF8F0;border-radius:12px;border:1px solid #E8D5B7"><h2 style="color:#8B4513;margin:0 0 10px">${subject}</h2><p style="color:#333;font-size:16px">${text}</p><hr style="border:none;border-top:1px solid #E8D5B7;margin:20px 0"><p style="color:#999;font-size:12px">  E-Pandit — Your Spiritual Companion</p></div>`,
      });
      console.log(`📧 Email sent to ${to}: ${subject}`);
    } catch (err) {
      console.log(`📧 Email failed to ${to}:`, err.message);
    }
  } else {
    console.log(`📧 [MOCK EMAIL] To: ${to} | Subject: ${subject} | Body: ${text}`);
  }
};

// POST /api/notifications/send
const sendBookingNotification = async (req, res, next) => {
  try {
    const { userId, type, bookingId, data: notifData, recipientEmail, recipientPhone } = req.body;

    const template = templates[type];
    if (!template) return res.status(400).json({ success: false, message: "Unknown notification type" });

    const { title, message } = template(notifData || {});

    // Save to DB
    if (supabase) {
      const { data, error } = await supabase
        .from("notifications")
        .insert({ user_id: userId, type, title, message, booking_id: bookingId, channel: "app" })
        .select().single();
      if (error) throw error;
    }

    // Send email
    if (recipientEmail) {
      await sendEmail(recipientEmail, title, message);
    }

    // SMS mock
    if (recipientPhone) {
      console.log(`📱 [SMS] To: +91${recipientPhone} | ${title}: ${message}`);
    }

    const notif = { id: "ntf_" + Date.now(), user_id: userId, type, title, message, booking_id: bookingId, is_read: false, created_at: new Date().toISOString() };
    mockNotifications.push(notif);

    res.json({ success: true, message: "Notification sent", data: notif });
  } catch (error) {
    next(error);
  }
};

// GET /api/notifications/user/:userId
const getUserNotifications = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (supabase) {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return res.json({ success: true, data, unreadCount: data.filter((n) => !n.is_read).length });
    }

    const notifs = mockNotifications.filter((n) => n.user_id === userId);
    res.json({ success: true, data: notifs, unreadCount: notifs.filter((n) => !n.is_read).length });
  } catch (error) {
    next(error);
  }
};

// PUT /api/notifications/:id/read
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (supabase) {
      const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id);
      if (error) throw error;
    }

    res.json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendBookingNotification, getUserNotifications, markAsRead, sendEmail };
