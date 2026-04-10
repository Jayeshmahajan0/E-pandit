import { motion } from "framer-motion";
import { ShieldCheck, Award, Clock, Users } from "lucide-react";

const badges = [
  { icon: ShieldCheck, label: "Verified Pandits", sublabel: "Background checked" },
  { icon: Award, label: "20+ Years Avg.", sublabel: "Experience" },
  { icon: Clock, label: "On-time", sublabel: "Guaranteed" },
  { icon: Users, label: "50,000+", sublabel: "Happy families" },
];

const TrustBadges = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {badges.map((badge, i) => (
        <motion.div
          key={badge.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
          className="flex flex-col items-center text-center p-4 md:p-6 bg-card rounded-xl shadow-card"
        >
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
            <badge.icon className="w-6 h-6 text-primary" />
          </div>
          <span className="text-sm font-semibold text-foreground">{badge.label}</span>
          <span className="text-xs text-muted-foreground">{badge.sublabel}</span>
        </motion.div>
      ))}
    </div>
  );
};

export default TrustBadges;
