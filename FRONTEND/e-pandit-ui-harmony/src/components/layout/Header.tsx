import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone, User, LogIn, Zap, LayoutDashboard } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import omOrnament from "@/assets/om-ornament.png";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, ShieldCheck } from "lucide-react";



const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const navLinks = user?.role === "admin" 
    ? [
        { label: "Admin Panel", path: "/admin/verification" },
        { label: "Home", path: "/" },
      ]
    : user?.role === "pandit" 
    ? [
        { label: "Home", path: "/" },
        { label: "My Bookings", path: "/pandit/dashboard" },
        { label: "Panchang", path: "/panchang" },
        { label: "My Profile", path: "/profile" },
      ]
    : [
        { label: "Home", path: "/" },
        { label: "Find Pandit", path: "/priests" },
        { label: "Pooja Kits", path: "/pooja-kits" },
        { label: "Panchang", path: "/panchang" },
        { label: "My Bookings", path: "/dashboard" },
      ];

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="container flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src={omOrnament} alt="E-Pandit" className="w-9 h-9 md:w-10 md:h-10" />
          <span className="font-serif text-xl md:text-2xl font-bold text-foreground">
            E-<span className="text-primary">Pandit</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium transition-colors duration-200 hover:text-primary ${
                location.pathname === link.path ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-2">
          <a
            href="tel:+911234567890"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors px-2"
          >
            <Phone className="w-4 h-4" />
          </a>

          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors px-2.5 py-2 rounded-lg ${
                  location.pathname.includes("/profile") || location.pathname.includes("/dashboard") ? "text-primary bg-secondary" : "text-muted-foreground hover:text-primary"
                }`}
              >
                <User className="w-4 h-4" />
                <span className="hidden lg:inline">{user?.full_name?.split(" ")[0]}</span>
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate("/signin");
                }}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors px-2.5 py-2 rounded-lg text-muted-foreground hover:text-destructive`}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/pandit/dashboard"
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors px-2.5 py-2 rounded-lg ${
                  location.pathname.startsWith("/pandit") ? "text-primary bg-secondary" : "text-muted-foreground hover:text-primary"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden lg:inline">Pandit</span>
              </Link>
              <Link
                to="/signin"
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors px-2.5 py-2 rounded-lg ${
                  location.pathname === "/signin" ? "text-primary bg-secondary" : "text-muted-foreground hover:text-primary"
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden lg:inline">Sign In</span>
              </Link>
            </>
          )}

          <Link
            to="/book"
            className="flex items-center gap-1.5 bg-gradient-saffron text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-bold shadow-soft hover:shadow-glow transition-all duration-300"
          >
            <Zap className="w-4 h-4" />
            Book Now
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden overflow-hidden border-b border-border bg-background"
          >
            <nav className="container py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                    location.pathname === link.path ? "bg-secondary text-primary" : "text-foreground hover:bg-secondary"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {isAuthenticated && user?.role !== "pandit" && user?.role !== "admin" && (
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 rounded-lg text-base font-medium transition-colors flex items-center gap-2 ${
                    location.pathname === "/profile" ? "bg-secondary text-primary" : "text-foreground hover:bg-secondary"
                  }`}
                >
                  <User className="w-4 h-4" />
                  My Profile
                </Link>
              )}

              <Link
                to="/signin"
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-3 rounded-lg text-base font-medium transition-colors flex items-center gap-2 ${
                  location.pathname === "/signin" ? "bg-secondary text-primary" : "text-foreground hover:bg-secondary"
                }`}
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Link>

              <Link
                to="/book"
                onClick={() => setMobileOpen(false)}
                className="mt-2 bg-gradient-saffron text-primary-foreground px-5 py-3 rounded-lg text-center font-bold shadow-soft flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Book a Pandit
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
