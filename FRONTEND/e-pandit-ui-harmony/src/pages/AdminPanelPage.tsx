import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, FileCheck, AlertCircle, CheckCircle2, XCircle, ChevronDown, ChevronUp, Mail, Phone, MapPin, Eye, Check, X, User, BookOpen } from "lucide-react";
import Layout from "@/components/layout/Layout";
import api from "@/lib/api";
import { toast } from "sonner";
import { poojaCategories } from "@/data/mockData"; // Ensure extended poojas exist here

const AdminPanelPage = () => {
  const [activeTab, setActiveTab] = useState<"pending" | "verified" | "rejected" | "all">("pending");
  const [pandits, setPandits] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, verified: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [verificationNotes, setVerificationNotes] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const statsRes = await api.get("/admin/stats");
      setStats(statsRes.data.data);
      
      let url = "/admin/all-pandits";
      if (activeTab === "pending") url = "/admin/pending-pandits";
      
      const panditsRes = await api.get(url);
      setPandits(panditsRes.data.data || []);
      
    } catch (error) {
      toast.error("Failed to fetch admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const loadPanditDetails = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    
    try {
      const res = await api.get(`/admin/pandit/${id}`);
      setPandits(prev => prev.map(p => p.id === id ? { ...p, ...res.data.data, fullDetailsLoaded: true } : p));
      setExpandedId(id);
    } catch (error) {
      toast.error("Failed to load details");
    }
  };

  const handleVerify = async (id: string, status: 'verified' | 'rejected') => {
    if (status === 'rejected' && !verificationNotes.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      await api.put(`/admin/verify/${id}`, { status, notes: verificationNotes });
      toast.success(`Pandit successfully ${status}`);
      setVerificationNotes("");
      setExpandedId(null);
      fetchData();
    } catch (error) {
      toast.error(`Failed to ${status} pandit`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <span className="flex items-center gap-1.5 bg-sacred-green/10 text-sacred-green text-sm font-medium px-3 py-1.5 rounded-full border border-sacred-green/20"><CheckCircle2 className="w-4 h-4" /> Verified</span>;
      case 'rejected':
        return <span className="flex items-center gap-1.5 bg-destructive/10 text-destructive text-sm font-medium px-3 py-1.5 rounded-full border border-destructive/20"><XCircle className="w-4 h-4" /> Rejected</span>;
      default:
        return <span className="flex items-center gap-1.5 bg-gold/10 text-gold text-sm font-medium px-3 py-1.5 rounded-full border border-gold/20"><AlertCircle className="w-4 h-4" /> Pending</span>;
    }
  };

  return (
    <Layout>
      <section className="container py-8 md:py-12 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">Manage pandit verifications and system status</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card p-5 rounded-2xl shadow-card border border-border">
            <h3 className="text-sm font-semibold text-muted-foreground mb-1">Total Pandits</h3>
            <p className="text-3xl font-bold text-foreground">{stats.total}</p>
          </div>
          <div className="bg-gold/10 p-5 rounded-2xl shadow-card border border-gold/20">
            <h3 className="text-sm font-semibold text-gold mb-1">Pending</h3>
            <p className="text-3xl font-bold text-gold">{stats.pending}</p>
          </div>
          <div className="bg-sacred-green/10 p-5 rounded-2xl shadow-card border border-sacred-green/20">
            <h3 className="text-sm font-semibold text-sacred-green mb-1">Verified</h3>
            <p className="text-3xl font-bold text-sacred-green">{stats.verified}</p>
          </div>
          <div className="bg-destructive/10 p-5 rounded-2xl shadow-card border border-destructive/20">
             <h3 className="text-sm font-semibold text-destructive mb-1">Rejected</h3>
             <p className="text-3xl font-bold text-destructive">{stats.rejected}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-border pb-px overflow-x-auto">
          {(["pending", "verified", "rejected", "all"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Pandit List */}
        <div className="space-y-4">
          {loading ? (
             <div className="text-center py-10 text-muted-foreground">Loading pandits...</div>
          ) : pandits.length === 0 ? (
             <div className="text-center py-10 text-muted-foreground bg-card rounded-xl border border-border">No pandits found in this category.</div>
          ) : (
            pandits.map((pandit) => (
               <motion.div
                 key={pandit.id}
                 className="bg-card rounded-2xl shadow-card border border-border overflow-hidden"
               >
                 <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => loadPanditDetails(pandit.id)}>
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-full bg-secondary overflow-hidden shrink-0">
                       {pandit.avatar_url || pandit.profile_photo_url ? (
                          <img src={pandit.avatar_url || pandit.profile_photo_url} alt="" className="w-full h-full object-cover" />
                       ) : (
                          <User className="w-6 h-6 m-auto mt-3 text-muted-foreground" />
                       )}
                     </div>
                     <div>
                       <h3 className="font-semibold text-foreground">{pandit.full_name}</h3>
                       <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3"/> {pandit.district || pandit.location}</p>
                     </div>
                   </div>
                   <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                     {getStatusBadge(pandit.verification_status)}
                     <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                       {expandedId === pandit.id ? <ChevronUp className="w-5 h-5"/> : <ChevronDown className="w-5 h-5"/>}
                     </button>
                   </div>
                 </div>

                 <AnimatePresence>
                   {expandedId === pandit.id && pandit.fullDetailsLoaded && (
                     <motion.div
                       initial={{ height: 0, opacity: 0 }}
                       animate={{ height: "auto", opacity: 1 }}
                       exit={{ height: 0, opacity: 0 }}
                       className="border-t border-border bg-muted/10 p-5"
                     >
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         
                         <div className="space-y-4">
                           <h4 className="font-semibold flex items-center gap-2"><User className="w-4 h-4 text-primary"/> Personal & Contact</h4>
                           <div className="space-y-2 text-sm">
                             <p><span className="text-muted-foreground">Email:</span> {pandit.email}</p>
                             <p><span className="text-muted-foreground">Phone:</span> {pandit.phone}</p>
                             <p><span className="text-muted-foreground">Location:</span> {pandit.district}, {pandit.state} ({pandit.pin_code})</p>
                             <p><span className="text-muted-foreground">DOB:</span> {pandit.date_of_birth || "N/A"}</p>
                             <p><span className="text-muted-foreground">Gotra:</span> {pandit.gotra || "N/A"}</p>
                           </div>

                           <h4 className="font-semibold flex items-center gap-2 mt-4"><BookOpen className="w-4 h-4 text-primary"/> Professional</h4>
                           <div className="space-y-2 text-sm">
                             <p><span className="text-muted-foreground">Experience:</span> {pandit.experience_years} years</p>
                             <p><span className="text-muted-foreground">Service Radius:</span> {pandit.service_radius_km} km</p>
                             <p><span className="text-muted-foreground">Regional Traditions:</span> {pandit.regional_traditions || "N/A"}</p>
                             <p><span className="text-muted-foreground">Price/Pooja:</span> ₹{pandit.price_per_pooja}</p>
                             <p><span className="text-muted-foreground">Languages:</span> {(pandit.languages || []).join(", ")}</p>
                           </div>
                         </div>

                         <div className="space-y-4">
                           <h4 className="font-semibold flex items-center gap-2"><FileCheck className="w-4 h-4 text-primary"/> Documents</h4>
                           <div className="space-y-3">
                             <div className="flex items-center justify-between p-3 bg-background border border-border rounded-lg">
                               <span className="text-sm font-medium">Aadhar Front</span>
                               {pandit.aadhar_front_url ? (
                                  <button onClick={() => setPdfUrl(pandit.aadhar_front_url)} className="text-primary text-xs font-semibold flex items-center gap-1 hover:underline"><Eye className="w-3 h-3"/> View</button>
                               ) : <span className="text-xs text-muted-foreground">Not provided</span>}
                             </div>
                             <div className="flex items-center justify-between p-3 bg-background border border-border rounded-lg">
                               <span className="text-sm font-medium">Bank Details</span>
                               <span className="text-xs text-muted-foreground">{pandit.bank_name || "N/A"} - {pandit.bank_account_number || "N/A"} ({pandit.bank_ifsc || "N/A"})</span>
                             </div>
                           </div>

                           {pandit.verification_status === "pending" && (
                              <div className="mt-6 space-y-3 bg-background p-4 rounded-xl border border-border">
                                <h4 className="font-semibold text-sm">Verification Action</h4>
                                <textarea 
                                  value={verificationNotes} 
                                  onChange={e => setVerificationNotes(e.target.value)}
                                  placeholder="Admin notes (required for rejection)" 
                                  className="w-full text-sm p-3 rounded-lg border border-border bg-muted outline-none h-20 resize-none focus:border-primary"
                                />
                                <div className="flex gap-2">
                                  <button onClick={() => handleVerify(pandit.id, 'verified')} className="flex-1 bg-sacred-green/10 text-sacred-green font-bold py-2 rounded-lg border border-sacred-green/20 hover:bg-sacred-green hover:text-white transition-colors flex items-center justify-center gap-2">
                                    <Check className="w-4 h-4"/> Approve
                                  </button>
                                  <button onClick={() => handleVerify(pandit.id, 'rejected')} className="flex-1 bg-destructive/10 text-destructive font-bold py-2 rounded-lg border border-destructive/20 hover:bg-destructive hover:text-white transition-colors flex items-center justify-center gap-2">
                                    <X className="w-4 h-4"/> Reject
                                  </button>
                                </div>
                              </div>
                           )}

                         </div>
                       </div>
                     </motion.div>
                   )}
                 </AnimatePresence>
               </motion.div>
            ))
          )}
        </div>

        {/* PDF Viewer Modal */}
        <AnimatePresence>
          {pdfUrl && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
               <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card w-full max-w-4xl h-[80vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl">
                 <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50">
                   <h3 className="font-semibold flex items-center gap-2"><FileCheck className="w-4 h-4 text-primary"/> Document Viewer</h3>
                   <button onClick={() => setPdfUrl(null)} className="p-1 hover:bg-background rounded text-muted-foreground hover:text-foreground transition-colors"><X className="w-5 h-5"/></button>
                 </div>
                 <div className="flex-1 bg-muted p-2 h-full">
                    <iframe src={pdfUrl} className="w-full h-full rounded-xl" title="Document Viewer" />
                 </div>
               </motion.div>
            </div>
          )}
        </AnimatePresence>

      </section>
    </Layout>
  );
};

export default AdminPanelPage;
