import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import dealershipImg from "@/assets/dealership.jpg";

interface UnmatchedExcellenceProps {
  image?: string;
  title?: string;
  subtitle?: string;
}

export function UnmatchedExcellence({
  image = "https://di-uploads-development.dealerinspire.com/amford/uploads/2025/08/am-ford-banner.webp",
  title = "Family-Owned Excellence Since 1964",
  subtitle = "Sixty years of transparent pricing, factory-certified Ford service, and dedicated ownership care in Ashtabula County, Ohio.",
}: UnmatchedExcellenceProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.8]);

  return (
    <section
      ref={containerRef}
      className="relative flex h-[55vh] min-h-[380px] w-full items-center justify-center overflow-hidden"
    >
      <motion.div style={{ y }} className="absolute inset-0 z-0 h-[130%] w-full">
        <img
          src={image}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = dealershipImg;
          }}
          alt="AM Ford Dealership in Ashtabula County, Ohio"
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/50 to-slate-950/70" />
      </motion.div>

      <motion.div style={{ opacity }} className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-white backdrop-blur-md mb-4 shadow-sm">
          Ashtabula County, OH
        </span>
        <h2 className="mb-4 text-3xl font-black tracking-tight text-white drop-shadow-2xl sm:text-4xl md:text-5xl">
          {title}
        </h2>
        <p className="mx-auto max-w-2xl text-sm font-medium text-white/90 drop-shadow-lg sm:text-base md:text-lg leading-relaxed">
          {subtitle}
        </p>
      </motion.div>
    </section>
  );
}
