import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Loader2, UserCircle2, Navigation } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

const KundliMatching = () => {
  const [boy, setBoy] = useState({ name: "", dob: "", time: "", location: "", coordinates: "" });
  const [girl, setGirl] = useState({ name: "", dob: "", time: "", location: "", coordinates: "" });
  const [loading, setLoading] = useState(false);
  const [matchData, setMatchData] = useState<any>(null);

  const handleMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!boy.name || !girl.name || !boy.dob || !girl.dob) {
      toast.error("Please fill in basic details for both.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/kundli/match", { boy, girl });
      setMatchData(res.data.data);
      toast.success("Matching complete!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate match score.");
    } finally {
      setLoading(false);
    }
  };

  const handleGetLocation = (person: "boy" | "girl") => {
    if ("geolocation" in navigator) {
      toast.info(`Fetching location for ${person}...`);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = `${position.coords.latitude},${position.coords.longitude}`;
          if (person === "boy") {
            setBoy({ ...boy, location: "Current Location", coordinates: coords });
          } else {
            setGirl({ ...girl, location: "Current Location", coordinates: coords });
          }
          toast.success("Location acquired!");
        },
        (error) => {
          console.error("Error obtaining location", error);
          toast.error("Failed to get location.");
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
    }
  };

  const getScoreColor = (score: number, max: number) => {
    const ratio = score / max;
    if (ratio >= 0.8) return "text-sacred-green bg-sacred-green/10 border-sacred-green/30";
    if (ratio >= 0.5) return "text-orange-500 bg-orange-500/10 border-orange-500/30";
    return "text-destructive bg-destructive/10 border-destructive/30";
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-card rounded-2xl border border-border shadow-card p-6 md:p-8">
        <h3 className="font-serif text-xl font-bold mb-6 flex items-center gap-2 text-foreground">
          <Heart className="w-5 h-5 text-rose-500" /> Vivah Milan (Match Making)
        </h3>
        
        <form onSubmit={handleMatch} className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6 relative">
          {/* Decorative vs line */}
          <div className="hidden md:flex absolute inset-y-0 left-1/2 -translate-x-1/2 items-center justify-center pointer-events-none">
            <div className="h-full w-px bg-border absolute"></div>
            <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center z-10 text-xs font-bold text-muted-foreground shadow-sm">
              VS
            </div>
          </div>

          {/* Boy Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-foreground flex items-center gap-2">
                <UserCircle2 className="w-5 h-5 text-blue-500" /> Boy's Details
              </h4>
              <button type="button" onClick={() => handleGetLocation("boy")} className="text-xs text-primary hover:underline flex items-center gap-1"><Navigation className="w-3 h-3" /> Use Current</button>
            </div>
            <input type="text" placeholder="Name" value={boy.name} onChange={e => setBoy({...boy, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:border-primary" />
            <input type="date" value={boy.dob} onChange={e => setBoy({...boy, dob: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:border-primary" />
            <input type="time" value={boy.time} onChange={e => setBoy({...boy, time: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:border-primary" />
            <input type="text" placeholder="Birth City" value={boy.location} onChange={e => setBoy({...boy, location: e.target.value, coordinates: ""})} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:border-primary" />
          </div>

          {/* Girl Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-foreground flex items-center gap-2">
                <UserCircle2 className="w-5 h-5 text-pink-500" /> Girl's Details
              </h4>
              <button type="button" onClick={() => handleGetLocation("girl")} className="text-xs text-primary hover:underline flex items-center gap-1"><Navigation className="w-3 h-3" /> Use Current</button>
            </div>
            <input type="text" placeholder="Name" value={girl.name} onChange={e => setGirl({...girl, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:border-primary" />
            <input type="date" value={girl.dob} onChange={e => setGirl({...girl, dob: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:border-primary" />
            <input type="time" value={girl.time} onChange={e => setGirl({...girl, time: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:border-primary" />
            <input type="text" placeholder="Birth City" value={girl.location} onChange={e => setGirl({...girl, location: e.target.value, coordinates: ""})} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:border-primary" />
          </div>

          <div className="md:col-span-2 mt-4 flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-12 py-3.5 bg-gradient-maroon text-white rounded-xl font-bold text-sm shadow-soft hover:shadow-glow transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Calculate Match Score"}
            </button>
          </div>
        </form>
      </div>

      {/* Results Section */}
      <AnimatePresence>
        {matchData && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-card rounded-[2rem] border border-border p-6 shadow-card overflow-hidden relative"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-rose-500 to-primary"></div>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
              <div className="text-center md:text-left">
                <h4 className="font-serif font-bold text-2xl text-foreground">Ashtakoot Guna Milan</h4>
                <p className="text-muted-foreground mt-1">{matchData.profiles.boy} & {matchData.profiles.girl}</p>
              </div>

              <div className={`flex flex-col items-center justify-center p-4 rounded-full w-32 h-32 border-4 ${matchData.total_score >= 18 ? 'border-sacred-green text-sacred-green' : 'border-destructive text-destructive'} shadow-lg relative overflow-hidden bg-background`}>
                <span className="text-4xl font-black">{matchData.total_score}</span>
                <span className="text-xs font-bold uppercase tracking-widest opacity-80 border-t border-current pt-1 mt-1">out of 36</span>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {Object.entries(matchData.ashtakoot).map(([key, data]: [string, any]) => (
                <div key={key} className={`p-3 rounded-xl border ${getScoreColor(data.scored, data.max)} flex flex-col items-center text-center`}>
                  <span className="text-xs uppercase font-bold opacity-80 mb-1">{key.replace("_", " ")}</span>
                  <span className="text-lg font-black">{data.scored}<span className="text-xs font-normal opacity-70">/{data.max}</span></span>
                </div>
              ))}
            </div>

            <div className="bg-secondary/50 rounded-xl p-5 border border-secondary text-center">
              <h4 className={`text-xl font-bold mb-2 ${matchData.color}`}>{matchData.compatibility} Match</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">{matchData.conclusion}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KundliMatching;
