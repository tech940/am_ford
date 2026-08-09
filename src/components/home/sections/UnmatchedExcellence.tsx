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
  title = "Unmatched Excellence",
  subtitle = "Experience the pinnacle of automotive engineering and customer care with AM Group.",
}: UnmatchedExcellenceProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative flex h-[65vh] min-h-[420px] w-full items-center justify-center overflow-hidden"
    >
      <motion.div style={{ y }} className="absolute inset-0 z-0 h-[140%] w-full">
        <img
          src={image}
          onError={(e) => {
            // Fallback to local dealership asset if remote URL fails
            (e.currentTarget as HTMLImageElement).src = dealershipImg;
          }}
          alt="AM Ford Unmatched Excellence Stage"
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/45" />
      </motion.div>

      <motion.div style={{ opacity }} className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <h2 className="mb-4 text-4xl font-black tracking-tight text-white drop-shadow-2xl sm:text-5xl md:text-6xl">
          {title}
        </h2>
        <p className="mx-auto max-w-2xl text-base font-medium text-white/90 drop-shadow-lg sm:text-lg md:text-xl">
          {subtitle}
        </p>
      </motion.div>
    </section>
  );
}
