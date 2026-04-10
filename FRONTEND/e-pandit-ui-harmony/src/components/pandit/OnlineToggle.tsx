import { motion } from "framer-motion";
import { Wifi, WifiOff } from "lucide-react";

interface OnlineToggleProps {
  isOnline: boolean;
  onToggle: (online: boolean) => void;
}

const OnlineToggle = ({ isOnline, onToggle }: OnlineToggleProps) => {
  return (
    <motion.div
      layout
      className={`relative p-5 rounded-2xl cursor-pointer transition-all duration-500 ${
        isOnline
          ? "bg-gradient-to-br from-sacred-green/20 to-sacred-green/5 border-2 border-sacred-green/30"
          : "bg-gradient-to-br from-muted to-card border-2 border-border"
      }`}
      onClick={() => onToggle(!isOnline)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{
              backgroundColor: isOnline ? "#16a34a" : "#94a3b8",
              scale: isOnline ? [1, 1.1, 1] : 1,
            }}
            transition={{ duration: 0.3, scale: { duration: 1.5, repeat: isOnline ? Infinity : 0 } }}
            className="w-12 h-12 rounded-full flex items-center justify-center"
          >
            {isOnline ? (
              <Wifi className="w-6 h-6 text-white" />
            ) : (
              <WifiOff className="w-6 h-6 text-white" />
            )}
          </motion.div>
          <div>
            <h3 className="font-serif text-lg font-bold text-foreground">
              {isOnline ? "You're Online" : "You're Offline"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isOnline ? "Accepting new booking requests" : "Tap to start accepting bookings"}
            </p>
          </div>
        </div>

        {/* Toggle switch */}
        <div
          className={`w-16 h-8 rounded-full relative transition-colors duration-300 ${
            isOnline ? "bg-sacred-green" : "bg-muted-foreground/30"
          }`}
        >
          <motion.div
            animate={{ x: isOnline ? 32 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md"
          />
        </div>
      </div>

      {isOnline && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-3 pt-3 border-t border-sacred-green/20"
        >
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 bg-sacred-green rounded-full"
            />
            <span className="text-xs text-sacred-green font-medium">Live — Listening for booking requests</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default OnlineToggle;
