import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedCTAButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
}

const variants = {
  primary: "bg-gradient-saffron text-primary-foreground shadow-soft hover:shadow-glow",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  outline: "border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground",
};

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

const AnimatedCTAButton = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: AnimatedCTAButtonProps) => {
  return (
    <motion.button
      whileHover={props.disabled ? {} : { scale: 1.03 }}
      whileTap={props.disabled ? {} : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={`rounded-lg font-semibold transition-all duration-300 inline-flex items-center justify-center gap-2 ${variants[variant]} ${sizes[size]} ${props.disabled ? 'opacity-70 cursor-not-allowed' : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default AnimatedCTAButton;
