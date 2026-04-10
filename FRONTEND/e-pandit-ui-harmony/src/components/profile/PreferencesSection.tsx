import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Globe, Bell, BellOff, Check } from "lucide-react";
import { poojaCategories } from "@/data/mockData";

interface PreferencesData {
  preferredPoojas: string[];
  languages: string[];
  notifications: {
    bookingUpdates: boolean;
    promotions: boolean;
    reminders: boolean;
  };
}

interface PreferencesSectionProps {
  initialData?: Partial<PreferencesData>;
  onSave: (data: PreferencesData) => void;
}

const languageOptions = [
  "Hindi",
  "English",
  "Marathi",
  "Sanskrit",
  "Gujarati",
  "Tamil",
  "Kannada",
  "Telugu",
  "Bengali",
];

const PreferencesSection = ({ initialData, onSave }: PreferencesSectionProps) => {
  const [preferredPoojas, setPreferredPoojas] = useState<string[]>(
    initialData?.preferredPoojas || []
  );
  const [languages, setLanguages] = useState<string[]>(
    initialData?.languages || []
  );
  const [notifications, setNotifications] = useState({
    bookingUpdates: initialData?.notifications?.bookingUpdates ?? true,
    promotions: initialData?.notifications?.promotions ?? false,
    reminders: initialData?.notifications?.reminders ?? true,
  });

  const togglePooja = (pooja: string) => {
    setPreferredPoojas((prev) =>
      prev.includes(pooja) ? prev.filter((p) => p !== pooja) : [...prev, pooja]
    );
  };

  const toggleLanguage = (lang: string) => {
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    onSave({ preferredPoojas, languages, notifications });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-card rounded-2xl p-5 md:p-7 shadow-card space-y-6"
    >
      {/* Preferred Poojas */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
            <Heart className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-serif text-lg md:text-xl font-semibold text-foreground">
              Preferred Poojas
            </h2>
            <p className="text-xs text-muted-foreground">
              Select ceremonies you're interested in
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {poojaCategories.filter((c) => c !== "All").map((pooja) => {
            const selected = preferredPoojas.includes(pooja);
            return (
              <motion.button
                key={pooja}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => togglePooja(pooja)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  selected
                    ? "bg-gradient-saffron text-primary-foreground shadow-soft"
                    : "bg-muted text-foreground hover:bg-secondary border border-border"
                }`}
              >
                {selected && <Check className="w-3.5 h-3.5" />}
                {pooja}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Language Preferences */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
            <Globe className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-serif text-lg md:text-xl font-semibold text-foreground">
              Language Preferences
            </h2>
            <p className="text-xs text-muted-foreground">
              Preferred languages for your rituals
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {languageOptions.map((lang) => {
            const selected = languages.includes(lang);
            return (
              <motion.button
                key={lang}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleLanguage(lang)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  selected
                    ? "bg-maroon text-white shadow-soft"
                    : "bg-muted text-foreground hover:bg-secondary border border-border"
                }`}
              >
                {selected && <Check className="w-3.5 h-3.5" />}
                {lang}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Notification Preferences */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-serif text-lg md:text-xl font-semibold text-foreground">
              Notifications
            </h2>
            <p className="text-xs text-muted-foreground">
              Choose what updates you receive
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            {
              key: "bookingUpdates" as const,
              label: "Booking Updates",
              desc: "Get notified about booking confirmations and changes",
            },
            {
              key: "promotions" as const,
              label: "Offers & Promotions",
              desc: "Receive deals and discounts on pooja services",
            },
            {
              key: "reminders" as const,
              label: "Pooja Reminders",
              desc: "Reminders for upcoming scheduled poojas",
            },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between p-4 bg-muted/50 rounded-xl"
            >
              <div className="flex items-center gap-3">
                {notifications[item.key] ? (
                  <Bell className="w-4 h-4 text-primary" />
                ) : (
                  <BellOff className="w-4 h-4 text-muted-foreground" />
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {item.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>

              <button
                onClick={() => toggleNotification(item.key)}
                className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                  notifications[item.key]
                    ? "bg-gradient-to-r from-saffron to-gold"
                    : "bg-border"
                }`}
              >
                <motion.div
                  animate={{ x: notifications[item.key] ? 24 : 2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Save */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSave}
        className="px-6 py-3 bg-gradient-saffron text-primary-foreground rounded-xl font-semibold text-sm shadow-soft hover:shadow-glow transition-all duration-300"
      >
        Save Preferences
      </motion.button>
    </motion.div>
  );
};

export default PreferencesSection;
