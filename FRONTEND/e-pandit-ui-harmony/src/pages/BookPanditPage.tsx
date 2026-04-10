import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Search, Loader2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import PoojaTypeSelector from "@/components/booking/PoojaTypeSelector";
import NearbyPanditCard from "@/components/booking/NearbyPanditCard";
import BookingConfirmationModal from "@/components/booking/BookingConfirmationModal";
import OrnamentDivider from "@/components/shared/OrnamentDivider";
import { type PanditProfile, type BookingData } from "@/data/mockData";
import { indianStates } from "@/data/locationData";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";

const BookPanditPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedPooja, setSelectedPooja] = useState("");
  const [selectedState, setSelectedState] = useState("Maharashtra");
  const [selectedDistrict, setSelectedDistrict] = useState("Pune");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedPandit, setSelectedPandit] = useState<PanditProfile | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const currentStateData = indianStates.find((s) => s.name === selectedState);
  const districts = currentStateData?.districts.map((d) => d.name) || [];

  const [allNearbyPandits, setAllNearbyPandits] = useState<PanditProfile[]>([]);

  const fetchPandits = async () => {
    try {
      const { data } = await api.get(`/users/nearby-pandits?district=${selectedDistrict}`);
      const formattedPandits: PanditProfile[] = data.data.map((p: any) => ({
        id: p.id,
        name: p.full_name || p.name || 'Pandit',
        image: p.avatar_url || p.image || "https://images.unsplash.com/photo-1542103749-8ef59b94f47e?auto=format&fit=crop&q=80&w=200",
        rating: p.rating || 4.5,
        reviews: p.reviewsCount || p.reviews || 0,
        experience: p.experience_years || p.experience || 0,
        languages: p.languages || [],
        specializations: p.specializations || [],
        location: `${p.district || 'Unknown'}, ${p.state || 'Maharashtra'}`,
        district: p.district || 'Pune',
        state: p.state || 'Maharashtra',
        pricePerPooja: p.price_per_pooja || p.pricePerPooja || 1000,
        priceRange: `₹${p.price_per_pooja || p.pricePerPooja || 1000} - ₹${((p.price_per_pooja || p.pricePerPooja || 1000) * 4).toLocaleString('en-IN')}`,
        about: p.about || 'Experienced Vedic Pandit',
        verified: p.is_verified ?? p.verified ?? true,
        online: p.is_online ?? p.online ?? true,
      }));
      setAllNearbyPandits(formattedPandits);
    } catch (error) {
      console.error("Failed to fetch pandits", error);
      toast.error("Could not load pandits for this area.");
    }
  };

  const nearbyPandits = useMemo(() => {
    let filtered = allNearbyPandits;
    if (selectedPooja) {
      filtered = filtered.filter((p) => p.specializations?.includes(selectedPooja));
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.specializations?.some((s) => s.toLowerCase().includes(q))
      );
    }
    return filtered;
  }, [allNearbyPandits, selectedPooja, searchQuery]);

  const handleBookPandit = (pandit: PanditProfile) => {
    if (!user) {
      toast.error("Please sign in to book a pandit  ");
      navigate("/signin");
      return;
    }
    setSelectedPandit(pandit);
    setShowConfirmation(true);
  };

  const handleConfirmBooking = async (data: { paymentMethod: string; scheduledDate: string; scheduledTime: string; notes: string; address: string; amount: number }) => {
    setLoading(true);
    setShowConfirmation(false);

    try {
      const payload = {
        userId: user?.id,
        panditId: selectedPandit!.id,
        poojaType: selectedPooja,
        userAddress: data.address || "Pune, Maharashtra",
        userLat: 18.5204, // Mocked for UI since we don't have map selector
        userLng: 73.8567,
        scheduledDate: data.scheduledDate || new Date().toISOString().split("T")[0],
        scheduledTime: data.scheduledTime || "09:00",
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        notes: data.notes
      };

      const response = await api.post("/bookings", payload);
      const newBooking = response.data.data;

      toast.success("Booking request sent!   Waiting for pandit to accept...");
      navigate(`/booking/${newBooking.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to create booking.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-hero">
        <div className="container py-6 md:py-10">
          {/* Page header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-1">
              Book a Pandit
            </h1>
            <p className="text-muted-foreground">
              Find and book a verified pandit for your ceremony
            </p>
          </motion.div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <button
                  onClick={() => { if (s < step || (s === 2 && selectedPooja) || s === 1) setStep(s); }}
                  className={`w-8 h-8 rounded-full text-sm font-bold flex items-center justify-center transition-all ${step >= s
                    ? "bg-gradient-saffron text-primary-foreground shadow-soft"
                    : "bg-muted text-muted-foreground"
                    }`}
                >
                  {s}
                </button>
                <span className={`text-xs font-medium hidden sm:inline ${step >= s ? "text-primary" : "text-muted-foreground"}`}>
                  {s === 1 ? "Select Pooja" : s === 2 ? "Location" : "Choose Pandit"}
                </span>
                {s < 3 && <ArrowRight className="w-4 h-4 text-muted-foreground mx-1" />}
              </div>
            ))}
          </div>

          {/* Step content */}
          <AnimatePresence mode="wait">
            {/* Step 1: Select Pooja */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-card rounded-2xl p-5 md:p-8 shadow-card"
              >
                <PoojaTypeSelector selected={selectedPooja} onSelect={setSelectedPooja} />

                {selectedPooja && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
                    <button
                      onClick={() => setStep(2)}
                      className="px-8 py-3 bg-gradient-saffron text-primary-foreground rounded-xl font-bold text-sm shadow-soft hover:shadow-glow transition-all flex items-center gap-2"
                    >
                      Continue <ArrowRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Step 2: Location */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-card rounded-2xl p-5 md:p-8 shadow-card"
              >
                <h3 className="font-serif text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Set Your Location
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">State</label>
                    <select
                      value={selectedState}
                      onChange={(e) => { setSelectedState(e.target.value); setSelectedDistrict(""); }}
                      className="w-full px-4 py-3 border border-border rounded-xl bg-background text-sm focus:outline-none focus:border-primary"
                    >
                      {indianStates.map((s) => (
                        <option key={s.name} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">District</label>
                    <select
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      className="w-full px-4 py-3 border border-border rounded-xl bg-background text-sm focus:outline-none focus:border-primary"
                    >
                      <option value="">Select district</option>
                      {districts.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {selectedDistrict && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-xl mb-4">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">{selectedDistrict}, {selectedState}</span>
                    </div>
                    <button
                      onClick={() => {
                        setStep(3);
                        fetchPandits();
                      }}
                      className="px-8 py-3 bg-gradient-saffron text-primary-foreground rounded-xl font-bold text-sm shadow-soft hover:shadow-glow transition-all flex items-center gap-2"
                    >
                      Find Pandits <ArrowRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Step 3: Choose Pandit */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                {/* Search */}
                <div className="mb-4 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by name or specialization..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary shadow-card"
                  />
                </div>

                {/* Summary badge */}
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <span className="px-3 py-1.5 bg-secondary text-sm rounded-full flex items-center gap-1">
                    🕉️ {selectedPooja}
                  </span>
                  <span className="px-3 py-1.5 bg-secondary text-sm rounded-full flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {selectedDistrict}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {nearbyPandits.length} pandit{nearbyPandits.length !== 1 ? "s" : ""} available
                  </span>
                </div>

                {/* Results */}
                <div className="space-y-3">
                  {nearbyPandits.length > 0 ? (
                    nearbyPandits.map((pandit, i) => (
                      <NearbyPanditCard
                        key={pandit.id}
                        pandit={pandit}
                        index={i}
                        onBook={handleBookPandit}
                      />
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-16 bg-card rounded-2xl shadow-card"
                    >
                      <span className="text-4xl mb-3 block"> </span>
                      <p className="text-muted-foreground text-lg mb-2">
                        No pandits available in {selectedDistrict}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Try a different location or pooja type
                      </p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <OrnamentDivider />
        </div>
      </div>

      {/* Booking confirmation modal */}
      {selectedPandit && (
        <BookingConfirmationModal
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          onConfirm={handleConfirmBooking}
          pandit={selectedPandit}
          poojaType={selectedPooja}
        />
      )}

      {/* Loading overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-card p-8 rounded-2xl text-center shadow-elevated"
            >
              <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-3" />
              <p className="font-serif font-bold text-foreground">Sending booking request...</p>
              <p className="text-xs text-muted-foreground mt-1">Please wait</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default BookPanditPage;
