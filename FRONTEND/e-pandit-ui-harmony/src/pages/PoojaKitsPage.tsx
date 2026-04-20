import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Plus, Minus, X, MapPin, Loader2, Check, Phone, Navigation, PackagePlus } from "lucide-react";
import Layout from "@/components/layout/Layout";
import AnimatedCTAButton from "@/components/shared/AnimatedCTAButton";
import { poojaCategories } from "@/data/mockData";
import { indianStates } from "@/data/locationData";
import api from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface SamagriItem {
  id: string;
  name: string;
  pooja_type: string;
  price: number;
  description: string;
  image_url: string;
  vendor_id: string;
  vendor?: {
    id: string;
    full_name: string;
    district: string;
    phone: string;
  };
}

interface CartItem extends SamagriItem {
  qty: number;
}

const PoojaKitsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isVendor = user?.role === "vendor";
  const [items, setItems] = useState<SamagriItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [selectedState, setSelectedState] = useState("Maharashtra");
  const [selectedDistrict, setSelectedDistrict] = useState("Pune");
  const [selectedPooja, setSelectedPooja] = useState("All");

  const currentStateData = indianStates.find((s) => s.name === selectedState);
  const districts = currentStateData?.districts.map((d) => d.name) || [];

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  
  // Checkout form
  const [address, setAddress] = useState("");
  const [userPhone, setUserPhone] = useState((user as any)?.phone || "");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState<any>(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      let url = `/samagri?district=${selectedDistrict}`;
      if (selectedPooja !== "All") {
        url += `&poojaType=${selectedPooja}`;
      }
      const res = await api.get(url);
      setItems(res.data.data);
    } catch (err) {
      toast.error("Failed to load samagri kits");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [selectedDistrict, selectedPooja]);

  const addToCart = (item: SamagriItem) => {
    if (cart.length > 0 && cart[0].vendor_id !== item.vendor_id) {
      toast.error("You can only order items from one vendor at a time. Please clear your cart first.");
      return;
    }

    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) return prev.map((c) => (c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
      return [...prev, { ...item, qty: 1 }];
    });
    setCartOpen(true);
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((c) => (c.id === id ? { ...c, qty: Math.max(0, c.qty + delta) } : c)).filter((c) => c.qty > 0)
    );
  };

  const totalItems = cart.reduce((s, c) => s + c.qty, 0);
  const totalPrice = cart.reduce((s, c) => s + c.price * c.qty, 0);

  const handleCheckoutClick = () => {
    if (!user) {
      toast.error("Please sign in to place an order");
      return;
    }
    if (!userPhone && (user as any)?.phone) setUserPhone((user as any)?.phone);
    setCartOpen(false);
    setShowCheckout(true);
  };

  const handleGetCurrentLocation = () => {
    if ("geolocation" in navigator) {
      toast.info("Fetching your location...");
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
            const data = await res.json();
            if (data && data.display_name) {
              setAddress(data.display_name);
              toast.success("Location fetched successfully");
            }
          } catch (error) {
            toast.error("Failed to fetch address details");
          }
        },
        () => {
          toast.error("Permission denied or failed to get location");
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      toast.error("Please enter a shipping address");
      return;
    }
    
    if (totalPrice < 500 && paymentMethod === "cod") {
      toast.error("COD is only available for orders ₹500 or more.");
      return;
    }

    setIsProcessing(true);
    try {
      const vendorId = cart[0].vendor_id;
      const orderItems = cart.map(c => ({ id: c.id, qty: c.qty, price: c.price }));
      
      const payload = {
        vendorId,
        items: orderItems,
        totalAmount: totalPrice,
        paymentMethod,
        shippingAddress: address,
        userPhone: userPhone || "9876543210"
      };

      const res = await api.post("/samagri/orders", payload);
      const newOrder = res.data.data;
      
      // Clear cart
      setCart([]);
      
      // Show confirmation
      setOrderComplete({
        id: newOrder.id,
        vendor: cart[0].vendor
      });
      
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to place order");
    } finally {
      setIsProcessing(false);
    }
  };

  // If order complete, show confirmation
  if (orderComplete) {
    return (
      <Layout>
        <div className="container py-20 flex flex-col items-center justify-center min-h-[70vh]">
          <div className="w-20 h-20 bg-sacred-green/20 text-sacred-green rounded-full flex items-center justify-center mb-6">
            <Check className="w-10 h-10" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-foreground mb-4">Order Placed Successfully!</h1>
          <p className="text-muted-foreground text-center max-w-md mb-8">
            Your pooja samagri order has been sent to the vendor. They will prepare it for you shortly.
          </p>
          
          <div className="bg-card p-6 rounded-2xl shadow-card border border-border w-full max-w-md mb-8">
            <h3 className="font-semibold text-lg mb-4 border-b border-border pb-2">Vendor Details</h3>
            <p className="font-medium text-foreground">{orderComplete.vendor?.full_name}</p>
            <p className="text-muted-foreground mt-2 flex items-center gap-2"><MapPin className="w-4 h-4"/> {orderComplete.vendor?.district}</p>
            <p className="text-muted-foreground mt-2 flex items-center gap-2"><Phone className="w-4 h-4"/> {orderComplete.vendor?.phone}</p>
            <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm">
              Please contact the vendor directly for delivery timing or pickup coordination.
            </div>
          </div>
          
          <AnimatedCTAButton onClick={() => setOrderComplete(null)}>
            Continue Shopping
          </AnimatedCTAButton>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="container py-8 md:py-12">
        <div className="flex items-start justify-between mb-8 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">
              Pooja Samagri
            </h1>
            <p className="text-muted-foreground">Get complete pooja kits from local vendors</p>
          </motion.div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Permanent vendor button — always visible when logged in as vendor */}
            {isVendor && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => navigate("/vendor/dashboard")}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors shadow-soft"
              >
                <PackagePlus className="w-4 h-4" />
                Add Samagri
              </motion.button>
            )}

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setCartOpen(!cartOpen)}
              className="relative p-3 bg-card rounded-xl shadow-card hover:bg-muted transition-colors"
            >
              <ShoppingCart className="w-6 h-6 text-foreground" />
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold"
                >
                  {totalItems}
                </motion.span>
              )}
            </motion.button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card p-5 rounded-2xl shadow-card border border-border mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">State</label>
            <select
              value={selectedState}
              onChange={(e) => { setSelectedState(e.target.value); setSelectedDistrict(""); }}
              className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-sm"
            >
              {indianStates.map((s) => (
                <option key={s.name} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">District</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-sm"
            >
              <option value="">Select District</option>
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Pooja Type</label>
            <select
              value={selectedPooja}
              onChange={(e) => setSelectedPooja(e.target.value)}
              className="w-full px-4 py-2.5 border border-border rounded-xl bg-background text-sm"
            >
              {poojaCategories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Products */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-border">
            <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground opacity-30 mb-4" />
            <h3 className="text-lg font-medium">No samagri kits found</h3>
            <p className="text-muted-foreground mt-2">Try changing your location or pooja type</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {items.map((kit, i) => (
              <motion.div
                key={kit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className="bg-card rounded-xl overflow-hidden shadow-card hover:shadow-elevated transition-all border border-border flex flex-col"
              >
                <div className="aspect-square relative bg-muted">
                  <img src={kit.image_url} alt={kit.name} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-semibold">
                    {kit.pooja_type}
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-center gap-1.5 mb-2 text-xs text-muted-foreground bg-secondary w-fit px-2 py-1 rounded-md">
                    <MapPin className="w-3 h-3" /> {kit.vendor?.district} ({kit.vendor?.full_name})
                  </div>
                  <h3 className="font-serif text-base font-semibold text-foreground mb-1 line-clamp-1">{kit.name}</h3>
                  <p className="text-xs text-muted-foreground mb-4 line-clamp-2 flex-1">{kit.description}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-lg font-bold text-foreground">₹{kit.price}</span>
                    <AnimatedCTAButton size="sm" onClick={() => addToCart(kit)}>
                      Add to Cart
                    </AnimatedCTAButton>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Cart drawer */}
        {cartOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            className="fixed inset-y-0 right-0 w-full max-w-sm bg-card border-l border-border shadow-elevated z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-serif text-lg font-semibold text-foreground">Your Cart</h3>
              <button onClick={() => setCartOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            
            {cart.length > 0 && (
              <div className="px-5 py-3 bg-secondary/50 border-b border-border text-xs text-muted-foreground flex items-center justify-between">
                <span>Sold by: <span className="font-semibold text-foreground">{cart[0].vendor?.full_name}</span></span>
                <button onClick={() => setCart([])} className="text-destructive hover:underline">Clear</button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <p className="text-muted-foreground text-center py-12">Your cart is empty</p>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex gap-3 bg-background border border-border rounded-lg p-3">
                    <img src={item.image_url} alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-muted" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground line-clamp-1">{item.name}</p>
                      <p className="text-sm text-primary font-semibold mt-1">₹{item.price}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => updateQty(item.id, -1)} className="p-1 bg-muted rounded hover:bg-secondary transition-colors">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-medium text-foreground w-4 text-center">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="p-1 bg-muted rounded hover:bg-secondary transition-colors">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {cart.length > 0 && (
              <div className="p-5 border-t border-border bg-background">
                <div className="flex justify-between text-sm mb-4">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="font-bold text-foreground text-lg">₹{totalPrice}</span>
                </div>
                <AnimatedCTAButton size="lg" className="w-full" onClick={handleCheckoutClick}>
                  Proceed to Checkout
                </AnimatedCTAButton>
              </div>
            )}
          </motion.div>
        )}

        {/* Checkout Modal */}
        <AnimatePresence>
          {showCheckout && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card w-full max-w-lg rounded-3xl shadow-elevated border border-border overflow-hidden flex flex-col max-h-[90vh]"
              >
                <div className="p-5 border-b border-border flex justify-between items-center bg-muted/30">
                  <h2 className="font-serif text-xl font-bold">Checkout</h2>
                  <button onClick={() => setShowCheckout(false)} className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"><X className="w-5 h-5"/></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="bg-secondary/30 p-4 rounded-xl mb-6">
                    <h3 className="font-semibold text-sm mb-2">Order Summary ({totalItems} items)</h3>
                    <div className="flex justify-between items-center text-lg font-bold text-primary">
                      <span>Total to Pay:</span>
                      <span>₹{totalPrice}</span>
                    </div>
                  </div>

                  <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Contact Number *</label>
                      <input
                        required
                        type="tel"
                        value={userPhone}
                        onChange={(e) => setUserPhone(e.target.value)}
                        placeholder="Enter 10-digit mobile number"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Shipping Address *</label>
                        <button 
                          type="button" 
                          onClick={handleGetCurrentLocation}
                          className="text-xs text-primary flex items-center gap-1 font-medium hover:underline bg-primary/5 px-2 py-1 rounded-md"
                        >
                          <Navigation className="w-3 h-3" /> Use Current Location
                        </button>
                      </div>
                      <textarea
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter full address with landmark"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none h-24"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center justify-between">
                        Payment Method
                        {totalPrice < 500 && <span className="text-xs text-orange-500 font-normal ml-2">COD available for ₹500+</span>}
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("upi")}
                          className={`p-3 rounded-xl border text-sm font-medium transition-all ${paymentMethod === "upi" ? "border-primary bg-primary/5 text-primary" : "border-border bg-background text-muted-foreground hover:border-primary/50"}`}
                        >
                          Pay via UPI
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("cod")}
                          disabled={totalPrice < 500}
                          className={`p-3 rounded-xl border text-sm font-medium transition-all ${totalPrice < 500 ? "opacity-50 cursor-not-allowed bg-muted" : paymentMethod === "cod" ? "border-primary bg-primary/5 text-primary" : "border-border bg-background text-muted-foreground hover:border-primary/50"}`}
                        >
                          Cash on Delivery
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
                
                <div className="p-6 border-t border-border bg-background">
                  <AnimatedCTAButton 
                    type="submit" 
                    form="checkout-form"
                    disabled={isProcessing} 
                    className="w-full"
                  >
                    {isProcessing ? "Processing..." : `Place Order • ₹${totalPrice}`}
                  </AnimatedCTAButton>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </section>
    </Layout>
  );
};

export default PoojaKitsPage;
