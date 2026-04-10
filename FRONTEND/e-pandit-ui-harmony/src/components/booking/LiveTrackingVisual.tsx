import { motion } from "framer-motion";
import { MapPin, Navigation } from "lucide-react";

interface LiveTrackingVisualProps {
  status: string;
  panditName: string;
}

const LiveTrackingVisual = ({ status, panditName }: LiveTrackingVisualProps) => {
  const getProgress = () => {
    switch (status) {
      case "accepted": return 10;
      case "arriving": return 55;
      case "in_progress": return 90;
      case "completed": return 100;
      default: return 0;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "requested": return "Waiting for pandit to accept...";
      case "accepted": return `${panditName} accepted! Preparing to leave...`;
      case "arriving": return `${panditName} is on the way to you!`;
      case "in_progress": return "Pooja is in progress  ";
      case "completed": return "Pooja completed successfully! 🎉";
      default: return "";
    }
  };

  const progress = getProgress();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-5 md:p-6 shadow-card overflow-hidden"
    >
      {/* Animated route visualization */}
      <div className="relative h-20 mb-4">
        {/* Route line */}
        <div className="absolute top-1/2 left-8 right-8 h-1 bg-border rounded-full -translate-y-1/2">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="h-full bg-gradient-to-r from-saffron via-gold to-sacred-green rounded-full"
          />
        </div>

        {/* Route dots */}
        {[0, 25, 50, 75, 100].map((pos) => (
          <div
            key={pos}
            className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${pos <= progress ? "bg-primary" : "bg-border"
              }`}
            style={{ left: `${8 + (pos / 100) * 84}%` }}
          />
        ))}

        {/* Pandit marker (moving) */}
        <motion.div
          animate={{ left: `${8 + (progress / 100) * 84}%` }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={status === "arriving" ? { y: [0, -5, 0] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-10 h-10 bg-gradient-saffron rounded-full flex items-center justify-center shadow-glow"
          >
            <Navigation className="w-5 h-5 text-white" />
          </motion.div>
        </motion.div>

        {/* Start point */}
        <div className="absolute top-1/2 left-[8%] -translate-y-1/2 -translate-x-1/2">
          <div className="w-8 h-8 bg-maroon rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">🕉️</span>
          </div>
        </div>

        {/* End point */}
        <div className="absolute top-1/2 right-[8%] -translate-y-1/2 translate-x-1/2">
          <div className="w-8 h-8 bg-sacred-green rounded-full flex items-center justify-center">
            <MapPin className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>

      {/* Status text */}
      <motion.div
        key={status}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="text-sm font-medium text-foreground">{getStatusText()}</p>
        {status === "arriving" && (
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-xs text-primary mt-1"
          >
            Estimated arrival: 15-20 minutes
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  );
};

export default LiveTrackingVisual;
