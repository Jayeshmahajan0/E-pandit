import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bot, User, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// ─── Types ───────────────────────────────────────────────
interface Message {
  id: string;
  from: "bot" | "user";
  text: string;
  time: string;
  options?: string[];
}

// ─── Knowledge Base ───────────────────────────────────────
// Each entry has keywords (array) and a reply + optional quick options
const KB: {
  keywords: string[];
  reply: string;
  options?: string[];
}[] = [
  {
    keywords: ["hello", "hi", "hey", "namaste", "helo", "hii", "good morning", "good evening"],
    reply: "🙏 Namaste! Welcome to E-Pandit. I'm your virtual assistant. How can I help you today?",
    options: ["Book a Pandit", "Order Pooja Samagri", "Track my order", "Register as Vendor", "Pandit Registration", "Contact Support"],
  },
  {
    keywords: ["book", "pandit", "priest", "booking", "pooja", "puja", "schedule", "ceremony", "how to book"],
    reply: "📿 To book a pandit:\n1. Go to the **Priests** page from the navigation menu.\n2. Browse pandits and filter by specialization or location.\n3. Click **Book Now** on any pandit's profile.\n4. Select your pooja type, date, and time.\n5. Confirm your booking!\n\nYou'll receive updates as the pandit accepts your request.",
    options: ["What pujas are available?", "How much does it cost?", "How do I track my booking?"],
  },
  {
    keywords: ["samagri", "kit", "pooja kit", "order", "items", "products", "buy", "purchase", "shop"],
    reply: "🛒 To order Pooja Samagri:\n1. Go to **Pooja Kits** from the menu.\n2. Select your State and District to find local vendors.\n3. Filter by pooja type if needed.\n4. Add items to cart.\n5. Checkout — UPI for orders under ₹500, UPI or Cash on Delivery for ₹500+.\n\nThe vendor's contact details are shared after your order is placed!",
    options: ["Payment methods", "Track my order", "Can I cancel an order?"],
  },
  {
    keywords: ["track", "status", "order status", "where is", "delivery", "shipped", "my order"],
    reply: "📦 To track your Samagri order:\n1. Sign in to your account.\n2. Go to **Dashboard** → click **Samagri Orders** tab.\n3. You'll see real-time status: Placed → Processing → Shipped → Delivered.\n\nYou also receive an **email notification** when your order is shipped! 🚚",
    options: ["Can I cancel an order?", "Contact Support"],
  },
  {
    keywords: ["cancel", "cancellation", "return", "refund"],
    reply: " Order Cancellation:\n- You can cancel an order **only if its status is 'Placed (Pending)'**.\n- Go to Dashboard → Samagri Orders → click **Cancel Order**.\n- Once the vendor starts processing, cancellation is not possible.\n\nFor refunds on UPI payments, please contact support.",
    options: ["Contact Support", "Track my order"],
  },
  {
    keywords: ["payment", "pay", "upi", "cod", "cash on delivery", "how to pay", "razorpay"],
    reply: "💳 Payment Options on E-Pandit:\n- **UPI** — Available for all orders (Gpay, PhonePe, Paytm, etc.)\n- **Cash on Delivery (COD)** — Only for Samagri orders of ₹500 or more.\n\nAll UPI payments are secured via Razorpay.",
    options: ["Order Pooja Samagri", "Track my order"],
  },
  {
    keywords: ["vendor", "sell", "selling", "shop owner", "my products", "add product", "samagri vendor", "become vendor"],
    reply: "🏪 To become a Samagri Vendor:\n1. Go to **Sign Up** and select the **Samagri Vendor** role.\n2. Fill in your location (State & District) — you'll sell only in your district.\n3. After Admin approval, log in to your **Vendor Dashboard**.\n4. Add your products with name, price, description, and photo.\n5. Customers in your area will see your products in the Pooja Kits section!",
    options: ["How does approval work?", "What commission do you charge?", "Contact Support"],
  },
  {
    keywords: ["approval", "verified", "verification", "pending", "admin", "rejected", "approve"],
    reply: " Verification Process:\n- After sign-up, a Pandit or Vendor account goes to **Pending** status.\n- Our admin team reviews your details, usually within 24–48 hours.\n- Once approved, you'll receive an email and can use all features.\n- Vendors: products become visible to customers only after approval.",
    options: ["Contact Support", "Register as Vendor"],
  },
  {
    keywords: ["pandit register", "register as pandit", "become pandit", "pandit signup", "priest register"],
    reply: "🕉️ To register as a Pandit:\n1. Go to **/pandit/register** or click **Are you a Pandit? Register here** on the sign-up page.\n2. Fill in your details: specializations, languages, experience, price, etc.\n3. Upload your profile photo.\n4. Submit for Admin verification.\n5. Once approved, your profile will be visible to users!",
    options: ["How does approval work?", "Contact Support"],
  },
  {
    keywords: ["kundli", "janam kundali", "horoscope", "birth chart", "astrology", "matchmaking", "vivah milan"],
    reply: "⭐ E-Pandit offers:\n- **Janam Kundali** — Generate your birth chart with accurate planetary positions.\n- **Vivah Milan** — Check compatibility between two people (Kundali matching).\n- **Panchang** — Daily auspicious timings, Tithi, Nakshatra, Rahu Kaal.\n\nAll these are available from the main navigation menu!",
    options: ["Book a Pandit", "What pujas are available?"],
  },
  {
    keywords: ["puja", "ceremony", "ganesh", "satyanarayan", "griha pravesh", "wedding", "types", "what puja", "pooja type"],
    reply: "🛕 Poojas available on E-Pandit include:\n- Ganesh Pooja\n- Satyanarayan Katha\n- Griha Pravesh\n- Navratri Pooja\n- Shradh / Pitru Paksha\n- Wedding ceremonies\n- Satsang\n- Vastu Pooja\n- And many more!\n\nBrowse our Priests page to find specialists for any ceremony.",
    options: ["Book a Pandit", "Order Pooja Samagri"],
  },
  {
    keywords: ["price", "cost", "fee", "charge", "how much", "rate"],
    reply: "💰 Pricing on E-Pandit:\n- Each pandit sets their own **price per pooja** (shown on their profile).\n- Samagri kits are priced by individual vendors.\n- There is **no booking fee** charged by E-Pandit.\n\nFor a specific pandit's rate, check their profile page.",
    options: ["Book a Pandit", "Order Pooja Samagri"],
  },
  {
    keywords: ["contact", "support", "help", "email", "call", "phone", "issue", "problem", "complaint"],
    reply: "📞 Need more help?\n- **Email:** support@epandit.com\n- **Phone:** +91 91194 46550\n- **Hours:** Mon–Sat, 9 AM – 7 PM IST\n\nFor urgent issues, describe your problem here and we'll escalate it to our team!",
    options: ["Book a Pandit", "Order Pooja Samagri", "Track my order"],
  },
  {
    keywords: ["login", "signin", "sign in", "log in", "forgot password", "password"],
    reply: "🔐 Login Help:\n- Go to **Sign In** from the top-right menu.\n- Enter your registered email and password.\n- If you've forgotten your password, use the **Forgot Password** option.\n\nIf your account was just created, please check your email for a confirmation link.",
    options: ["Register as Vendor", "Pandit Registration", "Contact Support"],
  },
  {
    keywords: ["signup", "sign up", "register", "create account", "new account"],
    reply: "📝 Creating an Account:\n1. Click **Sign Up** from the top-right menu.\n2. Choose your role: **User**, **Samagri Vendor**, or click Pandit registration link.\n3. Fill in your name, email, phone, and password.\n4. Submit — you'll be logged in immediately!\n\nVendors and Pandits require Admin approval before accessing all features.",
    options: ["Register as Vendor", "Pandit Registration"],
  },
  {
    keywords: ["panchang", "muhurat", "auspicious", "timing", "tithi", "nakshatra", "rahu kaal"],
    reply: "📅 Panchang & Muhurat:\n- Visit the **Panchang** page for today's auspicious timings.\n- Includes: Tithi, Nakshatra, Yoga, Karana, Rahu Kaal, Shubh Muhurat.\n- Location-based accurate calculations.\n\nPerfect for planning ceremonies, travel, or important decisions!",
    options: ["Book a Pandit", "What pujas are available?"],
  },
];

// ─── Default welcome message ─────────────────────────────
const WELCOME: Message = {
  id: "welcome",
  from: "bot",
  text: "🙏 Namaste! I'm the E-Pandit Assistant. I can help you with booking pandits, ordering samagri, tracking orders, and more.\n\nWhat can I help you with today?",
  time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  options: ["Book a Pandit", "Order Pooja Samagri", "Track my order", "Register as Vendor", "Pandit Registration", "Contact Support"],
};

// ─── Matching logic ───────────────────────────────────────
function getBotReply(input: string): { text: string; options?: string[] } {
  const lower = input.toLowerCase().trim();
  for (const entry of KB) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return { text: entry.reply, options: entry.options };
    }
  }
  return {
    text: "🤔 I'm not sure about that yet. Here are some things I can help with:",
    options: ["Book a Pandit", "Order Pooja Samagri", "Track my order", "Register as Vendor", "Contact Support"],
  };
}

function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

function now() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ─── Render text with **bold** support ───────────────────
function RichText({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-0.5">
      {lines.map((line, i) => {
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={i} className="leading-relaxed">
            {parts.map((part, j) =>
              j % 2 === 1 ? <strong key={j}>{part}</strong> : part
            )}
          </p>
        );
      })}
    </div>
  );
}

// ─── Main Widget ─────────────────────────────────────────
const ChatbotWidget = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when new message arrives
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // Clear unread when opened
  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: Message = {
      id: makeId(),
      from: "user",
      text: trimmed,
      time: now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    // Simulate bot "thinking" delay (600–1000ms)
    const delay = 600 + Math.random() * 400;
    setTimeout(() => {
      const { text: replyText, options } = getBotReply(trimmed);
      const botMsg: Message = {
        id: makeId(),
        from: "bot",
        text: replyText,
        time: now(),
        options,
      };
      setMessages((prev) => [...prev, botMsg]);
      setTyping(false);
      if (!open) setUnread((n) => n + 1);
    }, delay);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed bottom-24 right-4 md:right-6 z-50 w-[300px] md:w-[340px] bg-card rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col"
            style={{ maxHeight: "min(520px, 80vh)" }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-saffron px-3 py-2.5 flex items-center gap-2.5 flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm leading-tight">Saarathi <span className="font-normal opacity-80 text-xs">सारथी</span></p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <p className="text-white/75 text-[11px] truncate">Your E-Pandit guide • Always online</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg hover:bg-white/20 transition-colors text-white flex-shrink-0"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Greeting banner for logged-in users */}
            {user && (
              <div className="bg-primary/5 border-b border-border px-3 py-1.5 text-xs text-muted-foreground">
                Hi, <span className="font-medium text-foreground">{user.full_name?.split(" ")[0]}</span>! How can I help?
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background/50">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-2 ${msg.from === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  {/* Avatar */}
                  <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                    msg.from === "bot" ? "bg-primary/10 text-primary" : "bg-secondary text-foreground"
                  }`}>
                    {msg.from === "bot" ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                  </div>

                  <div className={`max-w-[82%] ${msg.from === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                    <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.from === "bot"
                        ? "bg-card border border-border text-foreground rounded-tl-sm"
                        : "bg-primary text-primary-foreground rounded-tr-sm"
                    }`}>
                      {msg.from === "bot" ? <RichText text={msg.text} /> : <p>{msg.text}</p>}
                    </div>
                    <span className="text-[10px] text-muted-foreground px-1">{msg.time}</span>

                    {/* Quick reply options */}
                    {msg.from === "bot" && msg.options && (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {msg.options.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => sendMessage(opt)}
                            className="px-3 py-1.5 text-xs bg-primary/10 text-primary border border-primary/20 rounded-full hover:bg-primary/20 transition-colors font-medium"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {typing && (
                <div className="flex gap-2 items-center">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="px-4 py-3 bg-card border border-border rounded-2xl rounded-tl-sm flex gap-1 items-center">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="w-1.5 h-1.5 bg-muted-foreground rounded-full"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="p-3 border-t border-border bg-card flex items-center gap-2 flex-shrink-0"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about E-Pandit…"
                className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="p-2.5 bg-primary text-primary-foreground rounded-xl disabled:opacity-40 hover:bg-primary/90 transition-colors flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating trigger button */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-4 md:right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-saffron shadow-lg hover:shadow-xl flex items-center justify-center text-white transition-shadow"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        animate={open ? {} : { y: [0, -4, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        aria-label="Open E-Pandit Assistant"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <Bot className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unread badge */}
        {!open && unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
          >
            {unread}
          </motion.span>
        )}
      </motion.button>
    </>
  );
};

export default ChatbotWidget;
