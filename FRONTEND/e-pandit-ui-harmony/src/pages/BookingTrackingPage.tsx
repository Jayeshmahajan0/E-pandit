import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Phone, MessageSquare, MapPin, IndianRupee, Calendar, Clock, XCircle, Star } from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import BookingStatusStepper from "@/components/booking/BookingStatusStepper";
import LiveTrackingVisual from "@/components/booking/LiveTrackingVisual";
import { getPanditById } from "@/data/mockData";
import api from "@/lib/api";

const BookingTrackingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);

  // Poll for booking status updates
  useEffect(() => {
    if (!id) return;

    const fetchBooking = async () => {
      try {
        const { data } = await api.get(`/bookings/${id}`);
        const fetchedBooking = data.data;

        // Custom message logic when status changes
        if (booking && fetchedBooking.status !== booking.status) {
          const messages: Record<string, string> = {
            accepted: "  Pandit has accepted your booking!",
            arriving: "🚗 Pandit is on the way!",
            in_progress: "🕉️ Pooja has started!",
            completed: "🎉 Pooja completed! Please rate your experience.",
          };
          if (messages[fetchedBooking.status]) {
            toast.success(messages[fetchedBooking.status]);
          }
        }

        setBooking(fetchedBooking);
      } catch (error) {
        console.error("Failed to fetch booking", error);
      }
    };

    fetchBooking();
    const interval = setInterval(fetchBooking, 3000); // poll every 3 seconds

    return () => clearInterval(interval);
  }, [id, booking?.status]);

  if (!booking) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <p className="text-xl">Booking not found</p>
        </div>
      </Layout>
    );
  }

  const pandit = getPanditById(booking.pandit_id);
  const isCancellable = ["requested", "accepted"].includes(booking.status);

  const handleCancel = async () => {
    try {
      await api.put(`/bookings/${id}/cancel`, {
        cancellation_reason: "User requested cancellation"
      });
      setBooking({ ...booking, status: "cancelled", cancelled_by: "user" });
      toast.error("Booking cancelled");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Could not cancel booking");
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-hero">
        <div className="container py-6 md:py-10 max-w-2xl mx-auto space-y-5">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-1">
              Booking Tracking
            </h1>
            <p className="text-sm text-muted-foreground">ID: {booking.id}</p>
          </motion.div>

          {/* Status stepper */}
          {booking.status !== "cancelled" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-2xl p-5 shadow-card"
            >
              <BookingStatusStepper currentStatus={booking.status} />
            </motion.div>
          )}

          {/* Cancelled state */}
          {booking.status === "cancelled" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-destructive/10 border border-destructive/30 rounded-2xl p-6 text-center"
            >
              <XCircle className="w-12 h-12 text-destructive mx-auto mb-2" />
              <p className="font-bold text-destructive text-lg">Booking Cancelled</p>
              <p className="text-sm text-muted-foreground mt-1">
                {booking.cancelledBy === "user" ? "You cancelled this booking" : "The pandit couldn't attend"}
              </p>
            </motion.div>
          )}

          {/* Live tracking */}
          {booking.status !== "cancelled" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <LiveTrackingVisual status={booking.status} panditName={booking.panditName} />
            </motion.div>
          )}

          {/* Pandit info card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-2xl p-5 shadow-card"
          >
            <h3 className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">Your Pandit</h3>
            <div className="flex items-center gap-4">
              <img
                src={pandit?.image || booking.pandit_id?.avatar_url || "https://images.unsplash.com/photo-1542103749-8ef59b94f47e?auto=format&fit=crop&q=80&w=200"}
                alt={booking.pandit_id?.full_name || "Pandit"}
                className="w-16 h-16 rounded-xl object-cover"
              />
              <div className="flex-1">
                <h4 className="font-serif font-bold text-foreground">{booking.pandit_id?.full_name || "Assigned Pandit"}</h4>
                {pandit && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <Star className="w-3 h-3 text-primary fill-primary" />
                    {pandit.rating} • {pandit.experience}yr exp
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <a
                  href={`tel:+91${booking.pandit_id?.phone}`}
                  className="w-10 h-10 bg-sacred-green rounded-full flex items-center justify-center text-white"
                >
                  <Phone className="w-4 h-4" />
                </a>
                <button className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white">
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Booking details */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card rounded-2xl p-5 shadow-card space-y-3"
          >
            <h3 className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Booking Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted/50 rounded-xl">
                <p className="text-xs text-muted-foreground mb-0.5">Pooja Type</p>
                <p className="font-semibold text-sm text-foreground">{booking.pooja_type}</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-xl">
                <p className="text-xs text-muted-foreground mb-0.5">Amount</p>
                <p className="font-bold text-sm text-primary flex items-center gap-1">
                  <IndianRupee className="w-3.5 h-3.5" />₹{booking.amount?.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="p-3 bg-muted/50 rounded-xl">
                <p className="text-xs text-muted-foreground mb-0.5">Date</p>
                <p className="font-semibold text-sm text-foreground flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  {booking.scheduled_date}
                </p>
              </div>
              <div className="p-3 bg-muted/50 rounded-xl">
                <p className="text-xs text-muted-foreground mb-0.5">Time</p>
                <p className="font-semibold text-sm text-foreground flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  {booking.scheduled_time}
                </p>
              </div>
            </div>
            <div className="p-3 bg-muted/50 rounded-xl">
              <p className="text-xs text-muted-foreground mb-0.5">Address</p>
              <p className="text-sm text-foreground flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                {booking.user_address}
              </p>
            </div>
            <div className="p-3 bg-muted/50 rounded-xl">
              <p className="text-xs text-muted-foreground mb-0.5">Payment</p>
              <p className="text-sm text-foreground">
                {booking.payment_method?.toUpperCase()} — <span className={booking.payment_status === "paid" ? "text-sacred-green" : "text-gold"}>{booking.payment_status}</span>
              </p>
            </div>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex gap-3"
          >
            {isCancellable && (
              <button
                onClick={handleCancel}
                className="flex-1 py-3 border-2 border-destructive text-destructive rounded-xl font-bold text-sm hover:bg-destructive/10 transition-colors"
              >
                Cancel Booking
              </button>
            )}
            {booking.status === "completed" && (
              <button
                onClick={() => navigate(`/review/${booking.id}`)}
                className="flex-1 py-3 bg-gradient-saffron text-primary-foreground rounded-xl font-bold text-sm shadow-soft hover:shadow-glow transition-all flex items-center justify-center gap-2"
              >
                <Star className="w-4 h-4" /> Rate Your Experience
              </button>
            )}
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default BookingTrackingPage;
