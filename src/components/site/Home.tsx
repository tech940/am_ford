import { useRef, useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform, useSpring, type MotionValue } from "framer-motion";
import {
  ArrowRight,
  Phone,
  Sparkles,
  ShieldCheck,
  Wrench,
  Calculator,
  Search,
  Zap,
  Star,
  MapPin,
  ChevronRight,
  Award,
  Quote,
  CheckCircle2,
  Calendar,
  Clock,
  DollarSign,
} from "lucide-react";
import heroTruck from "@/assets/hero-truck.jpg";
import dealership from "@/assets/dealership.jpg";
import interior from "@/assets/interior.jpg";
import service from "@/assets/service.jpg";
import { vehicles, dealerInfo } from "@/lib/vehicles";
import { VehicleCard } from "@/components/site/VehicleCard";
import OfferPopup from "@/components/popups/OfferPopup";
import TradeOfferPopup from "@/components/popups/TradeOfferPopup";

/* ------------ Hero ------------ */
function Hero({ onOpenOffer, onOpenTrade }: { onOpenOffer: () => void; onOpenTrade: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const yBg = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-[92vh] overflow-hidden">
      {/* Background gradient + grid */}
      <div className="absolute inset-0 bg-gradient-soft" />
      <div className="absolute inset-0 grid-bg opacity-60 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div className="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-radial-navy" />

      {/* Vehicle image — parallax */}
      <motion.div
        style={{ y: yBg, scale }}
        className="absolute inset-x-0 top-[18%] flex justify-center"
      >
        <img
          src={heroTruck}
          alt="2025 Ford F-150 Platinum"
          width={1920}
          height={1080}
          className="w-[140%] max-w-none object-contain drop-shadow-[0_40px_60px_rgba(0,20,46,0.25)] sm:w-[110%] lg:w-[95%]"
        />
      </motion.div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-b from-transparent via-background/60 to-background" />

      {/* Content */}
      <motion.div
        style={{ y, opacity: fade }}
        className="relative z-10 mx-auto flex min-h-[92vh] max-w-7xl flex-col items-center justify-start px-6 pt-16 text-center sm:pt-24"
      >
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-ink"
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Now arriving · 2025 Ford lineup
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="display mt-6 max-w-4xl text-balance text-5xl text-ink sm:text-6xl lg:text-7xl"
        >
          The road ahead, <span className="text-primary">built in Ashtabula.</span>
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-6 max-w-2xl rounded-2xl bg-white/90 px-6 py-3.5 shadow-md ring-1 ring-border/80 backdrop-blur-xl"
        >
          <p className="text-balance text-base font-medium leading-relaxed text-slate-900 sm:text-lg sm:font-semibold">
            Family-owned Ford dealer with the full lineup of trucks, SUVs and EVs — straight
            pricing, expert service, zero pressure.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            to="/inventory"
            className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-90"
          >
            Browse inventory{" "}
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
          <button
            onClick={onOpenOffer}
            className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-3 text-sm font-bold text-slate-950 shadow-md transition hover:bg-amber-400"
          >
            <Sparkles className="h-4 w-4" /> Claim $500 OFF
          </button>
          <button
            onClick={onOpenTrade}
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-900 ring-1 ring-border shadow-sm transition hover:bg-slate-50"
          >
            <DollarSign className="h-4 w-4 text-emerald-600" /> Value Your Trade
          </button>
          <a
            href={dealerInfo.phoneHref}
            className="inline-flex items-center gap-2 rounded-full bg-white/80 px-6 py-3 text-sm font-semibold text-ink ring-1 ring-border backdrop-blur-md transition hover:bg-white"
          >
            <Phone className="h-4 w-4" /> Call sales
          </a>
        </motion.div>

        {/* Floating stat cards */}
        <div className="pointer-events-none absolute inset-x-0 top-[58%] mx-auto hidden max-w-7xl px-6 lg:block">
          <FloatCard className="absolute left-2 top-0" delay={0.9}>
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 text-primary" />
              <div className="text-left">
                <p className="display text-lg leading-none">4.9 ★</p>
                <p className="text-xs text-muted-foreground">2,400+ reviews</p>
              </div>
            </div>
          </FloatCard>
          <FloatCard className="absolute right-2 top-12" delay={1.1}>
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <div className="text-left">
                <p className="display text-lg leading-none">Lifetime</p>
                <p className="text-xs text-muted-foreground">Powertrain warranty</p>
              </div>
            </div>
          </FloatCard>
          <FloatCard className="absolute left-1/2 top-44 -translate-x-1/2" delay={1.3}>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary" />
              <div className="text-left">
                <p className="display text-sm leading-none">Ashtabula, OH</p>
                <p className="text-xs text-muted-foreground">Open today · 9–8</p>
              </div>
            </div>
          </FloatCard>
        </div>
      </motion.div>
    </section>
  );
}

function FloatCard({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`pointer-events-auto glass-strong inline-flex animate-floaty rounded-2xl px-4 py-3 ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* ------------ Marquee ------------ */
function BrandMarquee() {
  const items = [
    "F-150",
    "Mustang",
    "Bronco",
    "Explorer",
    "Lightning EV",
    "Escape",
    "Maverick",
    "Edge",
    "Ranger",
    "Expedition",
  ];
  const row = [...items, ...items];
  return (
    <section className="border-y border-border bg-surface py-6">
      <div className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
        <div className="flex w-max animate-marquee gap-12 whitespace-nowrap">
          {row.map((m, i) => (
            <span
              key={i}
              className="display flex items-center gap-3 text-2xl text-muted-foreground"
            >
              {m}
              <span className="text-primary/40">●</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------ Scroll Assembly ------------ */
function ScrollAssembly() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const sp = useSpring(scrollYProgress, { stiffness: 80, damping: 20 });

  // Each "part" flies in from a direction
  const parts = [
    { src: heroTruck, x: -300, y: -120, r: -10, label: "Engineering" },
    { src: interior, x: 280, y: 100, r: 8, label: "Craftsmanship" },
    { src: dealership, x: -260, y: 180, r: 6, label: "Experience" },
  ];

  return (
    <section ref={ref} className="relative overflow-hidden py-32 sm:py-44">
      <div className="absolute inset-0 bg-gradient-soft" />
      <div className="relative mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-2 lg:items-center">
        <div>
          <SectionTag>The AM Ford difference</SectionTag>
          <h2 className="display mt-4 text-balance text-4xl text-ink sm:text-5xl lg:text-6xl">
            Every detail, <span className="text-primary">assembled with intent.</span>
          </h2>
          <p className="mt-5 max-w-lg text-pretty text-muted-foreground">
            From the first conversation to the final handshake, we build your buying experience the
            same way Ford engineers build their trucks — piece by piece, with care that shows.
          </p>
          <ul className="mt-8 space-y-4">
            {[
              "Transparent pricing displayed up front, every time.",
              "Certified Ford technicians and OEM parts on every repair.",
              "Lifetime powertrain warranty included with every new vehicle.",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3 text-ink">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Assembly stage */}
        <div className="relative h-[460px] sm:h-[520px]">
          <ScrollPart progress={sp} from={parts[0]} index={0} />
          <ScrollPart progress={sp} from={parts[1]} index={1} />
          <ScrollPart progress={sp} from={parts[2]} index={2} />
          {/* Center final card */}
          <motion.div
            style={{
              scale: useTransform(sp, [0.2, 0.7], [0.85, 1]),
              opacity: useTransform(sp, [0.2, 0.6], [0, 1]),
            }}
            className="glass-strong absolute left-1/2 top-1/2 z-10 w-[80%] max-w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-3xl p-6 text-center"
          >
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground">
              <Award className="h-6 w-6" />
            </div>
            <h3 className="display mt-4 text-2xl">Built around you</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              60+ years serving Northeast Ohio drivers.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ScrollPart({
  progress,
  from,
  index,
}: {
  progress: MotionValue<number>;
  from: { src: string; x: number; y: number; r: number; label: string };
  index: number;
}) {
  const start = 0.05 + index * 0.12;
  const end = 0.45 + index * 0.05;
  const x = useTransform(progress, [start, end], [from.x, 0]);
  const y = useTransform(progress, [start, end], [from.y, 0]);
  const rot = useTransform(progress, [start, end], [from.r, 0]);
  const opacity = useTransform(progress, [start, start + 0.05, end - 0.05, end], [0, 1, 1, 0.85]);
  const scale = useTransform(progress, [start, end], [0.7, 1]);

  const positions = ["left-0 top-2", "right-0 top-1/3", "left-6 bottom-0"];

  return (
    <motion.div
      style={{ x, y, rotate: rot, opacity, scale }}
      className={`absolute h-40 w-56 overflow-hidden rounded-2xl shadow-elevated ring-1 ring-border ${positions[index]}`}
    >
      <img src={from.src} alt={from.label} loading="lazy" className="h-full w-full object-cover" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-3 text-xs font-semibold text-white">
        {from.label}
      </div>
    </motion.div>
  );
}

/* ------------ Quick Actions ------------ */
function QuickActions() {
  const items = [
    {
      icon: Search,
      title: "Browse Inventory",
      desc: "200+ Ford vehicles in stock",
      to: "/inventory",
    },
    {
      icon: Calculator,
      title: "Get Pre-Approved",
      desc: "60-second financing form",
      to: "/financing",
    },
    { icon: Wrench, title: "Schedule Service", desc: "Certified Ford technicians", to: "/service" },
    { icon: Calendar, title: "Book Test Drive", desc: "Same-day availability", to: "/contact" },
  ] as const;
  return (
    <section className="relative py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => (
            <motion.div
              key={it.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.07 }}
            >
              <Link
                to={it.to}
                className="glass-strong group block rounded-3xl p-6 transition hover:-translate-y-1 hover:shadow-elevated"
              >
                <div className="flex items-center justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground transition group-hover:scale-105">
                    <it.icon className="h-5 w-5" />
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
                <h3 className="display mt-5 text-xl text-ink">{it.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{it.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------ Featured Vehicles ------------ */
function Featured() {
  const featured = vehicles.slice(0, 3);
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <SectionTag>This week's arrivals</SectionTag>
            <h2 className="display mt-3 text-balance text-4xl text-ink sm:text-5xl">
              Featured vehicles, freshly detailed.
            </h2>
          </div>
          <Link
            to="/inventory"
            className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary"
          >
            See all inventory <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((v, i) => (
            <VehicleCard key={v.id} v={v} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------ Why Us — Split Layout ------------ */
function WhyUs() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="absolute inset-0 bg-gradient-navy" />
      <div className="absolute inset-0 opacity-25 noise" />
      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-5">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white/80">
            Why AM Ford
          </span>
          <h2 className="display mt-4 text-balance text-4xl text-white sm:text-5xl lg:text-6xl">
            Honest deals.
            <br />
            Real relationships.
          </h2>
          <p className="mt-5 max-w-md text-white/70">
            We're not a giant chain. We're a Ford store that's been earning trust in Ashtabula for
            decades — one neighbor at a time.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/about"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-primary transition hover:bg-white/90"
            >
              Our story <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/20 backdrop-blur-md transition hover:bg-white/20"
            >
              Visit us
            </Link>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: ShieldCheck,
                t: "Lifetime Warranty",
                d: "Powertrain coverage on every new Ford.",
              },
              {
                icon: Award,
                t: "President's Award",
                d: "Top-tier Ford customer satisfaction recognition.",
              },
              {
                icon: Wrench,
                t: "Certified Service",
                d: "Factory-trained Ford technicians, OEM parts.",
              },
              {
                icon: Zap,
                t: "EV Certified",
                d: "Fully equipped to sell & service the Lightning.",
              },
            ].map((c, i) => (
              <motion.div
                key={c.t}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.6 }}
                className="glass rounded-3xl p-6 text-white"
              >
                <c.icon className="h-6 w-6 text-white" />
                <h3 className="display mt-4 text-xl">{c.t}</h3>
                <p className="mt-2 text-sm text-white/70">{c.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------ Offers — asymmetrical ------------ */
function Offers() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <SectionTag>Limited time</SectionTag>
            <h2 className="display mt-3 text-balance text-4xl text-ink sm:text-5xl">
              Special offers ending soon.
            </h2>
          </div>
          <Countdown />
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-navy p-8 text-white lg:col-span-7 lg:row-span-2 lg:p-12">
            <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
              Best deal
            </span>
            <h3 className="display mt-5 text-balance text-4xl sm:text-5xl">
              0.9% APR
              <br />
              on 2025 F-150
            </h3>
            <p className="mt-4 max-w-md text-white/75">
              For 60 months on qualifying credit. Plus up to $2,000 cash back on select Lariat
              trims.
            </p>
            <Link
              to="/inventory"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-primary transition hover:bg-white/90"
            >
              Shop F-150 deals <ArrowRight className="h-4 w-4" />
            </Link>
            <img
              src={heroTruck}
              alt="F-150"
              loading="lazy"
              className="pointer-events-none absolute -bottom-8 -right-10 hidden w-[55%] object-contain opacity-90 lg:block"
            />
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-card p-8 ring-1 ring-border lg:col-span-5">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              EV Tax Credit
            </span>
            <h3 className="display mt-3 text-2xl">$7,500 federal credit on Lightning</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Applied at point of sale on qualifying purchases.
            </p>
            <Link
              to="/vehicle/$id"
              params={{ id: "f150-lightning-2025" }}
              className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary"
            >
              View the F-150 Lightning <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-surface-2 p-8 lg:col-span-5">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              Service
            </span>
            <h3 className="display mt-3 text-2xl">Free multi-point inspection</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              With any service appointment booked online this month.
            </p>
            <Link
              to="/service"
              className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary"
            >
              Book service <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Countdown() {
  return (
    <div className="glass hidden items-center gap-3 rounded-2xl px-4 py-2.5 sm:flex">
      <Clock className="h-4 w-4 text-primary" />
      <div className="flex items-center gap-2 text-sm">
        <span className="display text-ink">06d</span>
        <span className="text-muted-foreground">:</span>
        <span className="display text-ink">14h</span>
        <span className="text-muted-foreground">:</span>
        <span className="display text-ink">22m</span>
      </div>
    </div>
  );
}

/* ------------ Testimonials ------------ */
function Testimonials() {
  const list = [
    {
      name: "Daniel R.",
      car: "2024 F-150 Lariat",
      text: "From the test drive to the keys in my hand, everything was straight and easy. No games on price. Cleanest dealership experience I've had.",
    },
    {
      name: "Sarah M.",
      car: "2025 Bronco Sport",
      text: "They actually listened to what I wanted instead of pushing the most expensive option. Will be back when my husband upgrades.",
    },
    {
      name: "Marcus T.",
      car: "2023 Mustang GT",
      text: "Service department is a step above. Honest quotes, finished early, washed the car for free. That's how it should be.",
    },
  ];
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <SectionTag>2,400+ reviews</SectionTag>
          <h2 className="display mt-3 text-balance text-4xl text-ink sm:text-5xl">
            Drivers who came back, and brought a friend.
          </h2>
        </div>
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {list.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.6 }}
              className="glass-strong relative overflow-hidden rounded-3xl p-7"
            >
              <Quote className="absolute right-6 top-6 h-10 w-10 text-primary/15" />
              <div className="flex gap-1 text-primary">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-4 text-pretty text-ink">"{t.text}"</blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {t.name[0]}
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.car}</p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------ Financing + Service split ------------ */
function FinancingService() {
  return (
    <section className="py-20">
      <div className="mx-auto grid max-w-7xl gap-6 px-6 lg:grid-cols-2">
        <div className="group relative overflow-hidden rounded-3xl bg-card ring-1 ring-border">
          <img
            src={interior}
            alt=""
            loading="lazy"
            className="h-72 w-full object-cover transition duration-700 group-hover:scale-105"
          />
          <div className="p-8">
            <SectionTag>Financing</SectionTag>
            <h3 className="display mt-3 text-3xl">Pre-approved in 60 seconds.</h3>
            <p className="mt-3 text-muted-foreground">
              Soft credit pull. Won't affect your score. Real rates from real lenders.
            </p>
            <Link
              to="/financing"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
            >
              Start application <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-3xl bg-card ring-1 ring-border">
          <img
            src={service}
            alt=""
            loading="lazy"
            className="h-72 w-full object-cover transition duration-700 group-hover:scale-105"
          />
          <div className="p-8">
            <SectionTag>Service</SectionTag>
            <h3 className="display mt-3 text-3xl">Certified Ford service.</h3>
            <p className="mt-3 text-muted-foreground">
              Oil changes, tires, diagnostics, recalls — same-day appointments available.
            </p>
            <Link
              to="/service"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
            >
              Book a service <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------ Final CTA ------------ */
function FinalCTA() {
  return (
    <section className="px-6 py-24">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-gradient-navy p-10 text-center text-white shadow-glow sm:p-16">
        <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
        <h2 className="display relative text-balance text-4xl sm:text-6xl">
          Ready to take the wheel?
        </h2>
        <p className="relative mx-auto mt-4 max-w-xl text-white/75">
          Book a no-pressure test drive at AM Ford. We'll have it pulled up, detailed and ready when
          you arrive.
        </p>
        <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-primary"
          >
            Book test drive <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href={dealerInfo.phoneHref}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/20 backdrop-blur-md"
          >
            <Phone className="h-4 w-4" /> {dealerInfo.phone}
          </a>
        </div>
      </div>
    </section>
  );
}

/* ------------ Helpers ------------ */
export function SectionTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
      {children}
    </span>
  );
}

export function Home() {
  const [offerOpen, setOfferOpen] = useState(false);
  const [tradeOpen, setTradeOpen] = useState(false);

  // Auto-open Trade Offer Popup after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setTradeOpen(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Hero onOpenOffer={() => setOfferOpen(true)} onOpenTrade={() => setTradeOpen(true)} />
      <BrandMarquee />
      <QuickActions />
      <ScrollAssembly />
      <Featured />
      <WhyUs />
      <Offers />
      <Testimonials />
      <FinancingService />
      <FinalCTA />

      {offerOpen && <OfferPopup onClose={() => setOfferOpen(false)} pageSource="Home" />}
      {tradeOpen && <TradeOfferPopup onClose={() => setTradeOpen(false)} pageSource="Home" />}
    </>
  );
}
