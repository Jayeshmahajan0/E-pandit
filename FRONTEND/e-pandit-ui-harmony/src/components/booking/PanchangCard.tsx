import { motion } from "framer-motion";
import { Sun, Moon, Calendar, AlertTriangle, CheckCircle, Sunrise, Sunset } from "lucide-react";

interface PanchangData {
  date: string;
  day: string;
  tithi: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  sunrise: string;
  sunset: string;
  auspicious_periods: { name: string; start: string; end: string }[];
  inauspicious_periods: { name: string; start: string; end: string }[];
}

interface PanchangCardProps {
  data: PanchangData | null;
  loading: boolean;
  className?: string;
}

const PanchangCard = ({ data, loading, className = "" }: PanchangCardProps) => {
  if (loading) {
    return (
      <div className={`p-5 bg-card/60 rounded-2xl border border-border animate-pulse ${className}`}>
        <div className="h-6 w-1/3 bg-muted rounded mb-4"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-10 bg-muted rounded"></div>
          <div className="h-10 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-5 bg-gradient-to-br from-card to-background rounded-2xl border border-primary/20 shadow-glow relative overflow-hidden ${className}`}
    >
      {/* Decorative Background */}
      <div className="absolute -top-10 -right-10 text-primary/5">
        <Sun className="w-32 h-32" />
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-primary" />
        <h3 className="font-serif font-bold text-lg text-foreground">
          Panchang Details <span className="text-sm font-sans font-normal text-muted-foreground ml-2">{data.day}, {new Date(data.date).toLocaleDateString()}</span>
        </h3>
      </div>

      {/* Primary Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="bg-muted p-2.5 rounded-xl border border-border">
          <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-1">Tithi</p>
          <p className="font-medium text-sm text-foreground">{data.tithi}</p>
        </div>
        <div className="bg-muted p-2.5 rounded-xl border border-border">
          <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-1">Nakshatra</p>
          <p className="font-medium text-sm text-foreground">{data.nakshatra}</p>
        </div>
        <div className="bg-muted p-2.5 rounded-xl border border-border">
          <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-1">Yoga</p>
          <p className="font-medium text-sm text-foreground">{data.yoga}</p>
        </div>
        <div className="bg-muted p-2.5 rounded-xl border border-border">
          <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-1">Karana</p>
          <p className="font-medium text-sm text-foreground">{data.karana}</p>
        </div>
      </div>

      <div className="flex items-center gap-6 mb-5 text-sm font-medium text-muted-foreground">
        <div className="flex items-center gap-2">
          <Sunrise className="w-4 h-4 text-gold" /> {data.sunrise}
        </div>
        <div className="flex items-center gap-2">
           <Sunset className="w-4 h-4 text-primary" /> {data.sunset}
        </div>
      </div>

      {/* Kaalas Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-xs font-bold text-sacred-green flex items-center gap-1.5 mb-2">
            <CheckCircle className="w-3.5 h-3.5" /> Auspicious Muhurats
          </h4>
          <div className="space-y-1.5">
            {data.auspicious_periods.map((p, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs bg-sacred-green/5 p-2 rounded-lg border border-sacred-green/10">
                <span className="font-medium">{p.name}</span>
                <span className="text-muted-foreground">{p.start} - {p.end}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-destructive flex items-center gap-1.5 mb-2">
            <AlertTriangle className="w-3.5 h-3.5" /> Inauspicious Timings
          </h4>
          <div className="space-y-1.5">
            {data.inauspicious_periods.map((p, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs bg-destructive/5 p-2 rounded-lg border border-destructive/10">
                <span className="font-medium">{p.name}</span>
                <span className="text-muted-foreground">{p.start} - {p.end}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </motion.div>
  );
};

export default PanchangCard;
