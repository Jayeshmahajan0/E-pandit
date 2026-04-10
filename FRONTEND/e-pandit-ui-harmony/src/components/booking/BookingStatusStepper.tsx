import { motion } from "framer-motion";
import { Check, Clock, Car, PlayCircle, CheckCircle2 } from "lucide-react";

const steps = [
  { key: "requested", label: "Requested", icon: Clock, color: "text-gold" },
  { key: "accepted", label: "Accepted", icon: Check, color: "text-sacred-green" },
  { key: "arriving", label: "Arriving", icon: Car, color: "text-primary" },
  { key: "in_progress", label: "In Progress", icon: PlayCircle, color: "text-saffron" },
  { key: "completed", label: "Completed", icon: CheckCircle2, color: "text-sacred-green" },
];

interface BookingStatusStepperProps {
  currentStatus: string;
}

const BookingStatusStepper = ({ currentStatus }: BookingStatusStepperProps) => {
  const currentIndex = steps.findIndex((s) => s.key === currentStatus);

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute top-5 left-[10%] right-[10%] h-1 bg-border rounded-full">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-saffron to-gold rounded-full"
          />
        </div>

        {steps.map((step, i) => {
          const isActive = i <= currentIndex;
          const isCurrent = i === currentIndex;
          const StepIcon = step.icon;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: isCurrent ? 1.15 : 1 }}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCurrent
                    ? "bg-gradient-saffron text-primary-foreground shadow-glow"
                    : isActive
                    ? "bg-sacred-green text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isActive && !isCurrent ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <StepIcon className="w-5 h-5" />
                )}
              </motion.div>

              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`mt-2 text-[10px] md:text-xs font-medium text-center ${
                  isCurrent ? "text-primary font-bold" : isActive ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </motion.span>

              {isCurrent && (
                <motion.div
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BookingStatusStepper;
