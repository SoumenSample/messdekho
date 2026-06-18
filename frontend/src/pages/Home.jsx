import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ConnectingCities } from "@/components/ConnectingCities";
import { ExpertHelpWidget } from "@/components/ExpertHelpWidget";
import { PGCard } from "@/components/PGCard";
import { SearchBar } from "@/components/search/SearchBar";
import { pgService } from "@/services/pgService";
import { getPGImageUrl, getPGImages } from "@/utils/pgImage";
import { SEED_PGS } from "@/data/mockData";
import promoBanner from "../assets/promo-banner.png";
import PopularStaysCarousel from "@/components/PopularStaysCarousel";
import CityExploreCarousel from "@/components/CityExploreCarousel";
import { ArrowRight, Building2, ChevronLeft, ChevronRight, Clock, IndianRupee, Landmark, MapPin, Mountain, ShieldCheck, Soup, Sparkles, Star, Users, Users2, Waves } from "lucide-react";

const HERO_IMG = "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&dpr=2&w=3200&q=95";
const STUDENTS_IMG = "https://images.pexels.com/photos/6684600/pexels-photo-6684600.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";
const FOOD_IMG = "https://images.pexels.com/photos/5775684/pexels-photo-5775684.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";

const POPULAR_CITY_CARDS = [
  {
    label: "Mumbai",
    query: "Mumbai",
    countKeys: ["Mumbai"],
    image:
      "https://upload.wikimedia.org/wikipedia/commons/1/10/Gateway_of_India_%28Mumbai%29_03.jpg",
    icon: Landmark,
    accent: "#8b5cf6",
    badgeTint: "text-violet-600",
    badgeBg: "bg-violet-50",
  },
  {
    label: "Pune",
    query: "Pune",
    countKeys: ["Pune"],
    image: "https://upload.wikimedia.org/wikipedia/commons/9/9f/Pune_skyline.jpg",
    icon: Building2,
    accent: "#22c55e",
    badgeTint: "text-emerald-600",
    badgeBg: "bg-emerald-50",
  },
  {
    label: "Delhi",
    query: "Delhi",
    countKeys: ["Delhi"],
    image:
      "https://upload.wikimedia.org/wikipedia/commons/4/4f/India_Gate_in_New_Delhi_03-2016.jpg",
    icon: Landmark,
    accent: "#f97316",
    badgeTint: "text-orange-500",
    badgeBg: "bg-orange-50",
  },
  {
    label: "Chennai",
    query: "Chennai",
    countKeys: ["Chennai"],
    image:
      "https://upload.wikimedia.org/wikipedia/commons/6/69/Marina_Beach_Chennai_%28cropped%29.jpg",
    icon: Waves,
    accent: "#3b82f6",
    badgeTint: "text-blue-500",
    badgeBg: "bg-blue-50",
  },
  {
    label: "Hyderabad",
    query: "Hyderabad",
    countKeys: ["Hyderabad"],
    image: "https://upload.wikimedia.org/wikipedia/commons/8/8d/Charminar%2C_Hyderabad.jpg",
    icon: Landmark,
    accent: "#fb7185",
    badgeTint: "text-rose-500",
    badgeBg: "bg-rose-50",
  },
  {
    label: "Kolkata",
    query: "Kolkata",
    countKeys: ["Kolkata"],
    image:
      "https://upload.wikimedia.org/wikipedia/commons/8/8c/Victoria_Memorial%2C_Kolkata%2C_2022.jpg",
    icon: Mountain,
    accent: "#14b8a6",
    badgeTint: "text-cyan-600",
    badgeBg: "bg-cyan-50",
  },
  {
    label: "Bangalore",
    query: "Bengaluru",
    countKeys: ["Bengaluru", "Bangalore"],
    image:
      "https://upload.wikimedia.org/wikipedia/commons/6/60/Vidhana_Soudha%2C_Bengaluru.jpg",
    icon: Building2,
    accent: "#ec4899",
    badgeTint: "text-pink-500",
    badgeBg: "bg-pink-50",
  },
];

const getCityCount = (safePGs, countKeys) => {
  return safePGs.filter((pg) => countKeys.includes(pg.city)).length;
};

// Compact feature cards for the Why Choose section
const FEATURES = [
  { title: 'Verified Owners', desc: 'Every owner is KYC-verified; we run background checks on premises safety.', icon: ShieldCheck, accent: 'emerald' },
  { title: 'Mess Certified', desc: 'Weekly audits ensure quality meals and hygienic standards.', icon: Soup, accent: 'orange' },
  { title: 'Real Reviews', desc: "Only residents who've stayed 30+ days can leave verified reviews.", icon: Star, accent: 'blue' },
  { title: 'Fair Pricing', desc: 'No hidden fees. No brokerage. Lock rent for up to 12 months.', icon: IndianRupee, accent: 'pink' },
  { title: '24/7 Support', desc: 'Round-the-clock customer support for all your queries and concerns.', icon: Clock, accent: 'purple' },
  { title: 'Community', desc: '40k+ happy residents and growing community of hostel dwellers.', icon: Users2, accent: 'yellow' },
];

const FEATURED_STAY_LIMIT = 8;

const normalizeStay = (pg) => {
  const id = pg?._id || pg?.id || pg?.slug || `${pg?.title || 'pg'}-${pg?.city || 'india'}`;
  const facilities = Array.isArray(pg?.facilities) ? pg.facilities : [];
  const rating = typeof pg?.rating === "number" ? pg.rating : Number(pg?.rating || 0);

  return {
    ...pg,
    _id: id,
    id,
    title: pg?.title || "Premium Stay",
    city: pg?.city || "India",
    location: pg?.location || pg?.address || "Verified location",
    images: getPGImages(pg, STUDENTS_IMG),
    facilities,
    rating,
    price: Number(pg?.price || 0),
    verified: true,
  };
};

const getLiveStayFeed = (items) => {
  const premiumSorted = [...items]
    .filter((pg) => pg.isApproved !== false && pg.isActive !== false)
    .sort((a, b) => {
      const aFeatured = a.featured ? 1 : 0;
      const bFeatured = b.featured ? 1 : 0;
      if (bFeatured !== aFeatured) return bFeatured - aFeatured;
      if (b.rating !== a.rating) return b.rating - a.rating;
      if (b.bookingsCount !== a.bookingsCount) return b.bookingsCount - a.bookingsCount;
      return b.createdAt - a.createdAt;
    });

  const buckets = new Map();
  premiumSorted.forEach((pg) => {
    if (!buckets.has(pg.city)) buckets.set(pg.city, []);
    buckets.get(pg.city).push(pg);
  });

  const cityOrder = Array.from(buckets.keys());
  const mixedFeed = [];

  while (mixedFeed.length < FEATURED_STAY_LIMIT) {
    let added = false;
    for (const city of cityOrder) {
      const bucket = buckets.get(city);
      if (bucket?.length) {
        mixedFeed.push(bucket.shift());
        added = true;
        if (mixedFeed.length === FEATURED_STAY_LIMIT) break;
      }
    }
    if (!added) break;
  }

  return mixedFeed;
};

const getDemoStayFeed = () => {
  return SEED_PGS.filter((pg) => pg.status === "approved")
    .map((pg) => normalizeStay({ ...pg, isApproved: true, isActive: true }))
    .sort((a, b) => {
      const aFeatured = a.featured ? 1 : 0;
      const bFeatured = b.featured ? 1 : 0;
      if (bFeatured !== aFeatured) return bFeatured - aFeatured;
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.createdAt - a.createdAt;
    })
    .slice(0, FEATURED_STAY_LIMIT);
};

function FeaturedStayCard({ pg, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.04 }}
      className="group h-full min-w-[82vw] sm:min-w-0"
    >
      <PGCard pg={pg} index={index} />
    </motion.div>
  );
}

// City Carousel Component


export default function Home() {
  const nav = useNavigate();
  const [pgs, setPGs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPGs = async () => {
      try {
        const res = await pgService.getAllPGs({ limit: 50, sort: "-rating,-bookingsCount,-createdAt" });
        const fetchedPGs = res?.data?.data?.pgs || res?.data?.pgs || [];
        setPGs(fetchedPGs);
      } catch (err) {
        console.error("Failed to fetch PGs:", err);
        setPGs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPGs();
  }, []);

  const safePGs = Array.isArray(pgs) ? pgs : [];
  const featuredPGs = useMemo(() => {
    const normalized = safePGs.map(normalizeStay);
    const liveFeed = getLiveStayFeed(normalized);
    return liveFeed.length > 0 ? liveFeed : getDemoStayFeed();
  }, [safePGs]);

  return (
    <div className="min-h-screen bg-[#F3F7F4]">
      <Navbar />

      {/* Hero - Premium Cinematic Section */}
      <section
        className="relative h-[92vh] min-h-[700px] w-full overflow-x-hidden overflow-y-visible"
        data-testid="home-hero"
        style={{
          backgroundImage: `url('${HERO_IMG}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Content - Left Aligned */}
        <div className="relative mx-auto flex h-full w-full max-w-7xl flex-col justify-center px-6 sm:px-10 lg:px-8">
          <div className="max-w-[620px] pt-8 lg:pt-10">
            {/* Premium Glassmorphism Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white/90 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_8px_24px_rgba(1,18,21,0.34)] backdrop-blur-xl"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>12,400+ VERIFIED STAYS ACROSS INDIA</span>
            </motion.div>

            {/* Main Heading - Bold, Premium, Reference Style */}
            <motion.h1
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              className="mb-6 font-heading text-4xl font-black leading-[1.06] tracking-[-0.02em] text-white sm:text-5xl lg:text-[64px]"
              data-testid="home-hero-title"
            >
              Find a PG that actually feels like{' '}
              <span className="bg-gradient-to-r from-amber-200 via-orange-400 to-yellow-300 bg-clip-text text-transparent [text-shadow:0_0_18px_rgba(251,146,60,0.22)]">
                home.
              </span>
            </motion.h1>

            {/* Subheading - Elegant, Readable */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.2, ease: "easeOut" }}
              className="mb-10 max-w-[560px] text-base font-medium leading-[1.7] sm:text-lg"
              style={{
                color: "rgba(255,255,255,0.92)",
                textShadow: "0 2px 12px rgba(0,0,0,0.35)",
              }}
            >
              Hand-vetted PGs, hostels & mess services — transparent pricing, real resident reviews, and home-cooked meals.
            </motion.p>

            {/* Search Bar - Glassmorphic Premium Design */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.3, ease: "easeOut" }}
              className="max-w-[940px]"
            >
              <SearchBar />
            </motion.div>
          </div>
        </div>

      </section>

      <motion.section
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative mx-auto max-w-7xl w-full px-3 sm:px-4 lg:px-6 pt-4 mb-6"
      >
        <div className="w-full rounded-[20px] overflow-hidden shadow-[0_20px_50px_rgba(2,6,23,0.12)] bg-[#F3F7F4]">
          <div className="relative w-full aspect-[16/6] overflow-hidden sm:aspect-[16/5] lg:aspect-[16/4.4]">
            <img
              src={promoBanner}
              alt="MessDekho promotional banner"
              className="h-full w-full object-contain object-center"
              loading="lazy"
            />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/6 via-transparent to-transparent" />
          </div>
        </div>
      </motion.section>

      {/* Featured */}
      <section className="relative mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20 border-t border-emerald-100/50">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between"
        >
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">Featured this week</div>
            <h2 className="mt-3 font-heading text-3xl font-bold text-gray-900 lg:text-4xl" data-testid="featured-title">
              Popular stays right now
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
              Handpicked verified stays across India&apos;s top cities
            </p>
          </div>
          <button
            onClick={() => nav("/stays")}
            className="hidden items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:text-emerald-900 md:flex"
            data-testid="view-all-btn"
          >
            View all <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>

        <div className="mt-8">
          {loading ? (
            <div className="grid gap-5 overflow-x-auto pb-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="min-w-[82vw] animate-pulse overflow-hidden rounded-[28px] border border-slate-200/80 bg-white sm:min-w-0"
                >
                  <div className="aspect-[4/3] bg-slate-200" />
                  <div className="space-y-3 p-5">
                    <div className="h-5 w-2/3 rounded bg-slate-200" />
                    <div className="h-4 w-1/2 rounded bg-slate-200" />
                    <div className="h-9 w-full rounded-full bg-slate-200" />
                    <div className="h-10 w-full rounded-2xl bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex gap-5 overflow-x-auto pb-3 snap-x snap-mandatory sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:overflow-visible">
              {featuredPGs.map((pg, index) => (
                <FeaturedStayCard key={pg._id} pg={pg} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>


      <section className="relative mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-10 border-t border-emerald-100/50">
        <CityExploreCarousel />
      </section>

      <section className="relative mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-20 border-t border-emerald-100/50">
        <ConnectingCities />
      </section>

      {/* Why Mess Dekho - Compact Features */}
      <section className="relative mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
        <div className="absolute -left-20 -top-6 h-48 w-48 rounded-full bg-emerald-100/30 blur-3xl pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="font-heading text-4xl font-extrabold text-slate-900">
            Why Choose <span className="text-emerald-700">Mess Dekho</span>?
          </h2>
          <p className="mt-3 mx-auto max-w-2xl text-sm text-slate-500">
            We are committed to delivering exceptional quality and service to every student.
          </p>
          <div className="mt-4 mx-auto h-1 w-12 rounded-full bg-emerald-500" />
        </motion.div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, idx) => {
            const Icon = f.icon;
            const accentMap = {
              emerald: 'bg-emerald-50 text-emerald-600',
              orange: 'bg-orange-50 text-orange-600',
              blue: 'bg-blue-50 text-blue-600',
              pink: 'bg-pink-50 text-pink-600',
              purple: 'bg-violet-50 text-violet-600',
              yellow: 'bg-amber-50 text-amber-600',
            };
            const accent = accentMap[f.accent] || 'bg-slate-50 text-slate-700';

            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.28 }}
                className="flex items-center justify-between gap-3 rounded-lg bg-white border border-slate-100/60 shadow-sm px-4 py-2 transition-transform duration-200"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex-none h-10 w-10 rounded-md ${accent} flex items-center justify-center shadow-sm`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">{f.title}</div>
                    <div
                      className="text-[13px] text-slate-500 leading-5"
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        wordBreak: 'break-word',
                      }}
                    >
                      {f.desc}
                    </div>
                  </div>
                </div>

                <button aria-hidden className="flex-none ml-2 rounded-full p-1 text-slate-400 hover:text-emerald-600">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </div>
      </section>

      <Footer />
      <ExpertHelpWidget />
    </div>
  );
}
