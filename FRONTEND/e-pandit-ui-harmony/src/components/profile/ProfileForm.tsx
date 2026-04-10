import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, X, User, Mail, Phone, CalendarDays, Users } from "lucide-react";

const profileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  initialData?: Partial<ProfileFormData>;
  onSave: (data: ProfileFormData) => void;
}

const ProfileForm = ({ initialData, onSave }: ProfileFormProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: initialData?.fullName || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      dateOfBirth: initialData?.dateOfBirth || "",
      gender: initialData?.gender || undefined,
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    onSave(data);
    setIsEditing(false);
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-card rounded-2xl p-5 md:p-7 shadow-card"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-serif text-lg md:text-xl font-semibold text-foreground">
              Personal Information
            </h2>
            <p className="text-xs text-muted-foreground">
              Manage your personal details
            </p>
          </div>
        </div>

        {!isEditing && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 text-sm font-semibold text-primary border-2 border-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-all duration-300"
          >
            Edit Profile
          </motion.button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              Full Name
            </label>
            <input
              {...register("fullName")}
              disabled={!isEditing}
              placeholder="Enter your full name"
              className={`w-full px-4 py-3 rounded-xl border text-sm transition-all duration-300 outline-none ${
                isEditing
                  ? "bg-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                  : "bg-muted border-transparent cursor-default"
              } ${errors.fullName ? "border-destructive focus:ring-destructive/20" : ""}`}
            />
            <AnimatePresence>
              {errors.fullName && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-destructive"
                >
                  {errors.fullName.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Mail className="w-3.5 h-3.5 text-muted-foreground" />
              Email Address
            </label>
            <input
              {...register("email")}
              type="email"
              disabled={!isEditing}
              placeholder="your@email.com"
              className={`w-full px-4 py-3 rounded-xl border text-sm transition-all duration-300 outline-none ${
                isEditing
                  ? "bg-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                  : "bg-muted border-transparent cursor-default"
              } ${errors.email ? "border-destructive focus:ring-destructive/20" : ""}`}
            />
            <AnimatePresence>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-destructive"
                >
                  {errors.email.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Phone className="w-3.5 h-3.5 text-muted-foreground" />
              Phone Number
            </label>
            <div className="relative">
              <span
                className={`absolute left-4 top-1/2 -translate-y-1/2 text-sm ${
                  isEditing ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                +91
              </span>
              <input
                {...register("phone")}
                disabled={!isEditing}
                placeholder="9876543210"
                maxLength={10}
                className={`w-full pl-12 pr-4 py-3 rounded-xl border text-sm transition-all duration-300 outline-none ${
                  isEditing
                    ? "bg-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                    : "bg-muted border-transparent cursor-default"
                } ${errors.phone ? "border-destructive focus:ring-destructive/20" : ""}`}
              />
            </div>
            <AnimatePresence>
              {errors.phone && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-destructive"
                >
                  {errors.phone.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Date of Birth */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
              Date of Birth
            </label>
            <input
              {...register("dateOfBirth")}
              type="date"
              disabled={!isEditing}
              className={`w-full px-4 py-3 rounded-xl border text-sm transition-all duration-300 outline-none ${
                isEditing
                  ? "bg-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                  : "bg-muted border-transparent cursor-default"
              }`}
            />
          </div>

          {/* Gender */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Users className="w-3.5 h-3.5 text-muted-foreground" />
              Gender
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "other", label: "Other" },
                { value: "prefer_not_to_say", label: "Prefer not to say" },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm cursor-pointer transition-all duration-300 ${
                    !isEditing ? "opacity-70 cursor-default" : "hover:border-primary"
                  }`}
                >
                  <input
                    {...register("gender")}
                    type="radio"
                    value={option.value}
                    disabled={!isEditing}
                    className="sr-only peer"
                  />
                  <div className="w-4 h-4 rounded-full border-2 border-border peer-checked:border-primary peer-checked:bg-primary flex items-center justify-center transition-all">
                    <div className="w-1.5 h-1.5 rounded-full bg-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-foreground">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex flex-col sm:flex-row gap-3 mt-6 pt-5 border-t border-border"
            >
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={!isDirty}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-saffron text-primary-foreground rounded-xl font-semibold text-sm shadow-soft hover:shadow-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCancel}
                className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-border text-foreground rounded-xl font-semibold text-sm hover:bg-muted transition-all duration-300"
              >
                <X className="w-4 h-4" />
                Cancel
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  );
};

export default ProfileForm;
