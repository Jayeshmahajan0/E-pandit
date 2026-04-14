import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sunrise, Sunset, BookOpen, Star, Calendar, Info, Clock, Moon, Sun as SunIcon, Sparkles, Compass, UserCircle2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import PanchangCard from "@/components/booking/PanchangCard";
import ChoghadiyaCard from "@/components/booking/ChoghadiyaCard";
import AnimatedCTAButton from "@/components/shared/AnimatedCTAButton";
import api from "@/lib/api";

const PanchangPage = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [panchangData, setPanchangData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tithi");

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
            
            {/* LEFT COLUMN: Panchang & Astrological Details (lg:8) */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-8 flex flex-col gap-6"
            >
              {/* Main Panchang Card */}
              <div className="bg-card/60 backdrop-blur-3xl rounded-[2rem] border border-white/10 shadow-elevated p-1 md:p-2 relative group overflow-hidden mb-6">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                <PanchangCard data={panchangData} loading={loading} className="border-0 shadow-none bg-transparent" />
              </div>

              {/* Choghadiya Card Component */}
              <div className="mb-2">
                {!loading && panchangData ? (
                  <ChoghadiyaCard dayOfWeek={panchangData.day} />
                ) : (
                  <div className="h-64 bg-card/60 animate-pulse rounded-[2rem]" />
                )}
              </div>

              {/* Astrotalk Style - Daily Planetary Positions & Horoscope */}
              <div className="grid md:grid-cols-2 gap-6">
                 {/* Kundali Placeholder Graphic */}
                 <div className="bg-card rounded-[2rem] border border-border p-6 shadow-card relative overflow-hidden flex flex-col items-center justify-center text-center">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <Compass className="w-12 h-12 text-gold mb-3 opacity-80" />
                    <h3 className="font-serif font-bold text-lg mb-2">Planetary Transit</h3>
                    <p className="text-sm text-muted-foreground mb-4">View today's planetary positions and how they align with your Kundali.</p>
                    
                    {/* SVG representation of North Indian Kundali Chart */}
                    <svg viewBox="0 0 100 100" className="w-32 h-32 text-primary/20 mb-4 drop-shadow-sm">
                      <rect x="5" y="5" width="90" height="90" fill="none" stroke="currentColor" strokeWidth="2"/>
                      <line x1="5" y1="5" x2="95" y2="95" stroke="currentColor" strokeWidth="2"/>
                      <line x1="5" y1="95" x2="95" y2="5" stroke="currentColor" strokeWidth="2"/>
                      <line x1="50" y1="5" x2="95" y2="50" stroke="currentColor" strokeWidth="2"/>
                      <line x1="95" y1="50" x2="50" y2="95" stroke="currentColor" strokeWidth="2"/>
                      <line x1="50" y1="95" x2="5" y2="50" stroke="currentColor" strokeWidth="2"/>
                      <line x1="5" y1="50" x2="50" y2="5" stroke="currentColor" strokeWidth="2"/>
                      {/* Fake Planets */}
                      <text x="45" y="25" fontSize="6" fill="currentColor" className="font-bold opacity-60">Su</text>
                      <text x="15" y="50" fontSize="6" fill="currentColor" className="font-bold opacity-60">Mo</text>
                      <text x="75" y="50" fontSize="6" fill="currentColor" className="font-bold opacity-60">Ra</text>
                      <text x="45" y="80" fontSize="6" fill="currentColor" className="font-bold opacity-60">Ju</text>
                    </svg>
                    
                    <button className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                      Generate Free Kundali <ArrowRight className="w-3 h-3" />
                    </button>
                 </div>

                 {/* Information Box */}
                 <div className="bg-card rounded-[2rem] border border-border p-6 shadow-card hover:shadow-elevated transition-shadow h-full flex flex-col justify-center">
                   <h3 className="font-serif text-lg font-bold mb-4 flex items-center gap-2">
                     <Sparkles className="w-5 h-5 text-primary" /> Daily Insight
                   </h3>
                   <div className="space-y-4">
                     <div className="p-3 bg-secondary/50 rounded-xl border border-secondary">
                       <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Moon Sign</p>
                       <p className="text-sm font-medium text-foreground">
                         {panchangData?.insights?.moonSign ? `Entering ${panchangData.insights.moonSign} by midday.` : "Calculating..."}
                       </p>
                     </div>
                     <div className="p-3 bg-secondary/50 rounded-xl border border-secondary">
                       <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Sun Sign</p>
                       <p className="text-sm font-medium text-foreground">
                         {panchangData?.insights?.sunSign ? `Remains in ${panchangData.insights.sunSign}.` : "Calculating..."}
                       </p>
                     </div>
                     <div className="p-3 bg-sacred-green/10 rounded-xl border border-sacred-green/20">
                       <p className="text-xs text-sacred-green uppercase tracking-wider font-bold mb-1 flex items-center gap-1"><BookOpen className="w-3 h-3"/> Mantra of the Day</p>
                       <p className="text-sm font-medium text-foreground font-serif">
                         {panchangData?.insights?.mantra ? `"${panchangData.insights.mantra}"` : '"Om"'}
                       </p>
                     </div>
                   </div>
                 </div>
              </div>

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
