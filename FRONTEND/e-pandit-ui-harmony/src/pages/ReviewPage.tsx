import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import { mockBookings } from "@/data/mockData";

const ReviewPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const booking = mockBookings.find((b) => b.id === bookingId);

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success("Thank you for your review!  ");
    }, 1500);
  };

  if (!booking) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <p className="text-xl text-muted-foreground">Booking not found</p>
        </div>
      </Layout>
    );
  }

  if (submitted) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card rounded-2xl p-8 md:p-12 shadow-elevated text-center max-w-md"
          >
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5 }}
              className="text-6xl block mb-4"
            >

            </motion.span>
            <h2 className="font-serif text-2xl font-bold text-foreground mb-2">Thank You!</h2>
            <p className="text-muted-foreground mb-6">
              Your {rating}-star review for {booking.panditName} has been submitted.
            </p>
            <div className="flex gap-1 justify-center mb-6">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-8 h-8 ${s <= rating ? "text-primary fill-primary" : "text-muted"}`}
                />
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/dashboard")}
                className="flex-1 py-3 border border-border text-foreground rounded-xl font-medium text-sm hover:bg-secondary transition-colors"
              >
                My Bookings
              </button>
              <button
                onClick={() => navigate("/book")}
                className="flex-1 py-3 bg-gradient-saffron text-primary-foreground rounded-xl font-bold text-sm shadow-soft"
              >
                Book Again
              </button>
            </div>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-hero">
        <div className="container py-6 md:py-10 max-w-lg mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <span className="text-4xl mb-3 block">⭐</span>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-1">
              Rate Your Experience
            </h1>
            <p className="text-sm text-muted-foreground">How was your {booking.poojaType}?</p>
          </motion.div>

          {/* Pandit info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl p-5 shadow-card text-center mb-5"
          >
            <img
              src={booking.panditImage}
              alt={booking.panditName}
              className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-3 border-primary/20"
            />
            <h3 className="font-serif font-bold text-foreground text-lg mb-1">{booking.panditName}</h3>
            <p className="text-sm text-muted-foreground">{booking.poojaType}</p>
          </motion.div>

          {/* Star rating */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl p-5 shadow-card text-center mb-5"
          >
            <p className="text-sm font-medium text-foreground mb-4">Tap to rate</p>
            <div className="flex justify-center gap-2 mb-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <motion.button
                  key={s}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onMouseEnter={() => setHoveredRating(s)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(s)}
                >
                  <Star
                    className={`w-10 h-10 transition-colors ${s <= (hoveredRating || rating)
                        ? "text-primary fill-primary"
                        : "text-muted-foreground/30"
                      }`}
                  />
                </motion.button>
              ))}
            </div>
            <motion.p
              key={rating}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-primary font-medium"
            >
              {rating === 0 ? "" : rating === 5 ? "Excellent!  " : rating === 4 ? "Great!" : rating === 3 ? "Good" : rating === 2 ? "Fair" : "Poor"}
            </motion.p>
          </motion.div>

          {/* Comment */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-2xl p-5 shadow-card mb-5"
          >
            <label className="text-sm font-medium text-foreground block mb-2">
              Share your experience (optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was the pooja? Was the pandit punctual? Any feedback..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary resize-none"
            />
          </motion.div>

          {/* Submit */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 bg-gradient-saffron text-primary-foreground rounded-xl font-bold text-base shadow-soft hover:shadow-glow transition-all disabled:opacity-60"
          >
            {loading ? "Submitting..." : "Submit Review  "}
          </motion.button>

          <button
            onClick={() => navigate("/dashboard")}
            className="w-full py-3 text-muted-foreground text-sm mt-3 hover:text-foreground transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default ReviewPage;
