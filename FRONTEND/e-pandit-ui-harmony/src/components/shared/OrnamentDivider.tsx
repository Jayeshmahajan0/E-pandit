import omOrnament from "@/assets/om-ornament.png";

interface OrnamentDividerProps {
  className?: string;
}

const OrnamentDivider = ({ className = "" }: OrnamentDividerProps) => {
  return (
    <div className={`ornament-divider ${className}`}>
      <img src={omOrnament} alt="" className="w-8 h-8 opacity-40" />
    </div>
  );
};

export default OrnamentDivider;
