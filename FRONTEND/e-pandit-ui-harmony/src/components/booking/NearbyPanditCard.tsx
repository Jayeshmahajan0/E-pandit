import { motion } from "framer-motion";
import { Star, MapPin, Clock, IndianRupee, Zap } from "lucide-react";
import type { PanditProfile } from "@/data/mockData";

interface NearbyPanditCardProps {
  pandit: PanditProfile;
  index: number;
  onBook: (pandit: PanditProfile) => void;
}

const NearbyPanditCard = ({ pandit, index, onBook }: NearbyPanditCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ y: -3 }}
      className="bg-card rounded-2xl p-4 shadow-card hover:shadow-elevated transition-all duration-300 flex gap-4"
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <img
          src={pandit.image}
          alt={pandit.name}
          className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover"
        />
        {pandit.online && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-sacred-green rounded-full border-2 border-card" />
        )}
        {pandit.verified && (
          <span className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full font-bold">
            ✓
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-serif text-base font-semibold text-foreground truncate">
            {pandit.name}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            <Star className="w-3.5 h-3.5 text-primary fill-primary" />
            <span className="text-sm font-bold text-foreground">{pandit.rating}</span>
            <span className="text-xs text-muted-foreground">({pandit.reviews})</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {pandit.experience}yr exp
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {pandit.district}
          </span>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {pandit.specializations.slice(0, 3).map((s) => (
            <span
              key={s}
              className="bg-secondary text-secondary-foreground text-[10px] px-2 py-0.5 rounded-full"
            >
              {s}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-sm font-bold text-primary">
            <IndianRupee className="w-3.5 h-3.5" />
            ₹{pandit.pricePerPooja.toLocaleString("en-IN")}
            <span className="text-xs font-normal text-muted-foreground">/pooja</span>
          </span>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onBook(pandit)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-saffron text-primary-foreground rounded-lg text-xs font-bold shadow-soft hover:shadow-glow transition-all"
          >
            <Zap className="w-3.5 h-3.5" />
            Book Now
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default NearbyPanditCard;
