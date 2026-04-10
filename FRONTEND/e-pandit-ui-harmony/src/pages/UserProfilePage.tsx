import { useState } from "react";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileStats from "@/components/profile/ProfileStats";
import ProfileForm from "@/components/profile/ProfileForm";
import LocationSelector from "@/components/profile/LocationSelector";
import PreferencesSection from "@/components/profile/PreferencesSection";
import OrnamentDivider from "@/components/shared/OrnamentDivider";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import api from "@/lib/api";
import OnlineToggle from "@/components/pandit/OnlineToggle";

const UserProfilePage = () => {
  const { user, token, updateUser } = useAuth();
  const [profileData, setProfileData] = useState<{
    fullName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    gender: "male" | "female" | "other" | "prefer_not_to_say";
  }>({
    fullName: user?.full_name || (user as any)?.fullName || "Guest User",
    email: user?.email || "guest@epandit.com",
    phone: (user as any)?.phone || "",
    dateOfBirth: "1995-06-15",
    gender: "male",
  });

  const [isOnline, setIsOnline] = useState(user?.is_online || false);

  const handleToggleOnline = async (online: boolean) => {
    try {
      await api.put(`/users/toggle-online/${user?.id || ''}`, { isOnline: online });
      setIsOnline(online);
      toast.success(online ? "You're now online! 🟢" : "You're offline 🔴");
    } catch {
      toast.error("Failed to change status.");
    }
  };

  const [locationData, setLocationData] = useState({
    locationEnabled: true,
    state: "Maharashtra",
    district: "Pune",
    pinCode: "411001",
  });

  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingPoojas: 0,
    reviewsGiven: 0, // Mocked for now (no reviews endpoint written)
    memberSinceMonths: 1, // Mocked to 1 month since fresh account
  });

  useEffect(() => {
    if (!user?.id) return;
    const fetchStats = async () => {
      try {
        const { data } = await api.get(`/bookings/user/${user.id}`);
        const bookings = data.data || [];
        setStats({
          totalBookings: bookings.length,
          upcomingPoojas: bookings.filter((b: any) => ["requested", "accepted", "arriving", "in_progress"].includes(b.status)).length,
          reviewsGiven: 0,
          memberSinceMonths: 1
        });
      } catch (error) {
        console.error("Failed to fetch user stats");
      }
    };
    fetchStats();
  }, [user?.id]);

  const locationString = locationData.district && locationData.state
    ? `${locationData.district}, ${locationData.state}`
    : "";

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-hero">
        <div className="container py-6 md:py-10 space-y-5 md:space-y-6">
          {/* Profile Header */}
          <ProfileHeader
            name={profileData.fullName}
            email={profileData.email}
            location={locationString}
            joinedDate="Jan 2025"
            isVerified={true}
            avatarUrl={user?.avatar_url || (user as any)?.avatarUrl || ""}
            onEditAvatar={async () => {
              const url = window.prompt("Enter the URL of your profile image:\n(For example: https://images.unsplash.com/...)");
              if (!url) return;
              
              try {
                if (user?.id) {
                  await api.put(`/users/profile/${user.id}`, { avatar_url: url });
                }
                updateUser({ avatar_url: url } as any);
                toast.success("Profile image updated! 🎉");
              } catch (e) {
                toast.error("Failed to update profile image");
              }
            }}
          />

          {/* Stats */}
          <ProfileStats
            totalBookings={stats.totalBookings}
            upcomingPoojas={stats.upcomingPoojas}
            reviewsGiven={stats.reviewsGiven}
            memberSinceMonths={stats.memberSinceMonths}
          />

          <OrnamentDivider />

          {/* Personal Info Form (Available to Both Roles) */}
          <ProfileForm
            initialData={profileData}
            onSave={async (data) => {
              try {
                if (user?.id) {
                  await api.put(`/users/profile/${user.id}`, {
                    full_name: data.fullName,
                    phone: data.phone
                  });
                }

                updateUser({
                  full_name: data.fullName,
                  email: data.email,
                });

                setProfileData({
                  ...profileData,
                  fullName: data.fullName,
                  phone: data.phone,
                });
                toast.success("Profile updated successfully!");
              } catch (e) {
                toast.error("Failed to update profile");
              }
            }}
          />

          {user?.role === "pandit" && (
            <>
              <OrnamentDivider />

              <div className="mb-6">
                <OnlineToggle isOnline={isOnline} onToggle={handleToggleOnline} />
              </div>

              {/* Location */}
              <LocationSelector
                initialData={locationData}
                onSave={(data) => {
                  setLocationData(data);
                  toast.success(
                    data.locationEnabled
                      ? `Location set to ${data.district}, ${data.state} 📍`
                      : "Location services disabled"
                  );
                }}
              />

              <OrnamentDivider />

              {/* Preferences */}
              <PreferencesSection
                initialData={{
                  preferredPoojas: ["Satyanarayan Katha", "Ganesh Puja"],
                  languages: ["Hindi", "Marathi", "Sanskrit"],
                  notifications: {
                    bookingUpdates: true,
                    promotions: false,
                    reminders: true,
                  },
                }}
                onSave={(data) => {
                  console.log("Preferences saved:", data);
                  toast.success("Preferences saved! 🎉");
                }}
              />
            </>
          )}

          {/* Bottom spacer */}
          <div className="h-4" />
        </div>
      </div>
    </Layout>
  );
};

export default UserProfilePage;
