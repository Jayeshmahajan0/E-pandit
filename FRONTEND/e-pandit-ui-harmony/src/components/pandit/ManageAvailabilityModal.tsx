import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";

interface ManageAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  existingData: any; // The existing blocked data for this date
  onSave: (payload: any) => Promise<void>;
  onDelete: () => Promise<void>;
}

const HOURS = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", 
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", 
  "18:00", "19:00", "20:00", "21:00"
];

const ManageAvailabilityModal = ({ isOpen, onClose, date, existingData, onSave, onDelete }: ManageAvailabilityModalProps) => {
  const [mode, setMode] = useState<"available" | "full_day" | "partial">("available");
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (existingData) {
      if (existingData.is_full_day) {
        setMode("full_day");
      } else if (existingData.slots && existingData.slots.length > 0) {
        setMode("partial");
        setSelectedSlots(existingData.slots);
      } else {
        setMode("available");
      }
      setNotes(existingData.notes || "");
    } else {
      setMode("available");
      setSelectedSlots([]);
      setNotes("");
    }
  }, [existingData, isOpen]);

  const handleToggleSlot = (slot: string) => {
    setSelectedSlots(prev => 
      prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]
    );
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      if (mode === "available") {
        // Technically we should delete the record, but we'll use a specific save payload
        await onDelete();
      } else {
        await onSave({
          date: format(date, "yyyy-MM-dd"),
          isFullDay: mode === "full_day",
          slots: mode === "partial" ? selectedSlots : [],
          reason: "personal",
          notes: notes
        });
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card rounded-2xl w-full max-w-lg shadow-elevated overflow-hidden"
          >
            {/* Header */}
            <div className="bg-secondary/50 p-5 relative border-b border-border">
              <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
              <h2 className="font-serif text-xl font-bold text-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                {format(date, "EEEE, MMMM do, yyyy")}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Manage your availability for this specific day.</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Mode Selection */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setMode("available")}
                  className={`p-3 rounded-xl border text-sm font-semibold transition-all flex flex-col items-center gap-1 ${
                    mode === "available" ? "border-sacred-green bg-sacred-green/10 text-sacred-green" : "border-border hover:border-sacred-green/50 text-foreground"
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-sacred-green/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-sacred-green" />
                  </div>
                  Fully Available
                </button>

                <button
                  onClick={() => setMode("partial")}
                  className={`p-3 rounded-xl border text-sm font-semibold transition-all flex flex-col items-center gap-1 ${
                    mode === "partial" ? "border-orange-500 bg-orange-500/10 text-orange-600" : "border-border hover:border-orange-500/50 text-foreground"
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-orange-500/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                  </div>
                  Specific Hours
                </button>

                <button
                  onClick={() => setMode("full_day")}
                  className={`p-3 rounded-xl border text-sm font-semibold transition-all flex flex-col items-center gap-1 ${
                    mode === "full_day" ? "border-destructive bg-destructive/10 text-destructive" : "border-border hover:border-destructive/50 text-foreground"
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-destructive/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-destructive" />
                  </div>
                  Full Day Off
                </button>
              </div>

              {/* Time Slots (if partial) */}
              <AnimatePresence>
                {mode === "partial" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2 pt-2">
                      <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-orange-500" /> Select Busy Hours
                      </label>
                      <p className="text-xs text-muted-foreground mb-3">Select the hours you are UNABLE to take bookings.</p>
                      
                      <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-2 pb-2">
                        {HOURS.map(slot => (
                          <button
                            key={slot}
                            onClick={() => handleToggleSlot(slot)}
                            className={`py-2 px-1 text-xs font-medium rounded-lg transition-all border ${
                              selectedSlots.includes(slot)
                                ? "bg-orange-500 text-white border-orange-600 shadow-sm"
                                : "bg-card text-foreground border-border hover:border-orange-300"
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Warning for Full Day */}
              {mode === "full_day" && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 flex gap-3 text-destructive">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-medium">You will not receive any booking requests for this entire day.</p>
                </div>
              )}

              {/* Notes */}
              {mode !== "available" && (
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">Add a Note (Optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g., Doctor's appointment, travelling..."
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm outline-none focus:border-primary resize-none"
                  />
                </div>
              )}

              {/* Footer */}
              <div className="pt-4 border-t border-border flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-foreground hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSubmitting || (mode === "partial" && selectedSlots.length === 0)}
                  className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold shadow-soft hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Saving..." : "Save Availability"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ManageAvailabilityModal;
