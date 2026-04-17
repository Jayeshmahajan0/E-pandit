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

// ── Notification templates (i18n ready) ───────────
const templates = {
  booking_request: (data) => ({
    title_translations: {
      en: "New Booking Request!",
      hi: "नया बुकिंग अनुरोध!",
      mr: "नवीन बुकिंग विनंती!"
    },
    message_translations: {
      en: `${data.userName} wants to book you for ${data.poojaType}. Tap to accept.`,
      hi: `${data.userName} आपको ${data.poojaType} के लिए बुक करना चाहते हैं। स्वीकार करने के लिए टैप करें।`,
      mr: `${data.userName} तुम्हाला ${data.poojaType} साठी बुक करू इच्छित आहेत. स्वीकारण्यासाठी टॅप करा.`
    }
  }),
  booking_accepted: (data) => ({
    title_translations: {
      en: "Booking Confirmed!",
      hi: "बुकिंग की पुष्टि हो गई!",
      mr: "बुकिंग निश्चित झाली!"
    },
    message_translations: {
      en: `${data.panditName} has accepted your booking for ${data.poojaType}. They will arrive soon.`,
      hi: `${data.panditName} ने ${data.poojaType} के लिए आपकी बुकिंग स्वीकार कर ली है। वे जल्द ही पहुंचेंगे।`,
      mr: `${data.panditName} यांनी ${data.poojaType} साठी तुमची बुकिंग स्वीकारली आहे. ते लवकरच पोहोचतील.`
    }
  }),
  pandit_arriving: (data) => ({
    title_translations: { en: "Pandit is on the way! 🚗", hi: "पंडित जी रास्ते में हैं! 🚗", mr: "पंडित जी वाटेवर आहेत! 🚗" },
    message_translations: {
      en: `${data.panditName} is heading to your location for ${data.poojaType}.`,
      hi: `${data.panditName} ${data.poojaType} के लिए आपके स्थान की ओर आ रहे हैं।`,
      mr: `${data.panditName} ${data.poojaType} साठी तुमच्या स्थानाकडे येत आहेत.`
    }
  }),
  pooja_started: (data) => ({
    title_translations: { en: "Pooja Started", hi: "पूजा शुरू", mr: "पूजा सुरू" },
    message_translations: {
      en: `Your ${data.poojaType} has begun with ${data.panditName}.`,
      hi: `आपकी ${data.poojaType} ${data.panditName} के साथ शुरू हो गई है।`,
      mr: `तुमची ${data.poojaType} ${data.panditName} सोबत सुरू झाली आहे.`
    }
  }),
  pooja_completed: (data) => ({
    title_translations: { en: "Pooja Completed! 🎉", hi: "पूजा संपन्न! 🎉", mr: "पूजा पूर्ण! 🎉" },
    message_translations: {
      en: `Your ${data.poojaType} is complete. Please rate your experience.`,
      hi: `आपकी ${data.poojaType} पूरी हो गई है। कृपया अपना अनुभव साझा करें।`,
      mr: `तुमची ${data.poojaType} पूर्ण झाली आहे. कृपया तुमचा अनुभव नोंदवा.`
    }
  }),
  booking_cancelled: (data) => ({
    title_translations: { en: "Booking Cancelled ❌", hi: "बुकिंग रद्द ❌", mr: "बुकिंग रद्द ❌" },
    message_translations: {
      en: `Your booking for ${data.poojaType} has been cancelled. ${data.reason || ""}`,
      hi: `आपकी ${data.poojaType} की बुकिंग रद्द कर दी गई है। ${data.reason || ""}`,
      mr: `तुमची ${data.poojaType} ची बुकिंग रद्द झाली आहे. ${data.reason || ""}`
    }
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

    const { title_translations, message_translations } = template(notifData || {});
    // Fallback to English for standard non-translated fields
    const title = title_translations.en;
    const message = message_translations.en;

    // Save to DB
    if (supabase) {
      const { data, error } = await supabase
        .from("notifications")
        .insert({ 
          user_id: userId, 
          type, 
          title, 
          message, 
          title_translations, 
          message_translations, 
          booking_id: bookingId, 
          channel: "app" 
        })
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
