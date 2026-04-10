import { motion } from "framer-motion";
import { User, MapPin, Calendar, Shield, Edit3 } from "lucide-react";

interface ProfileHeaderProps {
  name: string;
  email: string;
  location: string;
  joinedDate: string;
  isVerified: boolean;
  avatarUrl?: string;
  onEditAvatar?: () => void;
}

const ProfileHeader = ({
  name,
  email,
  location,
  joinedDate,
  isVerified,
  avatarUrl,
  onEditAvatar,
}: ProfileHeaderProps) => {
  // Generate initials from name
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-maroon p-6 md:p-8 shadow-elevated"
    >
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-[0.06]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="mandala" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <circle cx="40" cy="40" r="30" fill="none" stroke="white" strokeWidth="0.5" />
              <circle cx="40" cy="40" r="20" fill="none" stroke="white" strokeWidth="0.5" />
              <circle cx="40" cy="40" r="10" fill="none" stroke="white" strokeWidth="0.5" />
              <circle cx="40" cy="40" r="3" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mandala)" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5 md:gap-6">
        {/* Avatar with initials */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="relative shrink-0"
        >
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-saffron to-gold flex items-center justify-center shadow-glow ring-4 ring-white/20 overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl md:text-4xl font-serif font-bold text-white">
                {initials || <User className="w-10 h-10 text-white" />}
              </span>
            )}
          </div>

          {/* Edit overlay */}
          <button
            onClick={onEditAvatar}
            className="absolute -bottom-1 -right-1 w-9 h-9 bg-saffron rounded-full flex items-center justify-center shadow-soft hover:shadow-glow transition-all duration-300 border-2 border-white/30"
            aria-label="Change avatar"
          >
            <Edit3 className="w-4 h-4 text-white" />
          </button>

          {/* Verified badge */}
          {isVerified && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
              className="absolute -top-1 -right-1 w-8 h-8 bg-sacred-green rounded-full flex items-center justify-center shadow-md border-2 border-white/30"
            >
              <Shield className="w-4 h-4 text-white fill-white" />
            </motion.div>
          )}
        </motion.div>

        {/* Info */}
        <div className="text-center sm:text-left flex-1">
          <motion.h1
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="font-serif text-2xl md:text-3xl font-bold text-white mb-1"
          >
            {name || "New User"}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white/70 text-sm md:text-base mb-3"
          >
            {email || "Set up your profile below"}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center sm:justify-start gap-3"
          >
            {location && (
              <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm text-white/90 text-xs font-medium px-3 py-1.5 rounded-full">
                <MapPin className="w-3 h-3" />
                {location}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm text-white/90 text-xs font-medium px-3 py-1.5 rounded-full">
              <Calendar className="w-3 h-3" />
              Member since {joinedDate}
            </span>
            {isVerified && (
              <span className="inline-flex items-center gap-1.5 bg-sacred-green/30 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                <Shield className="w-3 h-3" />
                Verified
              </span>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileHeader;
