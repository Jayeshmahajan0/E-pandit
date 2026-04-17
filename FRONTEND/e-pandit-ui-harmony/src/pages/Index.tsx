import { motion } from "framer-motion";
import { ArrowRight, Star, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Layout from "@/components/layout/Layout";
import TrustBadges from "@/components/shared/TrustBadge";
import OrnamentDivider from "@/components/shared/OrnamentDivider";
import AnimatedCTAButton from "@/components/shared/AnimatedCTAButton";
import heroPriest from "@/assets/hero-priest.jpg";
import omOrnament from "@/assets/om-ornament.png";
import { mockPandits, poojaCategories } from "@/data/mockData";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.5, ease: "easeOut" as const },
  }),
};

const Index = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero">
        {/* Subtle floating ornament */}
        <motion.img
          src={omOrnament}
          alt=""
          className="absolute top-8 right-8 w-20 h-20 opacity-10 hidden md:block"
          animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="container py-12 md:py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Text */}
            <div className="order-2 lg:order-1">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-sm font-medium text-primary mb-3 tracking-wider uppercase"
              >
                Trusted by 50,000+ Families
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6"
              >
                {t('hero.title')} <br className="hidden lg:block"/>
                <span className="text-gradient-saffron">{t('hero.subtitle')}</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-base md:text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed"
              >
                {t('hero.description')}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <Link to="/priests">
                  <AnimatedCTAButton size="lg">
                    {t('hero.cta_book')} <ArrowRight className="w-5 h-5" />
                  </AnimatedCTAButton>
                </Link>
                <Link to="/panchang">
                  <AnimatedCTAButton variant="outline" size="lg">
                    {t('hero.cta_panchang')}
                  </AnimatedCTAButton>
                </Link>
              </motion.div>
            </div>

            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="order-1 lg:order-2 relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-elevated">
                <img
                  src={heroPriest}
                  alt="Pandit performing pooja ceremony"
                  className="w-full aspect-[4/5] md:aspect-[3/4] object-cover"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
              </div>

              {/* Floating stat card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.4 }}
                className="absolute -bottom-4 -left-4 md:bottom-6 md:-left-6 bg-card rounded-xl p-4 shadow-elevated"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5 text-primary fill-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">4.9 / 5</p>
                    <p className="text-xs text-muted-foreground">Average Rating</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="container py-12 md:py-16">
        <TrustBadges />
      </section>

      <OrnamentDivider />

      {/* How It Works */}
      <section className="container py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">
            How It Works
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Book your pooja in three simple steps
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {[
            { step: "1", title: "Choose Your Pooja", desc: "Select from 50+ rituals and ceremonies" },
            { step: "2", title: "Pick a Pandit", desc: "Browse verified priests with ratings & reviews" },
            { step: "3", title: "Confirm & Celebrate", desc: "Book a slot, get a pooja kit, and celebrate" },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="relative text-center p-6 md:p-8 bg-card rounded-xl shadow-card"
            >
              <div className="w-14 h-14 mx-auto bg-gradient-saffron rounded-full flex items-center justify-center mb-4 text-primary-foreground font-serif text-xl font-bold shadow-soft">
                {item.step}
              </div>
              <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <OrnamentDivider />

      {/* Popular Services */}
      <section className="container py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">
            Popular Ceremonies
          </h2>
          <p className="text-muted-foreground">Explore our most-booked rituals</p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-3">
          {poojaCategories.slice(1).map((cat, i) => (
            <motion.div
              key={cat}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.05 }}
              className="px-5 py-3 bg-card rounded-full shadow-card text-sm font-medium text-foreground cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
            >
              {cat}
            </motion.div>
          ))}
        </div>
      </section>

      <OrnamentDivider />

      {/* Featured Priests Preview */}
      <section className="container py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">
            Featured Pandits
          </h2>
          <p className="text-muted-foreground">Our top-rated, verified priests</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockPandits.map((priest, i) => (
            <motion.div
              key={priest.id}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              className="bg-card rounded-xl overflow-hidden shadow-card transition-shadow duration-300 hover:shadow-elevated"
            >
              <div className="relative">
                <img
                  src={priest.image}
                  alt={priest.name}
                  className="w-full aspect-square object-cover"
                />
                {priest.verified && (
                  <span className="absolute top-3 right-3 bg-sacred-green text-primary-foreground text-xs font-semibold px-2.5 py-1 rounded-full">
                    ✓ Verified
                  </span>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-serif text-lg font-semibold text-foreground mb-1">
                  {priest.name}
                </h3>
                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-4 h-4 text-primary fill-primary" />
                  <span className="text-sm font-medium text-foreground">
                    {priest.rating}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({priest.reviews} reviews)
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                  <MapPin className="w-3 h-3" />
                  {priest.location}
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {priest.specializations.slice(0, 2).map((s) => (
                    <span
                      key={s}
                      className="bg-secondary text-secondary-foreground text-xs px-2.5 py-1 rounded-full"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <Link to={`/priests/${priest.id}`}>
                  <AnimatedCTAButton variant="outline" size="sm" className="w-full">
                    View Profile
                  </AnimatedCTAButton>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link to="/priests">
            <AnimatedCTAButton>
              View All Pandits <ArrowRight className="w-4 h-4" />
            </AnimatedCTAButton>
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-maroon text-primary-foreground py-16 md:py-20">
        <div className="container text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif text-3xl md:text-4xl font-bold mb-4"
          >
            Ready to Begin Your Sacred Journey?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base opacity-90 max-w-md mx-auto mb-8"
          >
            Join thousands of families who trust E-Pandit for their spiritual needs.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link to="/priests">
              <AnimatedCTAButton size="lg" className="bg-primary-foreground text-accent hover:bg-primary-foreground/90">
                Get Started Now <ArrowRight className="w-5 h-5" />
              </AnimatedCTAButton>
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
