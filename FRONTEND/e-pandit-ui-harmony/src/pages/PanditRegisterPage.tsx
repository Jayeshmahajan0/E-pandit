import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, Lock, BookOpen, Globe, IndianRupee, FileText, Eye, EyeOff, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import OrnamentDivider from "@/components/shared/OrnamentDivider";
import { poojaCategories } from "@/data/mockData";
import { indianStates } from "@/data/locationData";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";

const languages = ["Hindi", "Sanskrit", "Marathi", "English", "Gujarati", "Tamil", "Kannada", "Telugu", "Bengali"];

const PanditRegisterPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    experienceYears: "",
    pricePerPooja: "",
    about: "",
    state: "Maharashtra",
    district: "",
    specializations: [] as string[],
    languages: [] as string[],
  });

  const currentStateData = indianStates.find((s) => s.name === form.state);
  const districts = currentStateData?.districts.map((d) => d.name) || [];

  const toggleArrayItem = (field: "specializations" | "languages", item: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(item) ? prev[field].filter((i) => i !== item) : [...prev[field], item],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.fullName || !form.email || !form.password || form.specializations.length === 0 || !form.district) {
      toast.error("Please fill in all required fields including location");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/users/register-pandit", {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        state: form.state,
        district: form.district,
        specializations: form.specializations,
        experienceYears: form.experienceYears ? parseInt(form.experienceYears) : null,
        languages: form.languages,
        pricePerPooja: form.pricePerPooja ? parseInt(form.pricePerPooja) : null,
        about: form.about,
      });

      const { pandit, token } = response.data.data;
      login({
        id: pandit.id,
        role: pandit.role,
        full_name: pandit.full_name,
        email: pandit.email,
        is_online: pandit.is_online
      }, token);

      toast.success("  Registration successful! Welcome to the exact spiritual path.");
      setTimeout(() => {
        navigate("/pandit/dashboard");
      }, 500);

    } catch (error: any) {
      toast.error(error.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-hero">
        <div className="container py-6 md:py-10 max-w-2xl mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <span className="text-4xl mb-3 block"> </span>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">
              Register as a Pandit
            </h1>
            <p className="text-muted-foreground">
              Join E-Pandit and connect with devotees in your area
            </p>
          </motion.div>

          <form onSubmit={handleSubmit}>
            {/* Personal Information */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-2xl p-5 md:p-6 shadow-card mb-5"
            >
              <h2 className="font-serif text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> Personal Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-muted-foreground" /> Full Name *
                  </label>
                  <input
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    placeholder="e.g. Pandit Ramesh Sharma"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground" /> Email *
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground" /> Phone
                  </label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="9876543210"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-muted-foreground" /> Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary pr-10"
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            <OrnamentDivider />

            {/* Professional Information */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-2xl p-5 md:p-6 shadow-card mb-5"
            >
              <h2 className="font-serif text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" /> Professional Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Experience (years)</label>
                  <input
                    type="number"
                    value={form.experienceYears}
                    onChange={(e) => setForm({ ...form, experienceYears: e.target.value })}
                    placeholder="e.g. 10"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    <IndianRupee className="w-3.5 h-3.5 text-muted-foreground" /> Base Price per Pooja (₹)
                  </label>
                  <input
                    type="number"
                    value={form.pricePerPooja}
                    onChange={(e) => setForm({ ...form, pricePerPooja: e.target.value })}
                    placeholder="e.g. 2100"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Specializations */}
              <div className="mb-5">
                <label className="text-sm font-medium text-foreground mb-2 block">Specializations *</label>
                <div className="flex flex-wrap gap-2">
                  {poojaCategories.filter((c) => c !== "All").map((pooja) => {
                    const selected = form.specializations.includes(pooja);
                    return (
                      <button
                        key={pooja}
                        type="button"
                        onClick={() => toggleArrayItem("specializations", pooja)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${selected
                          ? "bg-gradient-saffron text-primary-foreground border-transparent"
                          : "bg-background text-foreground border-border hover:border-primary"
                          }`}
                      >
                        {selected && <Check className="w-3 h-3 inline mr-1" />}
                        {pooja}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Languages */}
              <div className="mb-5">
                <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-muted-foreground" /> Languages
                </label>
                <div className="flex flex-wrap gap-2">
                  {languages.map((lang) => {
                    const selected = form.languages.includes(lang);
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleArrayItem("languages", lang)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${selected
                          ? "bg-maroon text-white border-transparent"
                          : "bg-background text-foreground border-border hover:border-primary"
                          }`}
                      >
                        {selected && <Check className="w-3 h-3 inline mr-1" />}
                        {lang}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* About */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground" /> About You
                </label>
                <textarea
                  value={form.about}
                  onChange={(e) => setForm({ ...form, about: e.target.value })}
                  placeholder="Tell devotees about your experience, training, and what makes your poojas special..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary resize-none"
                />
              </div>
            </motion.div>

            {/* Location */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card rounded-2xl p-5 md:p-6 shadow-card mb-5"
            >
              <h2 className="font-serif text-lg font-bold text-foreground mb-4">📍 Your Location</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">State</label>
                  <select
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value, district: "" })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary"
                  >
                    {indianStates.map((s) => (
                      <option key={s.name} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">District</label>
                  <select
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="">Select district</option>
                    {districts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full py-4 bg-gradient-saffron text-primary-foreground rounded-xl font-bold text-base shadow-soft hover:shadow-glow transition-all disabled:opacity-60"
            >
              {loading ? "Submitting..." : "  Register as Pandit"}
            </motion.button>

            <p className="text-center text-xs text-muted-foreground mt-3">
              Already registered?{" "}
              <button type="button" onClick={() => navigate("/signin")} className="text-primary font-medium hover:underline">
                Sign in here
              </button>
            </p>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default PanditRegisterPage;
