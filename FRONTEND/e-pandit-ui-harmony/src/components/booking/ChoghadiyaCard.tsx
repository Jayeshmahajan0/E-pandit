import { useState } from "react";
import { Sunrise, Sunset } from "lucide-react";

interface ChoghadiyaCardProps {
  dayOfWeek: string;
}

// Choghadiya mapping based on traditional Shiva Likhit Vela standard
const choghadiyaData: Record<string, { day: string[], night: string[] }> = {
  Sunday: {
    day: ["Udyog", "Chanchal", "Labh", "Amrut", "Kaal", "Shubh", "Rog", "Udyog"],
    night: ["Shubh", "Amrut", "Chanchal", "Rog", "Kaal", "Udyog", "Labh", "Shubh"]
  },
  Monday: {
    day: ["Amrut", "Kaal", "Shubh", "Rog", "Udyog", "Chanchal", "Labh", "Amrut"],
    night: ["Chanchal", "Rog", "Kaal", "Labh", "Udyog", "Amrut", "Shubh", "Chanchal"]
  },
  Tuesday: {
    day: ["Rog", "Udyog", "Chanchal", "Labh", "Amrut", "Kaal", "Shubh", "Rog"],
    night: ["Kaal", "Labh", "Udyog", "Shubh", "Amrut", "Chanchal", "Rog", "Kaal"]
  },
  Wednesday: {
    day: ["Labh", "Amrut", "Kaal", "Shubh", "Rog", "Udyog", "Chanchal", "Labh"],
    night: ["Udyog", "Shubh", "Amrut", "Chanchal", "Rog", "Kaal", "Labh", "Udyog"]
  },
  Thursday: {
    day: ["Shubh", "Rog", "Udyog", "Chanchal", "Labh", "Amrut", "Kaal", "Shubh"],
    night: ["Amrut", "Chanchal", "Rog", "Kaal", "Labh", "Udyog", "Shubh", "Amrut"]
  },
  Friday: {
    day: ["Chanchal", "Labh", "Amrut", "Kaal", "Shubh", "Rog", "Udyog", "Chanchal"],
    night: ["Rog", "Kaal", "Labh", "Udyog", "Shubh", "Amrut", "Chanchal", "Rog"]
  },
  Saturday: {
    day: ["Kaal", "Shubh", "Rog", "Udyog", "Chanchal", "Labh", "Amrut", "Kaal"],
    night: ["Labh", "Udyog", "Shubh", "Amrut", "Chanchal", "Rog", "Kaal", "Labh"]
  }
};

const defaultTimeSlotsDay = [
  "06:00 AM - 07:30 AM",
  "07:30 AM - 09:00 AM",
  "09:00 AM - 10:30 AM",
  "10:30 AM - 12:00 PM",
  "12:00 PM - 01:30 PM",
  "01:30 PM - 03:00 PM",
  "03:00 PM - 04:30 PM",
  "04:30 PM - 06:00 PM",
];

const defaultTimeSlotsNight = [
  "06:00 PM - 07:30 PM",
  "07:30 PM - 09:00 PM",
  "09:00 PM - 10:30 PM",
  "10:30 PM - 12:00 AM",
  "12:00 AM - 01:30 AM",
  "01:30 AM - 03:00 AM",
  "03:00 AM - 04:30 AM",
  "04:30 AM - 06:00 AM",
];

const getChoghadiyaType = (choghadiya: string) => {
  if (["Amrut", "Shubh", "Labh"].includes(choghadiya)) return "good";
  if (["Chanchal"].includes(choghadiya)) return "neutral";
  return "bad";
};

const ChoghadiyaCard = ({ dayOfWeek }: ChoghadiyaCardProps) => {
  const [activeSegment, setActiveSegment] = useState<"day" | "night">("day");

  // Fallback to Sunday if unexpected
  const dayData = choghadiyaData[dayOfWeek] || choghadiyaData["Sunday"];

  return (
    <div className="bg-card rounded-[2rem] border border-border p-6 shadow-card hover:shadow-elevated transition-shadow relative overflow-hidden">
      <div className="flex items-center justify-between mb-6">
         <h3 className="font-serif text-2xl font-bold flex items-center gap-2 text-foreground">
           Shiva Likhit Choghadiya
         </h3>
         
         <div className="flex bg-muted/50 p-1 rounded-xl">
           <button 
             onClick={() => setActiveSegment("day")}
             className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
               activeSegment === "day" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
             }`}
           >
             <Sunrise className="w-4 h-4" /> Day
           </button>
           <button 
             onClick={() => setActiveSegment("night")}
             className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
               activeSegment === "night" ? "bg-background text-indigo-500 shadow-sm" : "text-muted-foreground hover:text-foreground"
             }`}
           >
             <Sunset className="w-4 h-4" /> Night
           </button>
         </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {(activeSegment === "day" ? dayData.day : dayData.night).map((choghadiya, idx) => {
           const time = activeSegment === "day" ? defaultTimeSlotsDay[idx] : defaultTimeSlotsNight[idx];
           const type = getChoghadiyaType(choghadiya);
           
           let badgeColors = "";
           if (type === "good") badgeColors = "bg-sacred-green/10 border-sacred-green/20 text-sacred-green";
           else if (type === "neutral") badgeColors = "bg-gold/10 border-gold/20 text-gold";
           else badgeColors = "bg-destructive/10 border-destructive/20 text-destructive";

           return (
             <div key={idx} className={`p-3 rounded-xl border ${badgeColors} relative overflow-hidden`}>
                {type === "good" && <div className="absolute -right-2 -top-2 w-8 h-8 bg-sacred-green/10 rounded-full blur-md"></div>}
                
                <h4 className="font-bold text-lg mb-1">{choghadiya}</h4>
                <p className="text-xs opacity-80 font-medium">{time}</p>

                {type === "good" && <div className="mt-2 text-[10px] uppercase font-bold opacity-80">Auspicious</div>}
                {type === "neutral" && <div className="mt-2 text-[10px] uppercase font-bold opacity-80">Variable</div>}
                {type === "bad" && <div className="mt-2 text-[10px] uppercase font-bold opacity-80">Inauspicious</div>}
             </div>
           );
        })}
      </div>
    </div>
  );
};

export default ChoghadiyaCard;
