const Razorpay = require("razorpay");
const crypto = require("crypto");
const supabase = require("../config/supabase");
const { sendEmail } = require("./notificationController");

// ── Initialize Razorpay ────────────────────────
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || process.env.RAZOPRPAY_API,
  key_secret: process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET,
});

// ──────────────────────────────────────────────
// POST /api/payments/create-order
// Creates a Razorpay order for the given booking
// ──────────────────────────────────────────────
const createOrder = async (req, res, next) => {
  try {
    const { bookingId, amount, currency = "INR", notes = {} } = req.body;

    if (!amount || amount < 1) {
      return res.status(400).json({ success: false, message: "Amount is required and must be at least ₹1" });
    }

    // Razorpay expects amount in paise (1 INR = 100 paise)
    const options = {
      amount: Math.round(amount * 100),
      currency,
      // receipt max length is 40 chars. UUID is 36 chars.
      receipt: `ep_${Date.now()}`,
      notes: {
        booking_id: bookingId || "",
        platform: "E-Pandit",
        ...notes,
      },
    };

    const order = await razorpay.orders.create(options);

    // Store the order in the database
    if (supabase && bookingId) {
      await supabase.from("payments").insert({
        booking_id: bookingId,
        razorpay_order_id: order.id,
        amount: amount,
        currency,
        status: "created",
      });
    }

    return res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID || process.env.RAZOPRPAY_API,
      },
    });
  } catch (error) {
    console.error("Razorpay create order error:", error);
    next(error);
  }
};

// ──────────────────────────────────────────────
// POST /api/payments/verify
// Verifies the Razorpay payment signature
// ──────────────────────────────────────────────
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing payment verification fields" });
    }

    // Generate signature to verify
    const secret = process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET;
    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isValid = generatedSignature === razorpay_signature;

    if (!isValid) {
      // Update payment status to failed
      if (supabase) {
        await supabase
          .from("payments")
          .update({ status: "failed", updated_at: new Date().toISOString() })
          .eq("razorpay_order_id", razorpay_order_id);
      }
      return res.status(400).json({ success: false, message: "Payment verification failed. Invalid signature." });
    }

    // Payment is verified! Update records
    if (supabase) {
      // 1. Update payment record
      await supabase
        .from("payments")
        .update({
          razorpay_payment_id,
          razorpay_signature,
          status: "paid",
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("razorpay_order_id", razorpay_order_id);

      // 2. Update booking payment_status
      if (bookingId) {
        await supabase
          .from("bookings")
          .update({
            payment_status: "paid",
            payment_method: "upi",
            updated_at: new Date().toISOString(),
          })
          .eq("id", bookingId);

        // 3. Send email notifications to user and pandit
        const { data: booking } = await supabase
          .from("bookings")
          .select("*, user:user_id(full_name, email), pandit:pandit_id(full_name, email)")
          .eq("id", bookingId)
          .single();

        if (booking) {
          const amountINR = (booking.amount || 0).toLocaleString("en-IN");

          // Email to User
          if (booking.user?.email) {
            const userSubject = "Payment Confirmed — E-Pandit Booking";
            const userMsg = `Dear ${booking.user.full_name},\n\nYour payment of ₹${amountINR} for "${booking.pooja_type}" has been successfully received.\n\nBooking Details:\n• Pandit: ${booking.pandit?.full_name}\n• Date: ${booking.scheduled_date}\n• Time: ${booking.scheduled_time}\n• Payment ID: ${razorpay_payment_id}\n\nThank you for choosing E-Pandit!\n\nRegards,\nTeam E-Pandit`;
            await sendEmail(booking.user.email, userSubject, userMsg);
          }

          // Email to Pandit
          if (booking.pandit?.email) {
            const panditSubject = "Payment Received for Your Booking";
            const panditMsg = `Dear ${booking.pandit.full_name},\n\nPayment of ₹${amountINR} has been received from ${booking.user?.full_name} for "${booking.pooja_type}".\n\nBooking Details:\n• Customer: ${booking.user?.full_name}\n• Date: ${booking.scheduled_date}\n• Time: ${booking.scheduled_time}\n• Address: ${booking.user_address}\n• Payment ID: ${razorpay_payment_id}\n\nPlease ensure you are available for the scheduled date.\n\nRegards,\nTeam E-Pandit`;
            await sendEmail(booking.pandit.email, panditSubject, panditMsg);
          }
        }
      }
    }

    return res.json({
      success: true,
      message: "Payment verified successfully",
      data: { paymentId: razorpay_payment_id, orderId: razorpay_order_id },
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    next(error);
  }
};

// ──────────────────────────────────────────────
// GET /api/payments/booking/:bookingId
// Get payment details for a booking
// ──────────────────────────────────────────────
const getPaymentByBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    if (supabase) {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("booking_id", bookingId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return res.json({ success: true, data: data || null });
    }

    return res.json({ success: true, data: null });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getPaymentByBooking,
};
