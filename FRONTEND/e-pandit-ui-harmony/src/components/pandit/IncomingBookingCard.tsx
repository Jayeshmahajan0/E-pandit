import { motion } from "framer-motion";
import { MapPin, Clock, IndianRupee, Check, X, User } from "lucide-react";
import { useState, useEffect } from "react";

interface IncomingBookingCardProps {
  booking: {
    id: string;
    userName: string;
    poojaType: string;
    userAddress: string;
    amount: number;
    scheduledDate: string;
    scheduledTime: string;
  };
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

const IncomingBookingCard = ({ booking, onAccept, onReject }: IncomingBookingCardProps) => {
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (timeLeft <= 0) {
      onReject(booking.id);
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, booking.id, onReject]);

  const urgencyColor = timeLeft > 15 ? "text-sacred-green" : timeLeft > 5 ? "text-gold" : "text-destructive";

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-card rounded-2xl overflow-hidden shadow-elevated border-2 border-primary/20"
    >
      {/* Timer bar */}
      <div className="h-1.5 bg-border">
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: `${(timeLeft / 30) * 100}%` }}
          transition={{ duration: 1 }}
          className={`h-full transition-colors ${
            timeLeft > 15 ? "bg-sacred-green" : timeLeft > 5 ? "bg-gold" : "bg-destructive"
          }`}
        />
      </div>

      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="w-3 h-3 bg-primary rounded-full"
            />
            <span className="text-sm font-bold text-primary">New Booking Request!</span>
          </div>
          <span className={`text-lg font-bold ${urgencyColor}`}>
            {timeLeft}s
          </span>
        </div>

        {/* Booking details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium text-foreground">{booking.userName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-base">🕉️</span>
            <span className="font-semibold text-primary">{booking.poojaType}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{booking.userAddress}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {booking.scheduledDate} at {booking.scheduledTime}
            </span>
            <span className="flex items-center gap-1 font-bold text-primary">
              <IndianRupee className="w-3.5 h-3.5" />
              ₹{booking.amount.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onReject(booking.id)}
            className="flex-1 py-3 border-2 border-destructive text-destructive rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-destructive/10 transition-colors"
          >
            <X className="w-4 h-4" />
            Reject
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onAccept(booking.id)}
            className="flex-[2] py-3 bg-gradient-saffron text-primary-foreground rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-soft hover:shadow-glow transition-all"
          >
            <Check className="w-4 h-4" />
            Accept Booking
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default IncomingBookingCard;
