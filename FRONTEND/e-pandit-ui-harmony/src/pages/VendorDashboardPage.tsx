import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Package, ShoppingBag, Loader2, Search, Trash2, X } from "lucide-react";
import Layout from "@/components/layout/Layout";
import AnimatedCTAButton from "@/components/shared/AnimatedCTAButton";
import { poojaCategories } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface SamagriItem {
  id: string;
  name: string;
  pooja_type: string;
  price: number;
  description: string;
  image_url: string;
}

interface OrderItem {
  id: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  shipping_address: string;
  user_phone: string;
  created_at: string;
  samagri_order_items: {
    quantity: number;
    price_at_time: number;
    samagri_items: {
      name: string;
      image_url: string;
    };
  }[];
  user: {
    full_name: string;
    email: string;
  };
}

const VendorDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"items" | "orders">("items");
  const [items, setItems] = useState<SamagriItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [newItemName, setNewItemName] = useState("");
  const [newItemPoojaType, setNewItemPoojaType] = useState(poojaCategories[1] || "");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemImage, setNewItemImage] = useState("");

  useEffect(() => {
    if (user?.role !== "vendor") {
      navigate("/");
      return;
    }
    fetchData();
  }, [activeTab, user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "items") {
        const res = await api.get("/samagri/vendor");
        setItems(res.data.data);
      } else {
        const res = await api.get("/samagri/orders/vendor");
        setOrders(res.data.data);
      }
    } catch (err) {
      toast.error(`Failed to fetch ${activeTab}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemPrice || !newItemPoojaType) {
      toast.error("Please fill required fields");
      return;
    }
    try {
      setLoading(true);
      await api.post("/samagri/vendor", {
        name: newItemName,
        poojaType: newItemPoojaType,
        price: Number(newItemPrice),
        description: newItemDesc,
        imageUrl: newItemImage || "https://images.unsplash.com/photo-1621258661642-1fc558f6004b?w=400&q=80",
      });
      toast.success("Item added successfully");
      setShowAddModal(false);
      setNewItemName("");
      setNewItemPrice("");
      setNewItemDesc("");
      fetchData();
    } catch (err) {
      toast.error("Failed to add item");
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await api.delete(`/samagri/vendor/${id}`);
      toast.success("Item deleted");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete item");
    }
  };

  const handleUpdateOrderStatus = async (id: string, newStatus: string) => {
    try {
      await api.put(`/samagri/orders/${id}/status`, { orderStatus: newStatus });
      toast.success("Order status updated");
      fetchData();
    } catch (err) {
      toast.error("Failed to update order status");
    }
  };

  return (
    <Layout>
      <section className="container py-8 md:py-12 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">
              Vendor Dashboard
            </h1>
            <p className="text-muted-foreground">Manage your pooja samagri catalog and orders</p>
          </motion.div>
          {activeTab === "items" && (
            <AnimatedCTAButton onClick={() => setShowAddModal(true)} className="w-full md:w-auto flex items-center justify-center gap-2">
              <Plus className="w-5 h-5" /> Add Samagri Item
            </AnimatedCTAButton>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-border pb-px">
          <button
            onClick={() => setActiveTab("items")}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === "items" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Package className="w-5 h-5" /> My Products
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === "orders" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <ShoppingBag className="w-5 h-5" /> Orders
          </button>
        </div>

        {/* Content */}
        <div className="min-h-[400px]">
          {loading && !showAddModal ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : activeTab === "items" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-card rounded-2xl border border-border shadow-card">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium text-foreground">No products found</p>
                  <p className="text-muted-foreground text-sm mt-1 mb-6">Add your first pooja samagri kit to start selling</p>
                  <AnimatedCTAButton onClick={() => setShowAddModal(true)}>Add First Product</AnimatedCTAButton>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={item.id}
                    className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-all border border-border"
                  >
                    <div className="aspect-video w-full bg-muted relative">
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-semibold">
                        {item.pooja_type}
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-serif font-bold text-lg text-foreground line-clamp-1">{item.name}</h3>
                        <span className="font-bold text-primary">₹{item.price}</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">{item.description}</p>
                      <div className="flex justify-end pt-4 border-t border-border">
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-destructive flex items-center gap-1.5 text-sm font-medium hover:bg-destructive/10 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-20 bg-card rounded-2xl border border-border shadow-card">
                  <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium text-foreground">No orders yet</p>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="bg-card rounded-2xl shadow-card border border-border p-5">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6 border-b border-border pb-4">
                      <div>
                        <span className="text-xs font-semibold text-primary mb-1 block">ORDER #{order.id.split('-')[0].toUpperCase()}</span>
                        <h3 className="font-semibold text-foreground">{order.user.full_name}</h3>
                        <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()} • {order.user_phone} • {order.user.email}</p>
                        <p className="text-sm text-muted-foreground mt-2 max-w-sm"><span className="font-medium">Deliver to:</span> {order.shipping_address}</p>
                      </div>
                      <div className="flex flex-col md:items-end gap-2">
                        <span className="text-2xl font-bold text-foreground">₹{order.total_amount}</span>
                        <div className="flex gap-2 text-xs">
                          <span className={`px-2 py-1 rounded-full border ${order.payment_status === 'paid' ? 'bg-sacred-green/10 text-sacred-green border-sacred-green/20' : 'bg-gold/10 text-gold border-gold/20'}`}>
                            {order.payment_method.toUpperCase()} • {order.payment_status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-semibold mb-3">Items</h4>
                        <div className="space-y-3">
                          {order.samagri_order_items.map((oi, i) => (
                            <div key={i} className="flex gap-3 items-center">
                              <img src={oi.samagri_items.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                              <div>
                                <p className="text-sm font-medium">{oi.samagri_items.name}</p>
                                <p className="text-xs text-muted-foreground">{oi.quantity} x ₹{oi.price_at_time}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="bg-secondary/30 p-4 rounded-xl">
                        <h4 className="text-sm font-semibold mb-3">Update Status</h4>
                        <select
                          value={order.order_status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className="w-full p-2.5 rounded-lg border border-border bg-background text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                        >
                          <option value="placed">Placed (Pending)</option>
                          <option value="accepted">Accepted (Processing)</option>
                          <option value="shipped">Shipped (Out for delivery)</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </section>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card w-full max-w-lg rounded-2xl shadow-elevated border border-border overflow-hidden"
          >
            <div className="p-5 border-b border-border flex justify-between items-center bg-muted/30">
              <h2 className="font-serif text-xl font-bold">Add Samagri Kit</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleAddItem} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Kit Name *</label>
                <input required value={newItemName} onChange={e=>setNewItemName(e.target.value)} placeholder="e.g. Premium Ganesh Pooja Kit" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Related Pooja *</label>
                  <select required value={newItemPoojaType} onChange={e=>setNewItemPoojaType(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none">
                    {poojaCategories.filter(c => c !== "All").map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Price (₹) *</label>
                  <input required type="number" min="1" value={newItemPrice} onChange={e=>setNewItemPrice(e.target.value)} placeholder="500" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Image URL</label>
                <input value={newItemImage} onChange={e=>setNewItemImage(e.target.value)} placeholder="https://..." className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Description</label>
                <textarea rows={3} value={newItemDesc} onChange={e=>setNewItemDesc(e.target.value)} placeholder="List all items included in the kit..." className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none resize-none" />
              </div>
              <div className="pt-4 border-t border-border">
                <AnimatedCTAButton type="submit" disabled={loading} className="w-full">
                  {loading ? "Adding..." : "Add Kit to Store"}
                </AnimatedCTAButton>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </Layout>
  );
};

export default VendorDashboardPage;
