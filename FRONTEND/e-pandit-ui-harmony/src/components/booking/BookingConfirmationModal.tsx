import { motion, AnimatePresence } from "framer-motion";
import { X, Star, MapPin, IndianRupee, Calendar, Clock, CreditCard, Banknote } from "lucide-react";
import type { PanditProfile } from "@/data/mockData";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import PanchangCard from "./PanchangCard";

interface BookingConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { paymentMethod: string; scheduledDate: string; scheduledTime: string; notes: string; address: string; amount: number }) => void;
  pandit: PanditProfile;
  poojaType: string;
}

const BookingConfirmationModal = ({ isOpen, onClose, onConfirm, pandit, poojaType }: BookingConfirmationModalProps) => {
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [notes, setNotes] = useState("");
  const [address, setAddress] = useState("");
  const [includePoojaKit, setIncludePoojaKit] = useState(false);

  const totalAmount = pandit.pricePerPooja + (includePoojaKit ? 501 : 0);

  const [panchangData, setPanchangData] = useState<any>(null);
  const [loadingPanchang, setLoadingPanchang] = useState(false);

  useEffect(() => {
    if (!scheduledDate) {
      setPanchangData(null);
      return;
    }
    const fetchPanchang = async () => {
      setLoadingPanchang(true);
      try {
        const res = await api.get(`/panchang?date=${scheduledDate}`);
        setPanchangData(res.data.data);
      } catch (err) {
        console.error("Failed to fetch panchang data");
      } finally {
        setLoadingPanchang(false);
      }
    };
    fetchPanchang();
  }, [scheduledDate]);

  const handleConfirm = () => {
    const finalNotes = includePoojaKit ? `[Includes Premium Pooja Kit]\n${notes}` : notes;
    onConfirm({ paymentMethod, scheduledDate, scheduledTime, notes: finalNotes, address, amount: totalAmount });
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
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-elevated"
          >
            {/* Header */}
            <div className="bg-gradient-maroon p-5 rounded-t-2xl relative">
              <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
                <X className="w-5 h-5" />
              </button>
              <h2 className="font-serif text-xl font-bold text-white">Confirm Booking</h2>
              <p className="text-white/70 text-sm mt-1">Review your booking details</p>
            </div>

            <div className="p-5 space-y-4">
              {/* Pandit info */}
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                <img src={pandit.image} alt={pandit.name} className="w-14 h-14 rounded-xl object-cover" />
                <div className="flex-1">
                  <h3 className="font-serif font-semibold text-foreground">{pandit.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Star className="w-3 h-3 text-primary fill-primary" />
                    {pandit.rating} • <MapPin className="w-3 h-3" /> {pandit.district}
                  </div>
                </div>
              </div>

              {/* Pooja type & amount */}
              <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
                <div>
                  <p className="text-xs text-muted-foreground">Pooja Type</p>
                  <p className="font-semibold text-foreground">{poojaType}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Amount</p>
                  <p className="font-bold text-primary text-lg flex items-center gap-1">
                    <IndianRupee className="w-4 h-4" />₹{totalAmount.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground" /> Your Address
                </label>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your full address"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> Date
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl border border-border bg-background text-sm outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" /> Time
                  </label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl border border-border bg-background text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Dynamic Panchang Card Integration */}
              {(scheduledDate || loadingPanchang) && (
                <div className="mt-2">
                  <PanchangCard data={panchangData} loading={loadingPanchang} />
                </div>
              )}

              {/* Payment method */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "cash", label: "Cash", icon: Banknote },
                    { value: "upi", label: "UPI", icon: CreditCard },
                  ].map((method) => (
                    <button
                      key={method.value}
                      onClick={() => setPaymentMethod(method.value)}
                      className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${paymentMethod === method.value
                          ? "border-primary bg-secondary text-primary"
                          : "border-border text-foreground hover:border-primary"
                        }`}
                    >
                      <method.icon className="w-4 h-4" />
                      {method.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pooja Kit Addon */}
              <div className="flex items-center gap-3 p-3 bg-saffron/10 border border-saffron/30 rounded-xl">
                <input
                  type="checkbox"
                  id="pooja-kit-addon"
                  checked={includePoojaKit}
                  onChange={(e) => setIncludePoojaKit(e.target.checked)}
                  className="w-5 h-5 rounded border-saffron text-primary focus:ring-primary/20 accent-primary"
                />
                <label htmlFor="pooja-kit-addon" className="flex-1 cursor-pointer">
                  <span className="block text-sm font-semibold text-foreground">Add Premium Pooja Kit</span>
                  <span className="block text-xs text-muted-foreground">Includes all essential verified samagri for the pooja (+₹501)</span>
                </label>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Special Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special requirements..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm outline-none focus:border-primary resize-none"
                />
              </div>

              {/* Confirm button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirm}
                className="w-full py-3.5 bg-gradient-saffron text-primary-foreground rounded-xl font-bold text-sm shadow-soft hover:shadow-glow transition-all"
              >
                Confirm Booking — ₹{totalAmount.toLocaleString("en-IN")}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BookingConfirmationModal;
