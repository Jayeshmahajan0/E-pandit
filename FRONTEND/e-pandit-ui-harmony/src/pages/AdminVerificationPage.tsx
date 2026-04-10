import { motion } from "framer-motion";
import { ShieldCheck, FileCheck, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { mockPandits } from "@/data/mockData";

const verificationDocs = [
  { name: "Aadhaar Card", status: "verified" as const },
  { name: "Vedic Studies Certificate", status: "verified" as const },
  { name: "Jyotish Diploma", status: "pending" as const },
  { name: "Police Clearance", status: "rejected" as const },
  { name: "Address Proof", status: "verified" as const },
];

const statusIcon = {
  verified: <CheckCircle2 className="w-5 h-5 text-sacred-green" />,
  pending: <AlertCircle className="w-5 h-5 text-gold" />,
  rejected: <XCircle className="w-5 h-5 text-destructive" />,
};

const statusLabel = {
  verified: "Verified",
  pending: "Under Review",
  rejected: "Rejected",
};

const statusBg = {
  verified: "bg-sacred-green/10 border-sacred-green/30",
  pending: "bg-gold/10 border-gold/30",
  rejected: "bg-destructive/10 border-destructive/30",
};

const AdminVerificationPage = () => {
  return (
    <Layout>
      <section className="container py-8 md:py-12 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-primary" />
            Verification Panel
          </h1>
          <p className="text-muted-foreground mb-8">Admin view — Pandit verification status (visual mock)</p>
        </motion.div>

        {/* Priest verification cards */}
        {mockPandits.map((priest, pi) => (
          <motion.div
            key={priest.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: pi * 0.1 }}
            className="bg-card rounded-xl shadow-card p-6 mb-6"
          >
            <div className="flex items-center gap-4 mb-5">
              <img src={priest.image} alt={priest.name} className="w-14 h-14 rounded-xl object-cover" />
              <div>
                <h3 className="font-serif text-lg font-semibold text-foreground">{priest.name}</h3>
                <p className="text-xs text-muted-foreground">{priest.location}</p>
              </div>
              <div className="ml-auto">
                {priest.verified ? (
                  <span className="flex items-center gap-1.5 bg-sacred-green/10 text-sacred-green text-sm font-medium px-3 py-1.5 rounded-full">
                    <CheckCircle2 className="w-4 h-4" /> Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 bg-gold/10 text-gold text-sm font-medium px-3 py-1.5 rounded-full">
                    <AlertCircle className="w-4 h-4" /> Pending
                  </span>
                )}
              </div>
            </div>

            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-primary" />
              Document Status
            </h4>

            <div className="space-y-2">
              {verificationDocs.map((doc) => (
                <div
                  key={doc.name}
                  className={`flex items-center justify-between p-3 rounded-lg border ${statusBg[doc.status]}`}
                >
                  <span className="text-sm text-foreground">{doc.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{statusLabel[doc.status]}</span>
                    {statusIcon[doc.status]}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </section>
    </Layout>
  );
};

export default AdminVerificationPage;
