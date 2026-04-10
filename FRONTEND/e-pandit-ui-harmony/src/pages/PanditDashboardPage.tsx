import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IndianRupee, CalendarDays, TrendingUp, Clock, History } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import IncomingBookingCard from "@/components/pandit/IncomingBookingCard";
import ActiveBookingCard from "@/components/pandit/ActiveBookingCard";
import OrnamentDivider from "@/components/shared/OrnamentDivider";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";

const PanditDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);

  const incomingBooking = bookings.find(b => b.status === "requested");
  const activeBooking = bookings.find(b => ["accepted", "arriving", "in_progress"].includes(b.status));
  const completedBookings = bookings.filter(b => b.status === "completed");

  useEffect(() => {
    if (!user?.id) return;

    const fetchBookings = async () => {
      try {
        const { data } = await api.get(`/bookings/pandit/${user.id}`);
        setBookings(data.data);
      } catch (error) {
        console.error("Failed to fetch dashboard bookings");
      }
    };

    fetchBookings();
    const interval = setInterval(fetchBookings, 3000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const handleAcceptBooking = async (id: string) => {
    try {
      await api.put(`/bookings/${id}/accept`);
      toast.success("Booking accepted!  ");
      // Fast refresh
      if (user?.id) {
        const { data } = await api.get(`/bookings/pandit/${user.id}`);
        setBookings(data.data);
      }
    } catch {
      toast.error("Failed to accept booking.");
    }
  };

  const handleRejectBooking = async (id: string) => {
    try {
      await api.put(`/bookings/${id}/reject`);
      toast.info("Booking rejected");
      if (user?.id) {
        const { data } = await api.get(`/bookings/pandit/${user.id}`);
        setBookings(data.data);
      }
    } catch {
      toast.error("Failed to reject booking.");
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    if (!activeBooking) return;

    try {
      await api.put(`/bookings/${id}/status`, { status });
      const messages: Record<string, string> = {
        arriving: "📍 You're now heading to the customer",
        in_progress: "🕉️ Pooja has started",
        completed: "🎉 Pooja completed! Great work!",
      };
      toast.success(messages[status] || "Status updated");
      if (user?.id) {
        const { data } = await api.get(`/bookings/pandit/${user.id}`);
        setBookings(data.data);
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  // Stats
  const totalEarnings = completedBookings.reduce((sum, b) => sum + (b.amount || 0), 0);
  const completedToday = completedBookings.length; // Approximate
  const totalCompleted = completedBookings.length;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-hero">
        <div className="container py-6 md:py-10 max-w-2xl mx-auto space-y-5">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-1">
              Pandit Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">Manage your bookings and availability</p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-3 gap-3"
          >
            {[
              { label: "Today's Earnings", value: `₹${(totalEarnings / 2).toLocaleString("en-IN")}`, icon: IndianRupee, color: "text-primary" },
              { label: "Today's Bookings", value: completedToday.toString(), icon: CalendarDays, color: "text-sacred-green" },
              { label: "Total Completed", value: totalCompleted.toString(), icon: TrendingUp, color: "text-gold" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="bg-card rounded-xl p-4 shadow-card"
              >
                <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Incoming booking */}
          <AnimatePresence>
            {incomingBooking && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <IncomingBookingCard
                  booking={{
                    id: incomingBooking.id,
                    userName: incomingBooking.user?.full_name || incomingBooking.user_name || "Guest User",
                    poojaType: incomingBooking.pooja_type,
                    userAddress: incomingBooking.user_address || "Address not provided",
                    amount: incomingBooking.amount,
                    scheduledDate: incomingBooking.scheduled_date,
                    scheduledTime: incomingBooking.scheduled_time,
                  }}
                  onAccept={handleAcceptBooking}
                  onReject={handleRejectBooking}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active booking */}
          <AnimatePresence>
            {activeBooking && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <ActiveBookingCard
                  booking={{
                    id: activeBooking.id,
                    userName: activeBooking.user?.full_name || activeBooking.user_name || "Guest User",
                    userPhone: activeBooking.user?.phone || activeBooking.user_phone || "9999999999",
                    poojaType: activeBooking.pooja_type,
                    userAddress: activeBooking.user_address || "Address not provided",
                    amount: activeBooking.amount,
                    status: activeBooking.status,
                  }}
                  onUpdateStatus={handleUpdateStatus}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <OrnamentDivider />

          {/* Recent bookings */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="font-serif text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <History className="w-5 h-5 text-primary" /> Recent Bookings
            </h2>
            <div className="space-y-3">
              {completedBookings
                .slice(0, 5)
                .map((booking, i) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + i * 0.05 }}
                    className="bg-card rounded-xl p-4 shadow-card flex items-center gap-3 cursor-pointer hover:shadow-elevated transition-shadow"
                  >
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg">
                      🕉️
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{booking.pooja_type}</p>
                      <p className="text-xs text-muted-foreground">{booking.user_id?.full_name || "User"} • {booking.scheduled_date}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-primary">₹{booking.amount?.toLocaleString("en-IN")}</p>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${booking.status === "completed"
                          ? "bg-sacred-green/20 text-sacred-green"
                          : booking.status === "arriving"
                            ? "bg-primary/20 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}>
                        {booking.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default PanditDashboardPage;
