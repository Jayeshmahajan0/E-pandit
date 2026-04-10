import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Plus, Minus, X } from "lucide-react";
import Layout from "@/components/layout/Layout";
import AnimatedCTAButton from "@/components/shared/AnimatedCTAButton";
import { mockPoojaKits, type PoojaKitItem } from "@/data/mockData";

interface CartItem extends PoojaKitItem {
  qty: number;
}

const PoojaKitsPage = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  const addToCart = (item: PoojaKitItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) return prev.map((c) => (c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((c) => (c.id === id ? { ...c, qty: Math.max(0, c.qty + delta) } : c)).filter((c) => c.qty > 0)
    );
  };

  const totalItems = cart.reduce((s, c) => s + c.qty, 0);
  const totalPrice = cart.reduce((s, c) => s + c.price * c.qty, 0);

  return (
    <Layout>
      <section className="container py-8 md:py-12">
        <div className="flex items-start justify-between mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">
              Pooja Kits
            </h1>
            <p className="text-muted-foreground">Complete samagri sets delivered to your door</p>
          </motion.div>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setCartOpen(!cartOpen)}
            className="relative p-3 bg-card rounded-xl shadow-card"
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {mockPoojaKits.map((kit, i) => (
            <motion.div
              key={kit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="bg-card rounded-xl overflow-hidden shadow-card hover:shadow-elevated transition-shadow"
            >
              <img src={kit.image} alt={kit.name} className="w-full aspect-square object-cover" />
              <div className="p-4">
                <span className="text-xs text-primary font-medium">{kit.category}</span>
                <h3 className="font-serif text-base font-semibold text-foreground mt-1 mb-1">{kit.name}</h3>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{kit.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-foreground">₹{kit.price}</span>
                  <AnimatedCTAButton size="sm" onClick={() => addToCart(kit)}>
                    Add to Cart
                  </AnimatedCTAButton>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

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
              <button onClick={() => setCartOpen(false)}>
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Your cart is empty</p>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex gap-3 bg-secondary rounded-lg p-3">
                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{item.name}</p>
                      <p className="text-sm text-primary font-semibold">₹{item.price}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <button onClick={() => updateQty(item.id, -1)} className="p-1 bg-card rounded">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-medium text-foreground">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="p-1 bg-card rounded">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div className="p-5 border-t border-border">
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-bold text-foreground text-lg">₹{totalPrice}</span>
                </div>
                <AnimatedCTAButton size="lg" className="w-full">
                  Proceed to Checkout
                </AnimatedCTAButton>
              </div>
            )}
          </motion.div>
        )}
      </section>
    </Layout>
  );
};

export default PoojaKitsPage;
