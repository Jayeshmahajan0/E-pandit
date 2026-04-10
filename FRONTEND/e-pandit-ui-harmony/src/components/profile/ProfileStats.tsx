import { motion } from "framer-motion";
import { BookOpen, Calendar, Star, Clock } from "lucide-react";

interface ProfileStatsProps {
  totalBookings: number;
  upcomingPoojas: number;
  reviewsGiven: number;
  memberSinceMonths: number;
}

const ProfileStats = ({
  totalBookings,
  upcomingPoojas,
  reviewsGiven,
  memberSinceMonths,
}: ProfileStatsProps) => {
  const stats = [
    {
      label: "Total Bookings",
      value: totalBookings,
      icon: BookOpen,
      color: "from-saffron to-gold",
      iconBg: "bg-saffron/10",
      iconColor: "text-saffron",
    },
    {
      label: "Upcoming Poojas",
      value: upcomingPoojas,
      icon: Calendar,
      color: "from-sacred-green to-emerald-600",
      iconBg: "bg-sacred-green/10",
      iconColor: "text-sacred-green",
    },
    {
      label: "Reviews Given",
      value: reviewsGiven,
      icon: Star,
      color: "from-gold to-amber-500",
      iconBg: "bg-gold/10",
      iconColor: "text-gold",
    },
    {
      label: "Member Since",
      value: `${memberSinceMonths}mo`,
      icon: Clock,
      color: "from-maroon to-red-700",
      iconBg: "bg-maroon/10",
      iconColor: "text-maroon",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            whileHover={{ y: -3, scale: 1.02 }}
            className="bg-card rounded-2xl p-4 md:p-5 shadow-card hover:shadow-elevated transition-all duration-300"
          >
            <div
              className={`w-10 h-10 md:w-11 md:h-11 ${stat.iconBg} rounded-xl flex items-center justify-center mb-3`}
            >
              <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
            </div>
            <p className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-0.5">
              {stat.value}
            </p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ProfileStats;
