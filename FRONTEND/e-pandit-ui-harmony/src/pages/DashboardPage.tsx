import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Clock, IndianRupee, ChevronRight, MapPin, Package, ShoppingBag, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { type BookingData } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { toast } from "sonner";

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

const samagriStatusColors: Record<string, string> = {
  placed: "bg-gold text-foreground",
  accepted: "bg-primary/20 text-primary",
  shipped: "bg-saffron text-primary-foreground",
  delivered: "bg-sacred-green text-primary-foreground",
  cancelled: "bg-destructive text-destructive-foreground",
};

const samagriStatusLabels: Record<string, string> = {
  placed: "Placed (Pending)",
  accepted: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const DashboardPage = () => {
  const [viewMode, setViewMode] = useState<"pandit" | "samagri">("pandit");
  const [activeTab, setActiveTab] = useState<"all" | BookingData["status"] | string>("all");
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [samagriOrders, setSamagriOrders] = useState<any[]>([]);

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

    const fetchSamagriOrders = async () => {
      try {
        const { data } = await api.get(`/samagri/orders/user`);
        setSamagriOrders(data.data);
      } catch (error) {
        console.error("Failed to fetch samagri orders");
      }
    };

    if (viewMode === "pandit") {
      fetchBookings();
    } else {
      fetchSamagriOrders();
    }
    
    const interval = setInterval(() => {
      if (viewMode === "pandit") fetchBookings();
      else fetchSamagriOrders();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [user?.id, viewMode]);

  const filteredBookings = activeTab === "all" ? bookings : bookings.filter((b) => b.status === activeTab);
  const filteredOrders = activeTab === "all" ? samagriOrders : samagriOrders.filter((o) => o.order_status === activeTab);

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    try {
      await api.put(`/samagri/orders/user/${orderId}/cancel`);
      toast.success("Order cancelled successfully");
      
      // Refresh
      const { data } = await api.get(`/samagri/orders/user`);
      setSamagriOrders(data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to cancel order");
    }
  };

  return (
    <Layout>
      <section className="container py-8 md:py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">My Dashboard</h1>
            <p className="text-muted-foreground">Track and manage your bookings and orders</p>
          </motion.div>
          
          <div className="flex bg-secondary/30 p-1 rounded-xl w-full md:w-auto self-start">
            <button
              onClick={() => { setViewMode("pandit"); setActiveTab("all"); }}
              className={`flex-1 md:w-48 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                viewMode === "pandit" ? "bg-background shadow-soft text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Pandit Bookings
            </button>
            <button
              onClick={() => { setViewMode("samagri"); setActiveTab("all"); }}
              className={`flex-1 md:w-48 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                viewMode === "samagri" ? "bg-background shadow-soft text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Samagri Orders
            </button>
          </div>
        </div>

        {/* Stats */}
        {viewMode === "pandit" ? (
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
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Orders", value: samagriOrders.length, color: "text-primary" },
              { label: "Active", value: samagriOrders.filter((o) => ["placed", "accepted", "shipped"].includes(o.order_status)).length, color: "text-sacred-green" },
              { label: "Delivered", value: samagriOrders.filter((o) => o.order_status === "delivered").length, color: "text-gold" },
              { label: "Total Spent", value: `₹${samagriOrders.filter((o) => o.order_status === "delivered" || o.payment_status === "paid").reduce((s, o) => s + (o.total_amount || 0), 0).toLocaleString("en-IN")}`, color: "text-primary" },
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
        )}

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
          {viewMode === "pandit" ? (
            (["all", "requested", "accepted", "arriving", "in_progress", "completed", "cancelled"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === tab
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "bg-card text-foreground border border-input hover:bg-muted"
                  }`}
              >
                {tab === "all" ? "All" : statusLabels[tab]}
              </button>
            ))
          ) : (
            (["all", "placed", "accepted", "shipped", "delivered", "cancelled"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === tab
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "bg-card text-foreground border border-input hover:bg-muted"
                  }`}
              >
                {tab === "all" ? "All" : samagriStatusLabels[tab]}
              </button>
            ))
          )}
        </div>

        {/* Lists */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${viewMode}-${activeTab}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {viewMode === "pandit" ? (
              filteredBookings.length > 0 ? (
                filteredBookings.map((booking, i) => (
                  <Link to={`/booking/${booking.id}`} key={booking.id}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-card rounded-xl p-5 shadow-card flex gap-4 items-center hover:shadow-elevated transition-shadow mb-4"
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
                <div className="text-center py-16 bg-card rounded-2xl border border-border shadow-card">
                  <CalendarDays className="w-12 h-12 text-muted-foreground opacity-50 mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">No pandit bookings in this category</p>
                </div>
              )
            ) : (
              filteredOrders.length > 0 ? (
                filteredOrders.map((order, i) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-card rounded-xl p-5 shadow-card hover:shadow-elevated transition-shadow mb-4 border border-border"
                  >
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-serif text-base font-semibold text-foreground truncate">
                            Order #{order.id.split('-')[0].toUpperCase()}
                          </h3>
                          {order.order_status && samagriStatusColors[order.order_status] && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${samagriStatusColors[order.order_status]}`}>
                              {samagriStatusLabels[order.order_status]}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1"><span className="font-medium">Vendor:</span> {order.vendor?.full_name}</p>
                        <p className="text-sm text-muted-foreground mb-3"><span className="font-medium">Total:</span> ₹{order.total_amount} ({order.payment_method.toUpperCase()})</p>
                        
                        <div className="bg-secondary/30 rounded-lg p-3 space-y-2">
                          {order.samagri_order_items?.map((oi: any, idx: number) => (
                            <div key={idx} className="flex gap-3 items-center">
                              <img src={oi.samagri_items?.image_url} alt="" className="w-10 h-10 rounded-md object-cover" />
                              <div className="flex-1">
                                <p className="text-xs font-medium line-clamp-1">{oi.samagri_items?.name}</p>
                                <p className="text-xs text-muted-foreground">Qty: {oi.quantity} • ₹{oi.price_at_time}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {order.order_status === "placed" && (
                        <div className="flex md:flex-col justify-end items-end gap-2 pt-2 md:pt-0">
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-destructive bg-destructive/10 rounded-lg hover:bg-destructive/20 transition-colors"
                          >
                            <XCircle className="w-4 h-4" /> Cancel Order
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-16 bg-card rounded-2xl border border-border shadow-card">
                  <ShoppingBag className="w-12 h-12 text-muted-foreground opacity-50 mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">No samagri orders in this category</p>
                </div>
              )
            )}
          </motion.div>
        </AnimatePresence>
      </section>
    </Layout>
  );
};

export default DashboardPage;
