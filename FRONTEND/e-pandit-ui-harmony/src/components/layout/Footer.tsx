import { Link } from "react-router-dom";
import omOrnament from "@/assets/om-ornament.png";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src={omOrnament} alt="" className="w-8 h-8" />
              <span className="font-serif text-xl font-bold text-foreground">
                E-<span className="text-primary">Pandit</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Connecting devotees with verified, experienced pandits for all
              spiritual ceremonies and rituals.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-base font-semibold text-foreground mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {["Find a Pandit", "Pooja Kits", "How It Works", "About Us"].map((item) => (
                <li key={item}>
                  <Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-serif text-base font-semibold text-foreground mb-4">
              Popular Services
            </h4>
            <ul className="space-y-2.5">
              {["Satyanarayan Katha", "Griha Pravesh", "Vivah", "Mundan Ceremony"].map((item) => (
                <li key={item}>
                  <Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-base font-semibold text-foreground mb-4">
              Contact
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>📞 +91 12345 67890</li>
              <li>✉️ support@epandit.in</li>
              <li>🕐 Mon–Sun, 6 AM – 10 PM</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © 2026 E-Pandit. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link to="#" className="hover:text-primary transition-colors">Privacy</Link>
            <Link to="#" className="hover:text-primary transition-colors">Terms</Link>
            <Link to="#" className="hover:text-primary transition-colors">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
