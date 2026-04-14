import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Star, MapPin, Filter, X } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import AnimatedCTAButton from "@/components/shared/AnimatedCTAButton";
import SkeletonCard from "@/components/shared/SkeletonCard";
import { mockPandits, poojaCategories, type PanditProfile } from "@/data/mockData";
import { useEffect } from "react";
import api from "@/lib/api";

const PriestCard = ({ priest, index }: { priest: PanditProfile; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ delay: index * 0.08, duration: 0.4 }}
    whileHover={{ y: -4 }}
    className="bg-card rounded-xl overflow-hidden shadow-card hover:shadow-elevated transition-shadow duration-300"
  >
    <div className="relative">
      <img src={priest.image} alt={priest.name} className="w-full aspect-square object-cover" />
      {priest.verified ? (
        <span className="absolute top-3 right-3 bg-sacred-green text-white text-xs font-semibold px-2.5 py-1 rounded-full border border-sacred-green/20">
          ✓ Verified
        </span>
      ) : (
        <span className="absolute top-3 right-3 bg-gold text-white text-xs font-semibold px-2.5 py-1 rounded-full border border-gold/20">
          Pending
        </span>
      )}
      {!priest.online && (
        <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center">
          <span className="bg-card text-foreground text-sm font-semibold px-4 py-2 rounded-lg">
            Currently Unavailable
          </span>
        </div>
      )}
    </div>
    <div className="p-5">
      <h3 className="font-serif text-lg font-semibold text-foreground mb-1">{priest.name}</h3>
      <div className="flex items-center gap-1 mb-2">
        <Star className="w-4 h-4 text-primary fill-primary" />
        <span className="text-sm font-medium text-foreground">{priest.rating}</span>
        <span className="text-xs text-muted-foreground">({priest.reviews} reviews)</span>
      </div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
        <MapPin className="w-3 h-3" />
        {priest.location}
      </div>
      <p className="text-xs text-muted-foreground mb-2">
        {priest.experience} years experience • {priest.languages.join(", ")}
      </p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {priest.specializations.slice(0, 3).map((s) => (
          <span key={s} className="bg-secondary text-secondary-foreground text-xs px-2 py-0.5 rounded-full">
            {s}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-primary">{priest.priceRange}</span>
        <Link to={`/book`}>
          <AnimatedCTAButton size="sm">Book Now</AnimatedCTAButton>
        </Link>
      </div>
    </div>
  </motion.div>
);

const PriestsPage = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [allPandits, setAllPandits] = useState<PanditProfile[]>([]);

  useEffect(() => {
    const fetchAllPandits = async () => {
      try {
        const { data } = await api.get(`/users/nearby-pandits`);
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
          verified: p.verification_status === "verified" || (p.is_verified ?? p.verified ?? true),
          online: p.is_online ?? p.online ?? true,
        }));
        setAllPandits(formattedPandits);
      } catch (error) {
        console.error("Failed to fetch all pandits:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllPandits();
  }, []);

  const filtered = allPandits.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.specializations || []).some((s) => s.toLowerCase().includes(search.toLowerCase()));
    const matchesCat =
      activeCategory === "All" || (p.specializations || []).includes(activeCategory);
    return matchesSearch && matchesCat;
  });

  return (
    <Layout>
      <section className="container py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">
            Find Your Pandit
          </h1>
          <p className="text-muted-foreground">Browse verified priests for your ceremony</p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-3 mb-6"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, pooja, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-card border border-input rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-3 bg-card border border-input rounded-xl md:hidden"
          >
            <Filter className="w-5 h-5 text-foreground" />
          </button>
        </motion.div>

        {/* Pill filters */}
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide ${
              !showFilters ? "hidden md:flex" : "flex"
            }`}
          >
            {poojaCategories.map((cat) => (
              <motion.button
                key={cat}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "bg-card text-foreground border border-input hover:bg-secondary"
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory + search}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filtered.length > 0 ? (
                filtered.map((p, i) => <PriestCard key={p.id} priest={p} index={i} />)
              ) : (
                <div className="col-span-full text-center py-16">
                  <p className="text-muted-foreground text-lg">No pandits found matching your criteria.</p>
                  <button
                    onClick={() => { setSearch(""); setActiveCategory("All"); }}
                    className="mt-3 text-primary font-medium hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </section>
    </Layout>
  );
};

export default PriestsPage;
