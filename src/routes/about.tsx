import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Award, Heart, Users, ArrowRight } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { SectionTag } from "@/components/site/Home";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { breadcrumbSchema, crumbs } from "@/lib/breadcrumbs";
import { dealerInfo } from "@/lib/vehicles";
import dealership from "@/assets/dealership.jpg";
import interior from "@/assets/interior.jpg";

/** One array drives both the visible trail and the BreadcrumbList JSON-LD. */
const BREADCRUMBS = crumbs({ label: "About" });

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: `About AM Ford | Family-Owned Ford Dealer in ${dealerInfo.city}` },
      {
        name: "description",
        content: `AM Ford is a family-owned Ford dealer in ${dealerInfo.city}, serving Ashtabula County with honest pricing, certified Ford service, and no-pressure buying.`,
      },
      { property: "og:title", content: `About AM Ford | Ford Dealer in ${dealerInfo.city}` },
      {
        property: "og:description",
        content: `Family-owned Ford dealer in ${dealerInfo.city}, serving Ashtabula County and Northeast Ohio drivers.`,
      },
      { property: "og:url", content: "https://amford.com/about" },
    ],
    links: [{ rel: "canonical", href: "https://amford.com/about" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(breadcrumbSchema(BREADCRUMBS)),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "@id": "https://amford.com/about#webpage",
          url: "https://amford.com/about",
          name: `About AM Ford | Ford Dealer in ${dealerInfo.city}`,
          description: `AM Ford is a family-owned Ford dealer in ${dealerInfo.city}, serving Ashtabula County with honest pricing, certified Ford service, and no-pressure buying.`,
          mainEntity: { "@id": "https://amford.com/#dealer" },
        }),
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SiteShell>
      <Breadcrumbs items={BREADCRUMBS} />

      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 bg-gradient-soft" />
        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <SectionTag>Our story</SectionTag>
          <h1 className="display mt-4 text-balance text-5xl text-ink sm:text-7xl">
            A Ford store, built on a <span className="text-primary">handshake.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-muted-foreground">
            Three generations. One family. A simple promise: treat every customer like a neighbor,
            because in {dealerInfo.locality} and across Ashtabula County, they usually are.
          </p>
        </div>
      </section>

      {/* Showcase image */}
      <section className="px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] shadow-elevated ring-1 ring-border"
        >
          <img
            src={dealership}
            alt="AM Ford dealership"
            className="h-[420px] w-full object-cover sm:h-[560px]"
          />
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-12">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-6 sm:grid-cols-4">
          {[
            { v: "60+", l: "Years serving Ashtabula County" },
            { v: "20k+", l: "Vehicles delivered" },
            { v: "4.9★", l: "Average review score" },
            { v: "30+", l: "Team members" },
          ].map((s, i) => (
            <motion.div
              key={s.l}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="rounded-3xl bg-card p-6 text-center ring-1 ring-border"
            >
              <p className="display text-4xl text-primary">{s.v}</p>
              <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{s.l}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Story split */}
      <section className="py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <img src={interior} alt="" className="rounded-3xl shadow-elevated ring-1 ring-border" />
          </div>
          <div className="lg:col-span-7">
            <SectionTag>Since 1962</SectionTag>
            <h2 className="display mt-3 text-balance text-4xl sm:text-5xl">
              More than a dealership.
              <br />A piece of the community.
            </h2>
            <p className="mt-5 text-muted-foreground">
              We started as a small, family-run lot. Today we're one of the top-rated Ford dealers
              in Northeast Ohio, but the way we do business hasn't changed. Real prices. Real
              people. Real follow-through.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                {
                  i: Award,
                  t: "Ford President's Award",
                  d: "Top tier customer satisfaction recognition.",
                },
                {
                  i: Heart,
                  t: "Community first",
                  d: "Sponsoring local schools and youth sports for decades.",
                },
                { i: Users, t: "Family-owned", d: "Three generations of the same Ford family." },
              ].map((c) => (
                <div key={c.t} className="rounded-2xl bg-surface-2 p-5">
                  <c.i className="h-5 w-5 text-primary" />
                  <p className="display mt-3 text-base text-ink">{c.t}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{c.d}</p>
                </div>
              ))}
            </div>
            <Link
              to="/contact"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
            >
              Come say hi <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
