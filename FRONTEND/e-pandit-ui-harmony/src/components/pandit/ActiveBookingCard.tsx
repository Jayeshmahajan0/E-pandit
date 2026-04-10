import { motion } from "framer-motion";
import { Phone, MapPin, IndianRupee, Navigation, PlayCircle, CheckCircle2 } from "lucide-react";
import BookingStatusStepper from "@/components/booking/BookingStatusStepper";

interface ActiveBookingCardProps {
  booking: {
    id: string;
    userName: string;
    userPhone: string;
    poojaType: string;
    userAddress: string;
    amount: number;
    status: string;
  };
  onUpdateStatus: (id: string, status: string) => void;
}

const ActiveBookingCard = ({ booking, onUpdateStatus }: ActiveBookingCardProps) => {
  const getNextAction = () => {
    switch (booking.status) {
      case "accepted":
        return { label: "Start Traveling", status: "arriving", icon: Navigation, color: "bg-gradient-saffron" };
      case "arriving":
        return { label: "Start Pooja", status: "in_progress", icon: PlayCircle, color: "bg-gradient-saffron" };
      case "in_progress":
        return { label: "Complete Pooja", status: "completed", icon: CheckCircle2, color: "bg-sacred-green" };
      default:
        return null;
    }
  };

  const action = getNextAction();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl shadow-card overflow-hidden"
    >
      {/* Status banner */}
      <div className="bg-gradient-maroon px-5 py-3">
        <h3 className="font-serif font-bold text-white">Active Booking</h3>
        <p className="text-white/70 text-xs">{booking.poojaType}</p>
      </div>

      <div className="p-5 space-y-4">
        {/* Stepper */}
        <BookingStatusStepper currentStatus={booking.status} />

        {/* User info */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
          <div>
            <p className="text-xs text-muted-foreground">Customer</p>
            <p className="font-semibold text-foreground">{booking.userName}</p>
          </div>
          <a
            href={`tel:+91${booking.userPhone}`}
            className="flex items-center gap-1.5 px-3 py-2 bg-sacred-green text-white rounded-lg text-xs font-medium"
          >
            <Phone className="w-3.5 h-3.5" />
            Call
          </a>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{booking.userAddress}</span>
          </div>
          <div className="flex items-center gap-2 text-primary font-bold">
            <IndianRupee className="w-4 h-4" />
            <span>₹{booking.amount.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* Action button */}
        {action && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onUpdateStatus(booking.id, action.status)}
            className={`w-full py-3.5 ${action.color} text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-soft hover:shadow-glow transition-all`}
          >
            <action.icon className="w-5 h-5" />
            {action.label}
          </motion.button>
        )}

        {booking.status === "completed" && (
          <div className="text-center py-2">
            <span className="text-sacred-green font-bold">   Pooja Completed!</span>
            <p className="text-xs text-muted-foreground mt-1">Payment will be processed shortly</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ActiveBookingCard;
