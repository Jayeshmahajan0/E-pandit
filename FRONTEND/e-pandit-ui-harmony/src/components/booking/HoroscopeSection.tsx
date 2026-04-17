import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Sparkles } from "lucide-react";

interface HoroscopeData {
  sign: string;
  prediction: string;
  luckyNumber: number;
  luckyColor: string;
  overallRating: string;
}

interface HoroscopeSectionProps {
  horoscope?: HoroscopeData[];
}

const zodiacIcons: Record<string, string> = {
  Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋",
  Leo: "♌", Virgo: "♍", Libra: "♎", Scorpio: "♏",
  Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓"
};

const HoroscopeSection = ({ horoscope }: HoroscopeSectionProps) => {
  const [activeSign, setActiveSign] = useState<string>("Aries");

  if (!horoscope || horoscope.length === 0) return null;

  const activeData = horoscope.find(h => h.sign === activeSign);

  return (
    <div className="flex flex-col gap-6">
      {/* Zodiac Sign Selector */}
      <div className="flex overflow-x-auto pb-4 scrollbar-hide gap-3 mask-edges">
        {horoscope.map((item) => (
          <button
            key={item.sign}
            onClick={() => setActiveSign(item.sign)}
            className={`flex flex-col items-center justify-center min-w-[70px] p-3 rounded-2xl transition-all border shrink-0 relative overflow-hidden ${
              activeSign === item.sign
                ? 'bg-gradient-to-br from-gold to-amber-600 border-transparent text-white shadow-glow'
                : 'bg-card border-border text-muted-foreground hover:border-primary/50 hover:bg-secondary/50'
            }`}
          >
            <span className="text-2xl mb-1 drop-shadow-sm">{zodiacIcons[item.sign]}</span>
            <span className={`text-[10px] uppercase font-bold tracking-widest ${activeSign === item.sign ? 'text-white/90' : 'text-muted-foreground/80'}`}>
              {item.sign}
            </span>
          </button>
        ))}
      </div>

      {/* Active Prediction Card */}
      <AnimatePresence mode="wait">
        {activeData && (
          <motion.div
            key={activeData.sign}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-secondary/30 rounded-2xl p-5 border border-border/50 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none text-8xl">
              {zodiacIcons[activeData.sign]}
            </div>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl shadow-inner">
                {zodiacIcons[activeData.sign]}
              </div>
              <div>
                <h4 className="font-serif font-bold text-lg text-foreground">{activeData.sign} Horoscope</h4>
                <p className="text-xs text-primary font-medium tracking-wide">Today's Prediction</p>
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed text-sm mb-6 relative z-10">
              {activeData.prediction}
            </p>

            <div className="grid grid-cols-3 gap-3 relative z-10">
              <div className="bg-background rounded-xl p-3 border border-border text-center flex flex-col items-center justify-center shadow-sm">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Lucky No.</span>
                <span className="font-serif font-bold text-lg text-foreground">{activeData.luckyNumber}</span>
              </div>
              <div className="bg-background rounded-xl p-3 border border-border text-center flex flex-col items-center justify-center shadow-sm">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Color</span>
                <span className="font-medium text-sm text-foreground">{activeData.luckyColor}</span>
              </div>
              <div className="bg-background rounded-xl p-3 border border-border text-center flex flex-col items-center justify-center shadow-sm">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Rating</span>
                <span className="font-medium text-sm text-primary flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> {activeData.overallRating}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HoroscopeSection;
