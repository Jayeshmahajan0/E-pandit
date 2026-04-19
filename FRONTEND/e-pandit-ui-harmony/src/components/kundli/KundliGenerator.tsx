import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, Clock, User, Sparkles, Download, Loader2, Navigation, Lock } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import KundliChart from "./KundliChart";

const KundliGenerator = () => {
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    time: "",
    location: "",
    coordinates: "" // For geolocation
  });
  
  const [loading, setLoading] = useState(false);
  const [kundliData, setKundliData] = useState<any>(null);

  const handleGetLocation = () => {
    if ("geolocation" in navigator) {
      toast.info("Fetching your location...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            location: "Current Location",
            coordinates: `${position.coords.latitude},${position.coords.longitude}`
          });
          toast.success("Location acquired!");
        },
        (error) => {
          console.error("Error obtaining location", error);
          toast.error("Failed to get location. Please type your city manually.");
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.dob || !formData.time || !formData.location) {
      toast.error("Please fill in all details");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/kundli/generate", formData);
      setKundliData(res.data.data);
      toast.success("Kundali generated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate Kundali");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-card rounded-2xl border border-border shadow-card p-6 md:p-8">
        <h3 className="font-serif text-xl font-bold mb-6 flex items-center gap-2 text-foreground">
          <Sparkles className="w-5 h-5 text-primary" /> Free Janam Kundali
        </h3>
        
        <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <User className="w-4 h-4 text-muted-foreground" /> Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your name"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="space-y-1.5 relative">
            <label className="text-sm font-medium text-foreground flex items-center justify-between">
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-muted-foreground" /> Birth Place</span>
              <button 
                type="button" 
                onClick={handleGetLocation}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <Navigation className="w-3 h-3" /> Use Current
              </button>
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value, coordinates: "" })}
              placeholder="City, State"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-muted-foreground" /> Date of Birth
            </label>
            <input
              type="date"
              value={formData.dob}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-muted-foreground" /> Time of Birth
            </label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm outline-none focus:border-primary"
            />
          </div>

          <div className="md:col-span-2 mt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-saffron text-white rounded-xl font-bold text-sm shadow-soft hover:shadow-glow transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Generate Kundali"}
            </button>
          </div>
        </form>
      </div>

      <AnimatePresence>
        {kundliData && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid lg:grid-cols-2 gap-6"
          >
            {/* Chart Section */}
            <div className="bg-white dark:bg-card rounded-[2rem] border border-border p-6 shadow-card flex flex-col items-center justify-center relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
               <h4 className="font-serif font-bold text-xl mb-6 text-foreground">Lagna Chart (D1)</h4>
               <KundliChart planets={kundliData.planets_in_houses} ascendantSign={kundliData.ascendant} />
               <button className="mt-6 flex items-center gap-2 text-sm font-bold text-primary hover:underline">
                 <Download className="w-4 h-4" /> Download PDF Report
               </button>
            </div>

            {/* Details Section */}
            <div className="bg-card rounded-[2rem] border border-border p-6 shadow-card space-y-4">
              <h4 className="font-serif font-bold text-xl mb-4 text-foreground">Astrological Details</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-secondary/50 rounded-2xl border border-secondary">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Ascendant (Lagna)</p>
                  <p className="text-lg font-bold text-foreground">Sign {kundliData.ascendant}</p>
                </div>
                <div className="p-4 bg-secondary/50 rounded-2xl border border-secondary">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Moon Sign (Rasi)</p>
                  <p className="text-lg font-bold text-foreground">{kundliData.moon_sign}</p>
                </div>
                <div className="p-4 bg-secondary/50 rounded-2xl border border-secondary">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Sun Sign</p>
                  <p className="text-lg font-bold text-foreground">{kundliData.sun_sign}</p>
                </div>
                <div className="p-4 bg-secondary/50 rounded-2xl border border-secondary relative overflow-hidden group cursor-pointer hover:border-gold/50 transition-colors">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Nakshatra</p>
                  {kundliData.nakshatra === "PREMIUM_LOCKED" ? (
                    <div className="flex items-center gap-2 mt-1">
                      <Lock className="w-4 h-4 text-gold" />
                      <span className="text-sm font-bold text-gold">Unlock Premium</span>
                    </div>
                  ) : (
                    <p className="text-lg font-bold text-foreground">{kundliData.nakshatra}</p>
                  )}
                </div>
              </div>

              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                <p className="text-xs text-red-600 uppercase tracking-wider font-bold mb-1">Manglik Dosha</p>
                <p className="text-base font-medium text-foreground">{kundliData.manglik_status.type}</p>
                <p className="text-xs text-muted-foreground mt-1">{kundliData.manglik_status.description}</p>
              </div>

              <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-2xl relative overflow-hidden group cursor-pointer hover:border-gold/50 transition-colors">
                <p className="text-xs text-primary uppercase tracking-wider font-bold mb-1">Current Dasha</p>
                {kundliData.dasha.major === "PREMIUM_LOCKED" ? (
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-gold" />
                      <span className="text-sm font-bold text-gold">Unlock Full Dasha Report</span>
                    </div>
                    <button className="text-xs font-bold px-3 py-1 bg-gold text-white rounded-full">Buy Premium</button>
                  </div>
                ) : (
                  <>
                    <p className="text-base font-medium text-foreground">{kundliData.dasha.major} Mahadasha / {kundliData.dasha.minor} Antardasha</p>
                    <p className="text-xs text-muted-foreground mt-1">Ends on {kundliData.dasha.ends_at}</p>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KundliGenerator;
