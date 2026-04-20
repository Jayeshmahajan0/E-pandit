import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Mail, Lock, Phone, Eye, EyeOff, ArrowRight, Check, AlertCircle } from "lucide-react";
import omOrnament from "@/assets/om-ornament.png";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { indianStates } from "@/data/locationData";

const signUpSchema = z
  .object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    phone: z
      .string()
      .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string(),
    role: z.enum(["user", "vendor"]).default("user"),
    state: z.string().optional(),
    district: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => {
    if (data.role === "vendor") {
      return !!data.state && !!data.district;
    }
    return true;
  }, {
    message: "Location is required for vendors",
    path: ["district"],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

const passwordRules = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One number", test: (p: string) => /[0-9]/.test(p) },
];

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<{ message: string; field?: string } | null>(null);
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      role: "user"
    }
  });

  const watchPassword = watch("password", "");
  const selectedRole = watch("role");
  const selectedState = watch("state");
  
  const currentStateData = indianStates.find((s) => s.name === selectedState);
  const districts = currentStateData?.districts.map((d) => d.name) || [];

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    setServerError(null);
    try {
      const response = await api.post("/users/register", {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: data.role,
        state: data.state,
        district: data.district
      });

      const { user, token } = response.data.data;
      login({
        id: user.id,
        role: user.role || "user",
        full_name: user.fullName || user.full_name,
        email: user.email
      }, token);

      toast.success("Account created! Welcome to E-Pandit 🎉");

      setTimeout(() => {
        if (data.role === "vendor") {
          window.location.href = "/vendor/dashboard";
        } else {
          window.location.href = "/dashboard";
        }
      }, 500);

    } catch (error: any) {
      const msg = error.response?.data?.message || error.response?.data?.error || "Registration failed. Please try again.";
      const field = error.response?.data?.field;
      setServerError({ message: msg, field });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4 py-8">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute -top-20 -left-20 w-64 h-64 opacity-[0.03]"
        >
          <svg viewBox="0 0 200 200" fill="currentColor" className="text-saffron">
            <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="100" cy="100" r="70" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="100" cy="100" r="50" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="100" cy="100" r="30" fill="none" stroke="currentColor" strokeWidth="1" />
          </svg>
        </motion.div>
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-20 -right-20 w-72 h-72 opacity-[0.03]"
        >
          <svg viewBox="0 0 200 200" fill="currentColor" className="text-maroon">
            <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="1" />
          </svg>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative"
      >
        {/* Card */}
        <div className="bg-card/80 backdrop-blur-xl rounded-3xl p-7 md:p-9 shadow-elevated border border-border/50">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="flex flex-col items-center mb-7"
          >
            <Link to="/" className="flex items-center gap-2 mb-3">
              <img src={omOrnament} alt="E-Pandit" className="w-12 h-12" />
            </Link>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
              Create Account
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Join E-<span className="text-primary">Pandit</span> — your spiritual companion
            </p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
            {/* Role Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex bg-muted rounded-xl p-1 mb-4"
            >
              <button
                type="button"
                onClick={() => setValue("role", "user")}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${selectedRole === "user" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                User
              </button>
              <button
                type="button"
                onClick={() => setValue("role", "vendor")}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${selectedRole === "vendor" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Samagri Vendor
              </button>
            </motion.div>

            {/* Full Name */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="space-y-1.5"
            >
              <label className="text-sm font-medium text-foreground">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  {...register("fullName")}
                  placeholder="Enter your full name"
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-background text-sm outline-none transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary ${errors.fullName ? "border-destructive" : "border-border"
                    }`}
                />
              </div>
              {errors.fullName && (
                <p className="text-xs text-destructive">
                  {errors.fullName.message}
                </p>
              )}
            </motion.div>

            {/* Email */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-1.5"
            >
              <label className="text-sm font-medium text-foreground">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  {...register("email")}
                  type="email"
                  placeholder="your@email.com"
                  onChange={() => serverError?.field === "email" && setServerError(null)}
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-background text-sm outline-none transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                    errors.email || serverError?.field === "email" ? "border-destructive" : "border-border"
                  }`}
                />
              </div>
              {(errors.email || serverError?.field === "email") && (
                <p className="text-xs text-destructive">{errors.email?.message || serverError?.message}</p>
              )}
            </motion.div>

            {/* Phone */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
              className="space-y-1.5"
            >
              <label className="text-sm font-medium text-foreground">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <span className="absolute left-11 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  +91
                </span>
                <input
                  {...register("phone")}
                  placeholder="000000000"
                  maxLength={10}
                  onChange={() => serverError?.field === "phone" && setServerError(null)}
                  className={`w-full pl-[4.5rem] pr-4 py-3 rounded-xl border bg-background text-sm outline-none transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                    errors.phone || serverError?.field === "phone" ? "border-destructive" : "border-border"
                  }`}
                />
              </div>
              {(errors.phone || serverError?.field === "phone") && (
                <p className="text-xs text-destructive">{errors.phone?.message || serverError?.message}</p>
              )}
            </motion.div>

            {/* Location (Only for Vendors) */}
            {selectedRole === "vendor" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="grid grid-cols-2 gap-3"
              >
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">State</label>
                  <select
                    {...register("state")}
                    onChange={(e) => {
                      setValue("state", e.target.value);
                      setValue("district", "");
                    }}
                    className={`w-full px-3 py-3 rounded-xl border bg-background text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20 ${errors.state ? "border-destructive" : "border-border"}`}
                  >
                    <option value="">Select State</option>
                    {indianStates.map((s) => (
                      <option key={s.name} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">District</label>
                  <select
                    {...register("district")}
                    className={`w-full px-3 py-3 rounded-xl border bg-background text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20 ${errors.district ? "border-destructive" : "border-border"}`}
                  >
                    <option value="">Select District</option>
                    {districts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                {(errors.state || errors.district) && (
                  <p className="text-xs text-destructive col-span-2">
                    {errors.district?.message || "Location is required"}
                  </p>
                )}
              </motion.div>
            )}

            {/* Password */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-1.5"
            >
              <label className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  className={`w-full pl-11 pr-12 py-3 rounded-xl border bg-background text-sm outline-none transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary ${errors.password ? "border-destructive" : "border-border"
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Password strength indicators */}
              {watchPassword && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-1 pt-1"
                >
                  {passwordRules.map((rule) => {
                    const passed = rule.test(watchPassword);
                    return (
                      <div
                        key={rule.label}
                        className={`flex items-center gap-1.5 text-xs transition-colors ${passed ? "text-sacred-green" : "text-muted-foreground"
                          }`}
                      >
                        <Check
                          className={`w-3 h-3 ${passed ? "opacity-100" : "opacity-30"}`}
                        />
                        {rule.label}
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </motion.div>

            {/* Confirm Password */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
              className="space-y-1.5"
            >
              <label className="text-sm font-medium text-foreground">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  {...register("confirmPassword")}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  className={`w-full pl-11 pr-12 py-3 rounded-xl border bg-background text-sm outline-none transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary ${errors.confirmPassword
                    ? "border-destructive"
                    : "border-border"
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </motion.div>

            {/* Server Error Banner (general errors) */}
            <AnimatePresence>
              {serverError && !serverError.field && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-start gap-3 p-3.5 bg-destructive/10 border border-destructive/30 rounded-xl text-sm text-destructive"
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>{serverError.message}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-saffron text-primary-foreground rounded-xl font-semibold text-sm shadow-soft hover:shadow-glow transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 mt-5"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <>
                  Create Account <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Google Sign Up */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3.5 border-2 border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-all duration-300 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </motion.button>

          {/* Sign in link */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center text-sm text-muted-foreground mt-5"
          >
            Already have an account?{" "}
            <Link
              to="/signin"
              className="text-primary font-semibold hover:underline"
            >
              Sign In
            </Link>
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-sm text-foreground mt-2"
          >
            Are you a Pandit?{" "}
            <Link
              to="/pandit/register"
              className="text-saffron font-semibold hover:underline"
            >
              Register here
            </Link>
          </motion.p>
        </div>

        {/* Bottom ornament */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-center text-xs text-muted-foreground mt-6"
        >
          By creating an account, you agree to our Terms & Privacy Policy
        </motion.p>
      </motion.div>
    </div>
  );
};

export default SignUpPage;
