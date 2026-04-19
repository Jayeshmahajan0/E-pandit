import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sunrise, Sunset, BookOpen, Star, Calendar, Info, Clock, Moon, Sun as SunIcon, Sparkles, Compass, UserCircle2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import PanchangCard from "@/components/booking/PanchangCard";
import ChoghadiyaCard from "@/components/booking/ChoghadiyaCard";
import HoroscopeSection from "@/components/booking/HoroscopeSection";
import AnimatedCTAButton from "@/components/shared/AnimatedCTAButton";
import KundliGenerator from "@/components/kundli/KundliGenerator";
import KundliMatching from "@/components/kundli/KundliMatching";
import api from "@/lib/api";

const PanchangPage = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [panchangData, setPanchangData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tithi");
  const [activeViewTab, setActiveViewTab] = useState("panchang"); // For segregating sections
  const [userDOB, setUserDOB] = useState("");
  const [userNumerology, setUserNumerology] = useState<{mulank: number, bhagyank: number} | null>(null);
  
  // Kundli Tab State
  const [kundliMode, setKundliMode] = useState<"generator" | "matching">("generator");

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  // Auto-switch back to panchang view if date changes from today and a hidden tab is active
  useEffect(() => {
    if (!isToday && (activeViewTab === "numerology" || activeViewTab === "horoscope")) {
      setActiveViewTab("panchang");
    }
  }, [isToday, activeViewTab]);

  const calculateNumerology = (dob: string) => {
    if (!dob) {
      setUserNumerology(null);
      return;
    }
    const [y, m, d] = dob.split('-');
    
    let mSum = d.split('').reduce((a, b) => a + Number(b), 0);
    while (mSum > 9) { mSum = String(mSum).split('').reduce((a, b) => a + Number(b), 0); }
    
    let bSum = (d + m + y).split('').reduce((a, b) => a + Number(b), 0);
    while (bSum > 9) { bSum = String(bSum).split('').reduce((a, b) => a + Number(b), 0); }
    
    setUserNumerology({ mulank: mSum, bhagyank: bSum });
  };

  useEffect(() => {
    const fetchPanchang = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/panchang?date=${selectedDate}`);
        setPanchangData(res.data.data);
      } catch (err) {
        console.error("Failed to load panchang", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPanchang();
  }, [selectedDate]);

  // Generate 14 days for horizontal ribbon
  const horizontalDates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  const panchangGuide = [
    { id: "tithi", label: "Tithi", icon: Moon, content: "Tithi is the lunar day. It is highly significant in determining auspicious timings for poojas. Purnima and Ekadashi are exceptionally sacred." },
    { id: "nakshatra", label: "Nakshatra", icon: Star, content: "Nakshatra refers to the 27 lunar mansions. Every Nakshatra has a ruling deity and determines the most harmonious time for worldly actions." },
    { id: "yoga", label: "Yoga", icon: SunIcon, content: "Yoga signifies the joint motion of the sun and moon. Auspicious yogas enhance positive outcomes, while inauspicious ones act as warnings." },
    { id: "karana", label: "Karana", icon: Clock, content: "A Karana is half of a Tithi. Specific Karanas are favorable for specific types of activities, from business agreements to spiritual pursuits." }
  ];

  return (
    <Layout>
      <section className="relative overflow-hidden min-h-screen bg-background pb-20">
        {/* Deep Spiritual Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-maroon/20 via-background to-background z-0 pointer-events-none" />
        <div 
          className="absolute inset-0 opacity-[0.03] z-0 pointer-events-none"
          style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 0C22.4 0 0 22.4 0 50s22.4 50 50 50 50-22.4 50-50S77.6 0 50 0zm0 90C27.9 90 10 72.1 10 50S27.9 10 50 10s40 17.9 40 40-17.9 40-40 40zm0-70c-16.5 0-30 13.5-30 30s13.5 30 30 30 30-13.5 30-30-13.5-30-30-30zm0 50c-11 0-20-9-20-20s9-20 20-20 20 9 20 20-9 20-20 20zm0-30c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10-4.5-10-10-10z' fill='%23CA8A04'/%3E%3C/svg%3E")`,
            backgroundSize: '400px',
            backgroundPosition: 'center'
          }}
        />

        <div className="container relative z-10 pt-16 max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-gold/30 to-gold/5 backdrop-blur-md border border-gold/20 mb-6 shadow-glow">
              <img src="/src/assets/om-ornament.png" alt="Om" className="w-10 h-10 opacity-80" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              <SunIcon className="w-8 h-8 text-gold mx-2 drop-shadow-md" />
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-serif text-4xl md:text-6xl font-black text-foreground mb-4 tracking-tight drop-shadow-sm">
              Today's <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-saffron to-gold">Panchang</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-lg text-muted-foreground max-w-2xl mx-auto font-medium">
              Discover the divine geometry of time. Find the perfect muhurat for your sacred journey.
            </motion.p>
          </div>

          {/* Date Selection Box & Ribbon */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8 px-4">
            <h2 className="font-serif text-xl font-bold text-foreground">Select a Date</h2>
            <div className="flex items-center gap-3 bg-card border border-border p-2 rounded-xl">
              <Calendar className="w-5 h-5 text-muted-foreground ml-2" />
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent border-none outline-none text-foreground font-semibold placeholder:text-muted-foreground mr-2 cursor-pointer"
              />
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="mb-10 w-full overflow-hidden relative"
          >
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
            
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide px-4 mask-edges items-center">
              <div className="flex items-center justify-center min-w-[50px] mr-2">
                <Calendar className="w-6 h-6 text-muted-foreground" />
              </div>
              {horizontalDates.map((date, idx) => {
                const dateStr = date.toISOString().split('T')[0];
                const isSelected = dateStr === selectedDate;
                const isToday = idx === 0;
                
                return (
                  <motion.button
                    key={idx}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`flex flex-col items-center justify-center min-w-[80px] p-3 rounded-2xl transition-all border shrink-0 relative overflow-hidden ${
                      isSelected 
                        ? 'bg-gradient-saffron border-transparent text-white shadow-glow' 
                        : 'bg-card border-border text-muted-foreground hover:border-primary/50 hover:bg-secondary/50'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay"></div>
                    )}
                    <span className={`text-[10px] uppercase font-bold tracking-widest ${isSelected ? 'text-white/80' : 'text-muted-foreground/70'} mb-1`}>
                      {isToday ? "Today" : date.toLocaleDateString(undefined, { weekday: 'short' })}
                    </span>
                    <span className={`text-2xl font-black font-serif ${isSelected ? 'text-white' : 'text-foreground'}`}>
                      {date.getDate()}
                    </span>
                    <span className={`text-xs font-semibold ${isSelected ? 'text-white/90' : 'text-muted-foreground'}`}>
                      {date.toLocaleDateString(undefined, { month: 'short' })}
                    </span>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Main Content (lg:8) */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-8 flex flex-col gap-6"
            >
              {/* Category Tabs */}
              {panchangData && (
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mask-edges border-b border-border/50 mb-2">
                  {[
                    { id: "panchang", label: "Panchang", icon: Moon, show: true },
                    { id: "numerology", label: "Numerology", icon: Sparkles, show: isToday },
                    { id: "horoscope", label: "Horoscope", icon: Star, show: isToday },
                    { id: "insights", label: "Kundali & Insights", icon: Compass, show: true }
                  ].filter(tab => tab.show).map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveViewTab(tab.id)}
                      className={`flex items-center gap-2 px-5 py-3 rounded-t-xl font-bold transition-all shrink-0 border-b-2 ${
                        activeViewTab === tab.id
                          ? "bg-secondary/30 text-primary border-primary"
                          : "text-muted-foreground hover:bg-secondary/20 hover:text-foreground border-transparent"
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}

              {/* VIEW: Panchang */}
              {activeViewTab === "panchang" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
                  <div className="bg-card/60 backdrop-blur-3xl rounded-[2rem] border border-white/10 shadow-elevated p-1 md:p-2 relative group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    <PanchangCard data={panchangData} loading={loading} className="border-0 shadow-none bg-transparent" />
                  </div>

                  {!loading && panchangData ? (
                    <ChoghadiyaCard dayOfWeek={panchangData.day} />
                  ) : (
                    <div className="h-64 bg-card/60 animate-pulse rounded-[2rem]" />
                  )}
                </motion.div>
              )}

              {/* VIEW: Numerology (Today Only) */}
              {isToday && activeViewTab === "numerology" && panchangData && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
                  {/* Mulank & Bhagyank Calculator */}
                  <div className="bg-gradient-to-br from-amber-50/80 via-card to-orange-50/50 dark:from-amber-950/30 dark:via-card dark:to-orange-950/20 rounded-[2rem] border border-amber-200/50 dark:border-amber-800/30 shadow-card p-6 md:p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <div>
                        <h3 className="font-serif text-xl font-bold flex items-center gap-2 text-foreground">
                          <Sparkles className="w-5 h-5 text-amber-500" /> Personal Numerology
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">Enter your Date of Birth to discover your daily numbers.</p>
                      </div>
                      <div className="flex items-center gap-2 bg-white/60 dark:bg-black/20 p-2 rounded-xl border border-amber-200/50">
                        <Calendar className="w-4 h-4 text-amber-600 ml-2" />
                        <input 
                          type="date" 
                          value={userDOB}
                          onChange={(e) => {
                            setUserDOB(e.target.value);
                            calculateNumerology(e.target.value);
                          }}
                          className="bg-transparent border-none outline-none text-sm font-semibold text-foreground"
                        />
                      </div>
                    </div>

                    {!userNumerology ? (
                      <div className="text-center py-8 bg-white/40 dark:bg-black/10 rounded-2xl border border-amber-100 dark:border-amber-900/20">
                        <Compass className="w-10 h-10 text-amber-300 mx-auto mb-3 opacity-50" />
                        <p className="text-muted-foreground text-sm font-medium">Please select your birth date above to calculate your Mulank & Bhagyank.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Mulank */}
                        <div className="flex flex-col items-center text-center bg-white/60 dark:bg-white/5 rounded-2xl p-6 border border-amber-100 dark:border-amber-900/30 shadow-sm relative overflow-hidden">
                          <div className="absolute -top-4 -right-4 w-16 h-16 bg-amber-500/10 rounded-full blur-xl pointer-events-none"></div>
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-saffron flex items-center justify-center mb-4 shadow-glow relative z-10">
                            <span className="text-3xl font-black font-serif text-white">{userNumerology.mulank}</span>
                          </div>
                          <h4 className="font-serif font-bold text-xl text-foreground mb-1">Your Mulank</h4>
                          <p className="text-[10px] uppercase font-bold tracking-widest text-primary/70 mb-4">Root Number</p>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {userNumerology.mulank === 1 ? "Ruled by Sun. You are an independent leader. Today favors taking charge of situations." :
                             userNumerology.mulank === 2 ? "Ruled by Moon. You seek harmony. Excellent day for collaborations and partnerships." :
                             userNumerology.mulank === 3 ? "Ruled by Jupiter. Highly creative. Let your artistic ideas guide your actions today." :
                             userNumerology.mulank === 4 ? "Ruled by Rahu. Practical and grounded. Focus on organizing and building today." :
                             userNumerology.mulank === 5 ? "Ruled by Mercury. Adventurous and free. Embrace changes and unexpected news." :
                             userNumerology.mulank === 6 ? "Ruled by Venus. Loving and responsible. Dedicate time to your family and home." :
                             userNumerology.mulank === 7 ? "Ruled by Ketu. Spiritual and analytical. A great day for meditation and learning." :
                             userNumerology.mulank === 8 ? "Ruled by Saturn. Ambitious and strong. Focus heavily on career and finance today." :
                             "Ruled by Mars. Compassionate and bold. Help someone unconditionally today."}
                          </p>
                        </div>
                        {/* Bhagyank */}
                        <div className="flex flex-col items-center text-center bg-white/60 dark:bg-white/5 rounded-2xl p-6 border border-amber-100 dark:border-amber-900/30 shadow-sm relative overflow-hidden">
                          <div className="absolute -top-4 -left-4 w-16 h-16 bg-gold/10 rounded-full blur-xl pointer-events-none"></div>
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-amber-600 flex items-center justify-center mb-4 shadow-glow relative z-10">
                            <span className="text-3xl font-black font-serif text-white">{userNumerology.bhagyank}</span>
                          </div>
                          <h4 className="font-serif font-bold text-xl text-foreground mb-1">Your Bhagyank</h4>
                          <p className="text-[10px] uppercase font-bold tracking-widest text-amber-600/70 mb-4">Destiny Number</p>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {userNumerology.bhagyank === 1 ? "Your destiny involves reaching the top. Fortune supports bold moves today." :
                             userNumerology.bhagyank === 2 ? "Your path is diplomacy. Luck comes through peaceful resolutions and networking." :
                             userNumerology.bhagyank === 3 ? "Your destiny is wisdom. Luck shines on teaching, learning, and expression." :
                             userNumerology.bhagyank === 4 ? "Success through perseverance. Patience today will overcome any obstacles." :
                             userNumerology.bhagyank === 5 ? "Destined for movement. Business, trade, and communication are highly blessed." :
                             userNumerology.bhagyank === 6 ? "Your path is beauty and care. Luck surrounds love and artistic endeavors." :
                             userNumerology.bhagyank === 7 ? "A spiritual destiny. Intuition is your superpower—trust your gut feeling today." :
                             userNumerology.bhagyank === 8 ? "Destined for material success. Hard work and discipline will yield lasting rewards." :
                             "Destined for humanitarian leadership. Courage brings immense victory."}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* VIEW: Horoscope (Today Only) */}
              {isToday && activeViewTab === "horoscope" && panchangData && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
                  {/* Daily Horoscope */}
                  <div className="bg-card rounded-[2rem] border border-border shadow-card p-6 md:p-8">
                    <h3 className="font-serif text-xl font-bold mb-2 flex items-center gap-2 text-foreground">
                      <Star className="w-5 h-5 text-gold" /> Daily Horoscope
                    </h3>
                    <p className="text-sm text-muted-foreground mb-8">Select your zodiac sign to view today's prediction</p>
                    <HoroscopeSection horoscope={panchangData.horoscope} />
                  </div>

                  {/* Daily Bhavishya (Predictions) */}
                  <div className="bg-card rounded-[2rem] border border-border shadow-card p-6 md:p-8">
                    <h3 className="font-serif text-xl font-bold mb-6 flex items-center gap-2 text-foreground">
                      <BookOpen className="w-5 h-5 text-primary" /> Today's General Bhavishya
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      {panchangData.bhavishya?.map((pred: any, idx: number) => {
                        const categoryIcons: Record<string, string> = { Career: "💼", Health: "🏥", Relationships: "❤️", Finance: "💰", Spiritual: "🙏" };
                        const categoryColors: Record<string, string> = {
                          Career: "from-blue-500/10 to-blue-500/5 border-blue-200 dark:border-blue-800/40",
                          Health: "from-green-500/10 to-green-500/5 border-green-200 dark:border-green-800/40",
                          Relationships: "from-rose-500/10 to-rose-500/5 border-rose-200 dark:border-rose-800/40",
                          Finance: "from-amber-500/10 to-amber-500/5 border-amber-200 dark:border-amber-800/40",
                          Spiritual: "from-purple-500/10 to-purple-500/5 border-purple-200 dark:border-purple-800/40",
                        };
                        return (
                          <div key={idx} className={`p-5 rounded-2xl bg-gradient-to-br ${categoryColors[pred.category] || "from-secondary to-secondary/50 border-border"} border shadow-sm`}>
                            <div className="w-10 h-10 rounded-full bg-white/50 dark:bg-black/20 flex items-center justify-center text-xl mb-3">
                              {categoryIcons[pred.category] || "📌"}
                            </div>
                            <h4 className="font-bold text-foreground mb-2">{pred.category}</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">{pred.message}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* VIEW: Kundali & Insights (Available for all days) */}
              {activeViewTab === "insights" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
                  
                  {/* Toggle Mode */}
                  <div className="flex bg-card p-1.5 rounded-xl border border-border shadow-sm w-full md:w-auto self-start">
                    <button
                      onClick={() => setKundliMode("generator")}
                      className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                        kundliMode === "generator" 
                          ? "bg-primary text-primary-foreground shadow-md" 
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Janam Kundali
                    </button>
                    <button
                      onClick={() => setKundliMode("matching")}
                      className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                        kundliMode === "matching" 
                          ? "bg-rose-500 text-white shadow-md" 
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Vivah Milan (Match)
                    </button>
                  </div>

                  {kundliMode === "generator" ? <KundliGenerator /> : <KundliMatching />}

                </motion.div>
              )}

            </motion.div>

            {/* RIGHT COLUMN: Interactive Guide & CTAs (lg:4) */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-4 flex flex-col gap-6"
            >
              
              {/* Book a Pandit CTA (Astrotalk style) */}
              <div className="bg-gradient-maroon text-white rounded-[2rem] p-6 shadow-glow relative overflow-hidden flex flex-col items-center text-center">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/mandala.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
                 
                 <div className="p-3 bg-white/20 rounded-full mb-3 backdrop-blur-md">
                   <UserCircle2 className="w-8 h-8 text-white" />
                 </div>
                 <h3 className="font-serif text-xl font-bold mb-2">Book a Verified Pandit</h3>
                 <p className="text-sm text-white/80 mb-5">Harness the power of good Muhurat. Consult expert priests for life's important events.</p>
                 <AnimatedCTAButton 
                   onClick={() => navigate("/priests")} 
                   className="w-full bg-white text-maroon hover:bg-white/90 font-bold"
                 >
                   Find a Pandit
                 </AnimatedCTAButton>
              </div>

              {/* Informational Interactive Accordion */}
              <div className="bg-card rounded-[2rem] shadow-card border border-border p-6 relative overflow-hidden group">
                <div className="absolute -bottom-10 -left-10 text-primary/5 pointer-events-none">
                  <Star className="w-40 h-40 transform rotate-45" />
                </div>
                
                <h3 className="font-serif text-xl font-bold mb-5 flex items-center gap-2 text-foreground">
                  <BookOpen className="w-5 h-5 text-primary" /> Key Concepts
                </h3>
                
                <div className="flex flex-col gap-2">
                  {panchangGuide.map((tab) => {
                    const isTabActive = activeTab === tab.id;
                    return (
                      <div key={tab.id}>
                        <button
                          onClick={() => setActiveTab(isTabActive ? "" : tab.id)}
                          className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-between ${
                            isTabActive 
                              ? 'bg-secondary text-primary' 
                              : 'bg-background border border-border text-muted-foreground hover:border-primary/30'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <tab.icon className={`w-4 h-4 ${isTabActive ? 'text-primary' : 'opacity-70'}`} />
                            {tab.label}
                          </span>
                        </button>
                        
                        <AnimatePresence>
                          {isTabActive && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="p-4 text-sm text-muted-foreground leading-relaxed">
                                {tab.content}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Pro-tip card */}
              <div className="bg-gradient-to-br from-indigo-50/10 to-transparent border border-indigo-500/20 rounded-2xl p-5 flex gap-3 items-start">
                <div className="mt-1">
                  <Info className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-sm mb-1">Rahu Kaal</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed flex-1">A 90-minute period every day considered highly inauspicious. Avoid starting important activities during this time.</p>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PanchangPage;
