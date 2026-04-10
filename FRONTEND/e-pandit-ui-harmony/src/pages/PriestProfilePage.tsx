import { motion } from "framer-motion";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Star, MapPin, Languages, Clock, ShieldCheck, Award,
  ChevronLeft, FileText, Zap
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import AnimatedCTAButton from "@/components/shared/AnimatedCTAButton";
import { mockPandits } from "@/data/mockData";

const PriestProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const priest = mockPandits.find((p) => p.id === id) || mockPandits[0];

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="container relative py-8 md:py-12">
          <Link to="/priests" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to Pandits
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Image + Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-1"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-elevated">
                <img src={priest.image} alt={priest.name} className="w-full aspect-[3/4] object-cover" />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-foreground/60 to-transparent p-5">
                  <h1 className="font-serif text-2xl font-bold text-primary-foreground">{priest.name}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="w-4 h-4 text-gold fill-gold" />
                    <span className="text-sm text-primary-foreground font-medium">{priest.rating}</span>
                    <span className="text-xs text-primary-foreground/70">({priest.reviews} reviews)</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Info grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Clock, label: "Experience", value: `${priest.experience} years` },
                  { icon: MapPin, label: "Location", value: priest.district },
                  { icon: Languages, label: "Languages", value: priest.languages.length.toString() },
                  { icon: Award, label: "Price", value: `₹${priest.pricePerPooja.toLocaleString("en-IN")}` },
                ].map((item) => (
                  <div key={item.label} className="bg-card rounded-xl p-4 shadow-card">
                    <item.icon className="w-5 h-5 text-primary mb-2" />
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-sm font-semibold text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* About */}
              {priest.about && (
                <div>
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-2">About</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{priest.about}</p>
                </div>
              )}

              {/* Specializations */}
              <div>
                <h3 className="font-serif text-lg font-semibold text-foreground mb-3">Specializations</h3>
                <div className="flex flex-wrap gap-2">
                  {priest.specializations.map((s) => (
                    <span key={s} className="bg-secondary text-secondary-foreground text-sm px-3 py-1.5 rounded-full">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div>
                <h3 className="font-serif text-lg font-semibold text-foreground mb-3">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {priest.languages.map((l) => (
                    <span key={l} className="bg-card border border-input text-foreground text-sm px-3 py-1.5 rounded-full">
                      {l}
                    </span>
                  ))}
                </div>
              </div>

              {/* Certificates (mock) */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" /> Verified Credentials
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {["Vedic Studies Certificate", "Jyotish Certification", "ID Verification"].map((doc) => (
                    <div key={doc} className="bg-card border border-input rounded-lg p-3 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-sacred-green flex-shrink-0" />
                      <span className="text-xs text-foreground">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Book Now */}
              <div className="bg-card rounded-xl p-6 shadow-card">
                <h3 className="font-serif text-lg font-semibold text-foreground mb-2">Ready to Book?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {priest.online
                    ? "This pandit is currently online and available for booking."
                    : "This pandit is currently offline. You can still browse and book for a future date."}
                </p>
                <div className="flex items-center gap-3">
                  <div onClick={() => navigate("/book")} className="flex-1">
                    <AnimatedCTAButton size="lg" className="w-full flex items-center justify-center gap-2">
                      <Zap className="w-4 h-4" /> Book This Pandit
                    </AnimatedCTAButton>
                  </div>
                  {priest.online && (
                    <span className="flex items-center gap-1.5 text-xs text-sacred-green font-medium">
                      <span className="w-2 h-2 bg-sacred-green rounded-full animate-pulse" />
                      Online
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PriestProfilePage;
