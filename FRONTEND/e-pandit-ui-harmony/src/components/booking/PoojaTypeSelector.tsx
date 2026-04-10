import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { poojaCategories } from "@/data/mockData";

interface PoojaTypeSelectorProps {
  selected: string;
  onSelect: (type: string) => void;
}

const poojaIcons: Record<string, string> = {
  "Satyanarayan Katha": " ",
  "Griha Pravesh": "🏠",
  "Vivah": "💒",
  "Mundan": "👶",
  "Ganesh Puja": "🐘",
  "Navgraha Shanti": "🪐",
  "Rudrabhishek": "🔱",
  "Vastu Shanti": "🧭",
  "Havan": "🔥",
  "Sunderkand Path": "📖",
};

const PoojaTypeSelector = ({ selected, onSelect }: PoojaTypeSelectorProps) => {
  return (
    <div className="space-y-3">
      <h3 className="font-serif text-lg font-semibold text-foreground">
        Select Pooja Type
      </h3>
      <div className="flex flex-wrap gap-2">
        {poojaCategories.filter((c) => c !== "All").map((pooja, i) => {
          const isSelected = selected === pooja;
          return (
            <motion.button
              key={pooja}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(pooja)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 border ${isSelected
                  ? "bg-gradient-saffron text-primary-foreground border-transparent shadow-soft"
                  : "bg-card text-foreground border-border hover:border-primary hover:bg-secondary"
                }`}
            >
              <span className="text-base">{poojaIcons[pooja] || "🕉️"}</span>
              {pooja}
              {isSelected && <Check className="w-4 h-4" />}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default PoojaTypeSelector;
