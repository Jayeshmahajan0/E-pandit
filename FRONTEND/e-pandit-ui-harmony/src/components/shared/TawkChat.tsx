import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

// Extend window to include Tawk_API (loaded via index.html script)
declare global {
  interface Window {
    Tawk_API?: {
      setAttributes: (attrs: Record<string, string>, cb?: (err: any) => void) => void;
      visitor: { name: string; email: string };
      onLoad: () => void;
      hideWidget: () => void;
      showWidget: () => void;
      logout: () => void;
    };
  }
}

const roleLabel: Record<string, string> = {
  user: "User",
  pandit: "Pandit",
  vendor: "Vendor",
  admin: "Admin",
};

const TawkChat = () => {
  const { user } = useAuth();

  useEffect(() => {
    const setTawkUser = () => {
      if (!window.Tawk_API?.setAttributes) return;

      if (user) {
        // Set visitor info so the Tawk.to agent dashboard shows the user's details
        window.Tawk_API.setAttributes(
          {
            name: user.full_name || "E-Pandit User",
            email: user.email || "",
            role: roleLabel[user.role] || "User",
            userId: user.id || "",
          },
          (err) => {
            if (err) console.warn("[Tawk] setAttributes error:", err);
          }
        );
      }
    };

    // Tawk may not be ready immediately — wait for onLoad
    if (window.Tawk_API) {
      const originalOnLoad = window.Tawk_API.onLoad;
      window.Tawk_API.onLoad = function () {
        if (originalOnLoad) originalOnLoad();
        setTawkUser();
      };
      // If already loaded, call immediately
      setTawkUser();
    } else {
      // Retry once after 3 seconds if Tawk hasn't loaded yet
      const timer = setTimeout(setTawkUser, 3000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  // This component renders nothing — it's purely a side-effect bridge
  return null;
};

export default TawkChat;
