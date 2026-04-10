import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Clock, IndianRupee, ChevronRight, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { type BookingData } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";

const statusColors: Record<BookingData["status"], string> = {
  requested: "bg-gold text-foreground",
  accepted: "bg-primary/20 text-primary",
  arriving: "bg-primary text-primary-foreground",
  in_progress: "bg-saffron text-primary-foreground",
  completed: "bg-sacred-green text-primary-foreground",
  cancelled: "bg-destructive text-destructive-foreground",
};

const statusLabels: Record<BookingData["status"], string> = {
  requested: "Requested",
  accepted: "Accepted",
  arriving: "Arriving",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState<"all" | BookingData["status"]>("all");
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    const fetchBookings = async () => {
      try {
        const { data } = await api.get(`/bookings/user/${user.id}`);
        setBookings(data.data);
      } catch (error) {
        console.error("Failed to fetch user bookings");
      }
    };
    fetchBookings();
    const interval = setInterval(fetchBookings, 3000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const filtered = activeTab === "all" ? bookings : bookings.filter((b) => b.status === activeTab);

  return (
    <Layout>
      <section className="container py-8 md:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">My Bookings</h1>
          <p className="text-muted-foreground mb-8">Track and manage your pooja bookings</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Bookings", value: bookings.length, color: "text-primary" },
            { label: "Active", value: bookings.filter((b) => ["requested", "accepted", "arriving", "in_progress"].includes(b.status)).length, color: "text-sacred-green" },
            { label: "Completed", value: bookings.filter((b) => b.status === "completed").length, color: "text-gold" },
            { label: "Total Spent", value: `₹${bookings.filter((b) => b.status === "completed").reduce((s, b) => s + (b.amount || 0), 0).toLocaleString("en-IN")}`, color: "text-primary" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-card rounded-xl p-5 shadow-card"
            >
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
          {(["all", "requested", "accepted", "arriving", "in_progress", "completed", "cancelled"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === tab
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "bg-card text-foreground border border-input"
                }`}
            >
              {tab === "all" ? "All" : statusLabels[tab]}
            </button>
          ))}
        </div>

        {/* Booking cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {filtered.length > 0 ? (
              filtered.map((booking, i) => (
                <Link to={`/booking/${booking.id}`} key={booking.id}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="bg-card rounded-xl p-5 shadow-card flex gap-4 items-center hover:shadow-elevated transition-shadow"
                  >
                    <img
                      src={booking.pandit_id?.avatar_url || "https://images.unsplash.com/photo-1542103749-8ef59b94f47e?auto=format&fit=crop&q=80&w=200"}
                      alt={booking.pandit_id?.full_name || "Pandit"}
                      className="w-14 h-14 md:w-16 md:h-16 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-serif text-base font-semibold text-foreground truncate">
                          {booking.pooja_type}
                        </h3>
                        {booking.status && statusColors[booking.status as keyof typeof statusColors] && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[booking.status as keyof typeof statusColors]}`}>
                            {statusLabels[booking.status as keyof typeof statusLabels]}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{booking.pandit_id?.full_name || "Assigned Pandit"}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" />
                          {booking.scheduled_date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {booking.scheduled_time}
                        </span>
                        <span className="flex items-center gap-1">
                          <IndianRupee className="w-3 h-3" />
                          ₹{booking.amount?.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  </motion.div>
                </Link>
              ))
            ) : (
              <div className="text-center py-16">
                <span className="text-4xl block mb-3"> </span>
                <p className="text-muted-foreground">No bookings in this category</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </section>
    </Layout>
  );
};

export default DashboardPage;
