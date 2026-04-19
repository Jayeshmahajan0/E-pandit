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
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import ManageAvailabilityModal from "@/components/pandit/ManageAvailabilityModal";

const PanditDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [blockedDates, setBlockedDates] = useState<any[]>([]); // Store full object now
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState<Date>(new Date());

  const incomingBooking = bookings.find(b => b.status === "requested");
  const activeBooking = bookings.find(b => ["accepted", "arriving", "in_progress"].includes(b.status));
  const completedBookings = bookings.filter(b => b.status === "completed");

  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      try {
        const [bookingsRes, availRes] = await Promise.all([
          api.get(`/bookings/pandit/${user.id}`),
          api.get(`/availability/pandit/${user.id}`)
        ]);
        setBookings(bookingsRes.data.data);
        
        // Parse blocked dates from the database (keep full objects for modal)
        setBlockedDates(availRes.data.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // 10s is better for db load
    return () => clearInterval(interval);
  }, [user?.id]);

  const handleDayClick = (day: Date) => {
    setModalDate(day);
    setIsModalOpen(true);
  };

  const handleSaveAvailability = async (payload: any) => {
    try {
      await api.post(`/availability/pandit`, payload);
      toast.success("Availability updated successfully");
      // Fast refresh
      const { data } = await api.get(`/availability/pandit/${user?.id}`);
      setBlockedDates(data.data);
    } catch {
      toast.error("Failed to save availability");
    }
  };

  const handleDeleteAvailability = async () => {
    // For now, setting it to available via POST. In real app, DELETE /api/availability/pandit/:date
    try {
      await api.post(`/availability/pandit`, {
        date: format(modalDate, "yyyy-MM-dd"),
        isFullDay: false,
        slots: [],
        reason: 'personal',
        notes: ''
      });
      toast.success("Day marked as fully available");
      const { data } = await api.get(`/availability/pandit/${user?.id}`);
      setBlockedDates(data.data);
    } catch {
      toast.error("Failed to clear availability");
    }
  };

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

          {/* Availability Calendar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-card rounded-2xl p-6 shadow-card overflow-hidden"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-foreground flex items-center gap-2">
                  <CalendarDays className="w-6 h-6 text-primary" /> Schedule & Availability
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Click any date to manage specific hours or take a full day off.
                </p>
              </div>
              <div className="flex gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-destructive" /> Full Day Off
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-orange-500" /> Partially Busy
                </div>
              </div>
            </div>

            <div className="flex justify-center bg-background rounded-xl border border-border p-2 md:p-6 shadow-inner">
              <Calendar
                mode="single"
                selected={selectedDate}
                onDayClick={(day) => {
                  setSelectedDate(day);
                  handleDayClick(day);
                }}
                className="w-full pointer-events-auto"
                classNames={{
                  months: "w-full",
                  month: "w-full space-y-4",
                  table: "w-full border-collapse space-y-2",
                  head_row: "flex w-full mb-2",
                  head_cell: "text-muted-foreground font-bold w-full text-center text-xs md:text-sm uppercase tracking-wider",
                  row: "flex w-full mt-2 gap-1 md:gap-2",
                  cell: "text-center text-sm p-0 relative focus-within:relative focus-within:z-20 w-full flex-1",
                  day: "h-12 md:h-16 w-full p-0 font-medium hover:bg-secondary rounded-xl transition-all border border-transparent flex items-center justify-center relative",
                  day_selected: "border-primary/50 shadow-md",
                  day_today: "bg-accent/50 text-accent-foreground font-bold border-primary/20",
                  day_outside: "text-muted-foreground opacity-30",
                  day_disabled: "text-muted-foreground opacity-30",
                }}
                disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                modifiers={{
                  blockedFull: blockedDates.filter(d => d.is_full_day).map(d => new Date(d.date)),
                  blockedPartial: blockedDates.filter(d => !d.is_full_day && d.slots?.length > 0).map(d => new Date(d.date))
                }}
                modifiersClassNames={{
                  blockedFull: "bg-destructive/10 text-destructive font-bold border-destructive/20 after:content-[''] after:absolute after:bottom-1 after:md:bottom-2 after:w-1.5 after:h-1.5 after:bg-destructive after:rounded-full",
                  blockedPartial: "bg-orange-500/10 text-orange-700 font-bold border-orange-500/20 after:content-[''] after:absolute after:bottom-1 after:md:bottom-2 after:w-1.5 after:h-1.5 after:bg-orange-500 after:rounded-full"
                }}
              />
            </div>
          </motion.div>

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
      <ManageAvailabilityModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        date={modalDate}
        existingData={blockedDates.find(d => d.date === format(modalDate, "yyyy-MM-dd"))}
        onSave={handleSaveAvailability}
        onDelete={handleDeleteAvailability}
      />
    </Layout>
  );
};

export default PanditDashboardPage;
