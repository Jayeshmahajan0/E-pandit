import { motion } from "framer-motion";

interface KundliChartProps {
  planets: string[][]; // Array of 12 arrays, representing planets in houses 1-12
  ascendantSign?: number; // 1-12
  className?: string;
}

const HOUSE_COORDS = [
  { x: 50, y: 25 }, // House 1
  { x: 25, y: 15 }, // House 2
  { x: 15, y: 25 }, // House 3
  { x: 25, y: 50 }, // House 4
  { x: 15, y: 75 }, // House 5
  { x: 25, y: 85 }, // House 6
  { x: 50, y: 75 }, // House 7
  { x: 75, y: 85 }, // House 8
  { x: 85, y: 75 }, // House 9
  { x: 75, y: 50 }, // House 10
  { x: 85, y: 25 }, // House 11
  { x: 75, y: 15 }, // House 12
];

const SIGN_COORDS = [
  { x: 50, y: 38 }, // House 1
  { x: 38, y: 5 },  // House 2
  { x: 5,  y: 38 }, // House 3
  { x: 38, y: 50 }, // House 4
  { x: 5,  y: 62 }, // House 5
  { x: 38, y: 95 }, // House 6
  { x: 50, y: 62 }, // House 7
  { x: 62, y: 95 }, // House 8
  { x: 95, y: 62 }, // House 9
  { x: 62, y: 50 }, // House 10
  { x: 95, y: 38 }, // House 11
  { x: 62, y: 5  }, // House 12
];

const PLANET_ABBREVIATIONS: Record<string, string> = {
  "Sun": "Su", "Moon": "Mo", "Mars": "Ma", "Mercury": "Me",
  "Jupiter": "Ju", "Venus": "Ve", "Saturn": "Sa", "Rahu": "Ra", "Ketu": "Ke"
};

const KundliChart = ({ planets, ascendantSign = 1, className = "" }: KundliChartProps) => {
  return (
    <div className={`relative w-full aspect-square max-w-md mx-auto ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full text-primary drop-shadow-sm">
        {/* Background */}
        <rect x="0" y="0" width="100" height="100" fill="currentColor" fillOpacity="0.02" />
        
        {/* Outer Box */}
        <rect x="2" y="2" width="96" height="96" fill="none" stroke="currentColor" strokeWidth="0.8" />
        <rect x="4" y="4" width="92" height="92" fill="none" stroke="currentColor" strokeWidth="1.5" />
        
        {/* Diagonals */}
        <line x1="4" y1="4" x2="96" y2="96" stroke="currentColor" strokeWidth="1" />
        <line x1="4" y1="96" x2="96" y2="4" stroke="currentColor" strokeWidth="1" />
        
        {/* Inner Diamond */}
        <polygon points="50,4 96,50 50,96 4,50" fill="none" stroke="currentColor" strokeWidth="1" />

        {/* Planets rendering */}
        {planets && planets.length === 12 && HOUSE_COORDS.map((coord, index) => {
          const housePlanets = planets[index];
          if (!housePlanets || housePlanets.length === 0) return null;

          // If multiple planets in one house, stack them or arrange them
          // We'll just join them with commas and scale down if needed
          const displayText = housePlanets.map(p => PLANET_ABBREVIATIONS[p] || p).join(", ");
          
          return (
            <motion.text
              key={`h${index}`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              x={coord.x}
              y={coord.y}
              fontSize={housePlanets.length > 2 ? "3.5" : "4.5"}
              fontWeight="bold"
              fill="currentColor"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-foreground"
            >
              {displayText}
            </motion.text>
          );
        })}

        {/* Zodiac Signs Rendering (Small numbers in corners of houses) */}
        {SIGN_COORDS.map((coord, index) => {
          // Calculate which sign goes in this house based on Ascendant
          let signNum = ascendantSign + index;
          if (signNum > 12) signNum -= 12;

          return (
            <text
              key={`s${index}`}
              x={coord.x}
              y={coord.y}
              fontSize="3.5"
              fontWeight="normal"
              fill="currentColor"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-muted-foreground opacity-60"
            >
              {signNum}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

export default KundliChart;
