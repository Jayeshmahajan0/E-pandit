import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Phone, Lock, BookOpen, Globe, IndianRupee, FileText, Check, UploadCloud, MapPin, Activity, ArrowRight, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import OrnamentDivider from "@/components/shared/OrnamentDivider";
import { poojaCategories } from "@/data/mockData";
import { indianStates } from "@/data/locationData";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";

const languagesList = ["Hindi", "Sanskrit", "Marathi", "English", "Gujarati", "Tamil", "Kannada", "Telugu", "Bengali"];
const specializationTypes = ["Vedic", "Shaiva", "Vaishnava", "Shaktism", "Tantric", "Jyotish"];

const PanditRegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const { login } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);

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
    dob: "",
    gotra: "",
    regionalTraditions: "",
    serviceRadiusKm: 10,
    minBookingNoticeHours: 24,
    profilePhotoUrl: "",
    aadharFrontUrl: "",
    bankAccountNumber: "",
    bankIfsc: "",
    bankName: ""
  });

  const currentStateData = indianStates.find((s) => s.name === form.state);
  const districts = currentStateData?.districts.map((d) => d.name) || [];

  const toggleArrayItem = (field: "specializations" | "languages", item: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(item) ? prev[field].filter((i) => i !== item) : [...prev[field], item],
    }));
  };

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be smaller than 2MB");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploadingImage(true);
    try {
      const res = await api.post("/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setForm(prev => ({ ...prev, profilePhotoUrl: res.data.url }));
      toast.success("Profile photo uploaded!");
    } catch (err) {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Only PDF documents are allowed");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Document must be smaller than 2MB");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploadingDoc(true);
    try {
      const res = await api.post("/upload/document", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setForm(prev => ({ ...prev, aadharFrontUrl: res.data.url }));
      toast.success("Document uploaded securely!");
    } catch (err) {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploadingDoc(false);
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        toast.success(`Location detected! Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)}`);
        // Normally reverse geocoding happens here, but to save credits, we ask for manual district entry in addition
      }, () => {
        toast.error("Unable to retrieve your location");
      });
    } else {
      toast.error("Geolocation is not supported by your browser");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 6) {
      handleNext();
      return;
    }

    if (!form.fullName || !form.email || !form.password || form.specializations.length === 0 || !form.district) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/users/register-pandit", {
        ...form,
        experienceYears: form.experienceYears ? parseInt(form.experienceYears) : null,
        pricePerPooja: form.pricePerPooja ? parseInt(form.pricePerPooja) : null,
      });

      const { pandit, token } = response.data.data;
      login({
        id: pandit.id,
        role: pandit.role,
        full_name: pandit.full_name,
        email: pandit.email,
        is_online: pandit.is_online
      }, token);

      toast.success("Registration submitted! Pending admin verification.");
      setTimeout(() => {
        navigate("/pandit/dashboard");
      }, 1500);

    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-hero">
        <div className="container py-6 md:py-10 max-w-3xl mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">
              Pandit Registration Form
            </h1>
            <p className="text-muted-foreground">
              Step {step} of 6
            </p>
            {/* Progress Bar */}
            <div className="w-full bg-muted h-2 rounded-full mt-4 overflow-hidden">
              <div className="bg-primary h-full transition-all duration-300" style={{ width: `${(step / 6) * 100}%` }} />
            </div>
          </motion.div>

          <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 md:p-8 shadow-card mb-5 relative overflow-hidden">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="font-serif text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" /> Personal Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 md:col-span-2 flex flex-col items-center mb-4">
                      <div className="w-24 h-24 rounded-full border-4 border-muted overflow-hidden bg-muted flex items-center justify-center cursor-pointer relative" onClick={() => fileInputRef.current?.click()}>
                        {form.profilePhotoUrl ? (
                          <img src={form.profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <UploadCloud className="w-8 h-8 text-muted-foreground" />
                        )}
                        {uploadingImage && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs">Uploading...</div>}
                      </div>
                      <span className="text-sm mt-2 text-primary font-medium cursor-pointer" onClick={() => fileInputRef.current?.click()}>Upload Profile Photo</span>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Full Name *</label>
                      <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="e.g. Pandit Ramesh Sharma" className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" required />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Email *</label>
                      <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary" required />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Phone</label>
                      <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="9876543210" className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Date of Birth</label>
                      <input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary" />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-sm font-medium text-foreground">Password *</label>
                      <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary" required />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="font-serif text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" /> Location & Service Area
                  </h2>
                  <div className="mb-6 flex justify-center">
                    <button type="button" onClick={getLocation} className="flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary hover:text-white transition-all">
                      <MapPin className="w-4 h-4" /> Auto-Detect Current GPS Location
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">State</label>
                      <select value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value, district: "" })} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary">
                        {indianStates.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">District</label>
                      <select value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary">
                        <option value="">Select district</option>
                        {districts.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5 md:col-span-2 mt-4">
                      <label className="text-sm font-medium text-foreground flex justify-between">
                        <span>Service Radius</span>
                        <span className="text-primary font-bold">{form.serviceRadiusKm} km</span>
                      </label>
                      <input type="range" min="1" max="100" value={form.serviceRadiusKm} onChange={(e) => setForm({...form, serviceRadiusKm: parseInt(e.target.value)})} className="w-full accent-primary" />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="font-serif text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" /> Professional Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Experience (years)</label>
                      <input type="number" value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: e.target.value })} placeholder="e.g. 10" className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Gotra</label>
                      <input type="text" value={form.gotra} onChange={(e) => setForm({ ...form, gotra: e.target.value })} placeholder="e.g. Bharadwaj" className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary" />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-sm font-medium text-foreground">Regional Traditions</label>
                      <input type="text" value={form.regionalTraditions} onChange={(e) => setForm({ ...form, regionalTraditions: e.target.value })} placeholder="e.g. Maharashtrian, North Indian" className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary" />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-sm font-medium text-foreground">About You</label>
                      <textarea value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })} placeholder="Tell devotees about your experience..." rows={3} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary resize-none" />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="font-serif text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" /> Pooja Specializations
                  </h2>
                  <div className="mb-5">
                    <label className="text-sm font-medium text-foreground mb-2 block">Pooja Types *</label>
                    <div className="flex flex-wrap gap-2">
                      {poojaCategories.filter((c) => c !== "All").map((pooja) => {
                        const selected = form.specializations.includes(pooja);
                        return (
                          <button key={pooja} type="button" onClick={() => toggleArrayItem("specializations", pooja)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${selected ? "bg-gradient-saffron text-primary-foreground border-transparent" : "bg-background text-foreground border-border hover:border-primary"}`}>
                            {selected && <Check className="w-3 h-3 inline mr-1" />}
                            {pooja}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="mb-5">
                    <label className="text-sm font-medium text-foreground mb-2 block">Spoken Languages</label>
                    <div className="flex flex-wrap gap-2">
                      {languagesList.map((lang) => {
                        const selected = form.languages.includes(lang);
                        return (
                          <button key={lang} type="button" onClick={() => toggleArrayItem("languages", lang)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${selected ? "bg-maroon text-white border-transparent" : "bg-background text-foreground border-border hover:border-primary"}`}>
                            {selected && <Check className="w-3 h-3 inline mr-1" />}
                            {lang}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 5 && (
                <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="font-serif text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <IndianRupee className="w-5 h-5 text-primary" /> Pricing & Availability
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-sm font-medium text-foreground">Base Price per Pooja (₹)</label>
                      <input type="number" value={form.pricePerPooja} onChange={(e) => setForm({ ...form, pricePerPooja: e.target.value })} placeholder="e.g. 2100" className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary" />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-sm font-medium text-foreground">Min Booking Notice Time (Hours)</label>
                      <input type="number" min="1" value={form.minBookingNoticeHours} onChange={(e) => setForm({ ...form, minBookingNoticeHours: parseInt(e.target.value) })} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary" />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 6 && (
                <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="font-serif text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" /> Document Verification
                  </h2>
                  <div className="space-y-6">
                    <div className="p-4 border-2 border-dashed border-border rounded-xl text-center cursor-pointer hover:border-primary transition-all bg-muted/50" onClick={() => docInputRef.current?.click()}>
                      <UploadCloud className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm font-medium text-foreground">Upload Aadhar / ID Proof</p>
                      <p className="text-xs text-muted-foreground mt-1">PDF file max 2MB</p>
                      {form.aadharFrontUrl && <p className="text-xs text-sacred-green mt-2 font-bold flex items-center justify-center gap-1"><Check className="w-3 h-3"/> Document securely uploaded</p>}
                      <input type="file" ref={docInputRef} className="hidden" accept="application/pdf" onChange={handleDocUpload} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Bank Account No.</label>
                        <input type="text" value={form.bankAccountNumber} onChange={(e) => setForm({ ...form, bankAccountNumber: e.target.value })} placeholder="Account Number" className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Bank IFSC</label>
                        <input type="text" value={form.bankIfsc} onChange={(e) => setForm({ ...form, bankIfsc: e.target.value })} placeholder="IFSC Code" className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-8 flex justify-between items-center pt-5 border-t border-border">
              {step > 1 ? (
                <button type="button" onClick={handleBack} className="px-5 py-2.5 rounded-lg border border-border text-foreground font-medium hover:bg-muted transition-all flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              ) : (
                <div></div>
              )}
              
              <button 
                type={step === 6 ? "submit" : "button"} 
                onClick={step < 6 ? handleNext : undefined}
                disabled={loading || uploadingImage || uploadingDoc} 
                className="px-6 py-2.5 bg-gradient-saffron text-primary-foreground rounded-lg font-bold shadow-soft hover:shadow-glow transition-all flex items-center gap-2 disabled:opacity-60"
              >
                {step === 6 ? (loading ? "Submitting..." : "Submit Registration") : "Next Step"}
                {step < 6 && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default PanditRegisterPage;
