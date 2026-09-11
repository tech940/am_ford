import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  MapPin,
  Phone,
  Navigation,
  ExternalLink,
  Star,
  Calendar,
  Wrench,
  ShoppingBag,
} from "lucide-react";
import { dealerInfo } from "@/lib/vehicles";
import { cn } from "@/lib/utils";

type DepartmentKey = "sales" | "service" | "parts";

interface DaySchedule {
  day: string;
  dayShort: string;
  dayIndex: number; // 0 = Sunday, 1 = Monday, etc.
  hours: string;
  isOpen: boolean;
  openHour?: number;
  closeHour?: number;
}

interface DepartmentInfo {
  name: string;
  icon: typeof ShoppingBag;
  phone: string;
  phoneHref: string;
  badge: string;
  description: string;
  schedule: DaySchedule[];
}

const DEPARTMENTS: Record<DepartmentKey, DepartmentInfo> = {
  sales: {
    name: "Sales",
    icon: ShoppingBag,
    phone: "(440) 553-7072",
    phoneHref: "tel:+14405537072",
    badge: "New & Pre-Owned Showroom",
    description: "New Ford inventory, certified pre-owned vehicles, custom factory orders, and remote home delivery.",
    schedule: [
      { day: "Monday", dayShort: "Mon", dayIndex: 1, hours: "9:00 AM - 8:00 PM", isOpen: true, openHour: 9, closeHour: 20 },
      { day: "Tuesday", dayShort: "Tue", dayIndex: 2, hours: "9:00 AM - 6:00 PM", isOpen: true, openHour: 9, closeHour: 18 },
      { day: "Wednesday", dayShort: "Wed", dayIndex: 3, hours: "9:00 AM - 8:00 PM", isOpen: true, openHour: 9, closeHour: 20 },
      { day: "Thursday", dayShort: "Thu", dayIndex: 4, hours: "9:00 AM - 8:00 PM", isOpen: true, openHour: 9, closeHour: 20 },
      { day: "Friday", dayShort: "Fri", dayIndex: 5, hours: "9:00 AM - 6:00 PM", isOpen: true, openHour: 9, closeHour: 18 },
      { day: "Saturday", dayShort: "Sat", dayIndex: 6, hours: "9:00 AM - 5:00 PM", isOpen: true, openHour: 9, closeHour: 17 },
      { day: "Sunday", dayShort: "Sun", dayIndex: 0, hours: "Closed", isOpen: false },
    ],
  },
  service: {
    name: "Service",
    icon: Wrench,
    phone: "(440) 553-7074",
    phoneHref: "tel:+14405537074",
    badge: "Certified Ford Workshop & Quick Lane",
    description: "Factory-trained technicians, state inspections, oil changes, brake service, tires, and warranty repairs.",
    schedule: [
      { day: "Monday", dayShort: "Mon", dayIndex: 1, hours: "7:30 AM - 6:00 PM", isOpen: true, openHour: 7.5, closeHour: 18 },
      { day: "Tuesday", dayShort: "Tue", dayIndex: 2, hours: "7:30 AM - 6:00 PM", isOpen: true, openHour: 7.5, closeHour: 18 },
      { day: "Wednesday", dayShort: "Wed", dayIndex: 3, hours: "7:30 AM - 6:00 PM", isOpen: true, openHour: 7.5, closeHour: 18 },
      { day: "Thursday", dayShort: "Thu", dayIndex: 4, hours: "7:30 AM - 6:00 PM", isOpen: true, openHour: 7.5, closeHour: 18 },
      { day: "Friday", dayShort: "Fri", dayIndex: 5, hours: "7:30 AM - 6:00 PM", isOpen: true, openHour: 7.5, closeHour: 18 },
      { day: "Saturday", dayShort: "Sat", dayIndex: 6, hours: "8:00 AM - 2:00 PM", isOpen: true, openHour: 8, closeHour: 14 },
      { day: "Sunday", dayShort: "Sun", dayIndex: 0, hours: "Closed", isOpen: false },
    ],
  },
  parts: {
    name: "Parts",
    icon: ShoppingBag,
    phone: "(440) 553-7075",
    phoneHref: "tel:+14405537075",
    badge: "OEM Ford & Motorcraft Counter",
    description: "Genuine Ford OEM parts, performance accessories, tires, batteries, and wholesale supply orders.",
    schedule: [
      { day: "Monday", dayShort: "Mon", dayIndex: 1, hours: "8:00 AM - 5:30 PM", isOpen: true, openHour: 8, closeHour: 17.5 },
      { day: "Tuesday", dayShort: "Tue", dayIndex: 2, hours: "8:00 AM - 5:30 PM", isOpen: true, openHour: 8, closeHour: 17.5 },
      { day: "Wednesday", dayShort: "Wed", dayIndex: 3, hours: "8:00 AM - 5:30 PM", isOpen: true, openHour: 8, closeHour: 17.5 },
      { day: "Thursday", dayShort: "Thu", dayIndex: 4, hours: "8:00 AM - 5:30 PM", isOpen: true, openHour: 8, closeHour: 17.5 },
      { day: "Friday", dayShort: "Fri", dayIndex: 5, hours: "8:00 AM - 5:30 PM", isOpen: true, openHour: 8, closeHour: 17.5 },
      { day: "Saturday", dayShort: "Sat", dayIndex: 6, hours: "8:00 AM - 2:00 PM", isOpen: true, openHour: 8, closeHour: 14 },
      { day: "Sunday", dayShort: "Sun", dayIndex: 0, hours: "Closed", isOpen: false },
    ],
  },
};

const LOCATIONS = [
  {
    id: "main",
    title: "AM Ford — Main Showroom & Lot",
    subtitle: "Ashtabula County, OH",
    address: dealerInfo.address,
    status: "Primary Dealership Campus",
  },
  {
    id: "service",
    title: "Certified Service & Quick Lane",
    subtitle: "On-Site Facility",
    address: dealerInfo.address,
    status: "Service & Parts Drive",
  },
  {
    id: "delivery",
    title: "Complimentary Delivery Hub",
    subtitle: "300-Mile Radius",
    address: "Direct to Your Driveway across OH, PA & Nationwide",
    status: "Door-to-Door Service",
  },
];

export function DealershipLocationAndHours() {
  const [activeLocation, setActiveLocation] = useState("main");
  const [activeDept, setActiveDept] = useState<DepartmentKey>("sales");

  // Get current day of week in Ohio (EST)
  const currentDayIndex = useMemo(() => {
    try {
      const now = new Date();
      return now.getDay();
    } catch {
      return 1;
    }
  }, []);

  const deptData = DEPARTMENTS[activeDept];
  const todaySchedule = deptData.schedule.find((s) => s.dayIndex === currentDayIndex) || deptData.schedule[0];

  const mapsQuery = encodeURIComponent(`${dealerInfo.name}, ${dealerInfo.address}`);
  const mapsEmbedUrl = `https://maps.google.com/maps?q=${mapsQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  const mapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${mapsQuery}`;

  return (
    <section
      className="py-12 sm:py-16 lg:py-20 bg-slate-50 border-y border-slate-200/90 overflow-hidden"
      aria-labelledby="dealership-hours-location-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#002c5f]">
              <MapPin className="h-3.5 w-3.5" />
              <span>Dealership Location & Hours</span>
            </span>
            <h2
              id="dealership-hours-location-title"
              className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900"
            >
              Visit AM Ford Showroom & Service
            </h2>
          </div>
          <p className="max-w-md text-xs sm:text-sm text-slate-600 font-medium">
            Serving Ashtabula County, Northeast Ohio, Northwestern Pennsylvania, and nationwide drivers with transparent pricing and full-service care.
          </p>
        </div>

        {/* Main Widget Card */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
          {/* Top Campus Location Tabs */}
          <div className="flex items-center border-b border-slate-200 bg-slate-50/80 overflow-x-auto no-scrollbar">
            {LOCATIONS.map((loc) => {
              const isActive = activeLocation === loc.id;
              return (
                <button
                  key={loc.id}
                  onClick={() => setActiveLocation(loc.id)}
                  className={cn(
                    "flex items-center gap-2 px-5 sm:px-7 py-3.5 text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer border-r border-slate-200/70 border-b-2",
                    isActive
                      ? "bg-white text-[#002c5f] border-b-[#002c5f] shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border-b-transparent"
                  )}
                >
                  <MapPin className={cn("h-4 w-4 shrink-0", isActive ? "text-[#002c5f]" : "text-slate-400")} />
                  <span>{loc.title}</span>
                  <span className={cn(
                    "hidden sm:inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold",
                    isActive ? "bg-[#002c5f]/10 text-[#002c5f]" : "bg-slate-200/60 text-slate-600"
                  )}>
                    {loc.subtitle}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 2-Column Split: Hours & Info (Left) | Interactive Google Map (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
            {/* LEFT COLUMN: Location Details + Department Tabs & Schedule Table */}
            <div className="lg:col-span-6 p-5 sm:p-7 flex flex-col justify-between">
              <div>
                {/* Dealership Address & Contact Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#002c5f] text-white shadow-xs">
                        <MapPin className="h-4 w-4" />
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-slate-900">
                        {dealerInfo.name}
                      </h3>
                    </div>
                    <p className="mt-1 text-xs sm:text-sm text-slate-600 font-medium pl-9">
                      {dealerInfo.address}
                    </p>
                  </div>

                  <div className="sm:text-right pl-9 sm:pl-0 shrink-0">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Direct Phone
                    </span>
                    <a
                      href={deptData.phoneHref}
                      className="mt-0.5 inline-flex items-center gap-1.5 text-sm sm:text-base font-black text-[#002c5f] hover:underline"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      <span>{deptData.phone}</span>
                    </a>
                  </div>
                </div>

                {/* Department Selection Tabs */}
                <div className="mt-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Select Department:
                    </span>
                    <span className="text-[11px] font-semibold text-[#002c5f]">
                      {deptData.badge}
                    </span>
                  </div>

                  <div className="mt-2.5 grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200/80">
                    {(["sales", "service", "parts"] as DepartmentKey[]).map((key) => {
                      const dept = DEPARTMENTS[key];
                      const isSelected = activeDept === key;
                      const Icon = dept.icon;

                      return (
                        <button
                          key={key}
                          onClick={() => setActiveDept(key)}
                          className={cn(
                            "flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer",
                            isSelected
                              ? "bg-[#002c5f] text-white shadow-sm"
                              : "text-slate-700 hover:text-slate-900 hover:bg-white/60"
                          )}
                        >
                          <Icon className="h-3.5 w-3.5 shrink-0" />
                          <span>{dept.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Today Status Bar */}
                <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 px-3.5 py-2 border border-slate-200/70 text-xs">
                  <span className="font-semibold text-slate-700">
                    Today ({todaySchedule.day}):
                  </span>
                  <span className="font-black text-[#002c5f]">
                    {todaySchedule.hours}
                  </span>
                </div>

                {/* Schedule Table */}
                <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-100/80 text-[11px] font-black uppercase tracking-wider text-slate-600">
                        <th className="px-4 py-2.5">Day</th>
                        <th className="px-4 py-2.5 text-right">{deptData.name} Hours</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {deptData.schedule.map((item) => {
                        const isToday = item.dayIndex === currentDayIndex;
                        return (
                          <tr
                            key={item.day}
                            className={cn(
                              "transition-colors",
                              isToday
                                ? "bg-[#002c5f]/8 font-bold text-[#002c5f]"
                                : "hover:bg-slate-50 text-slate-700 font-medium"
                            )}
                          >
                            <td className="px-4 py-2.5 flex items-center gap-2">
                              <span>{item.day}</span>
                              {isToday && (
                                <span className="rounded bg-[#002c5f] px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
                                  Today
                                </span>
                              )}
                            </td>
                            <td className={cn(
                              "px-4 py-2.5 text-right tabular-nums",
                              item.hours === "Closed" ? "text-slate-400 font-normal" : "text-slate-900"
                            )}>
                              {item.hours}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons underneath table */}
              <div className="mt-6 flex flex-wrap items-center gap-2.5 pt-4 border-t border-slate-100">
                <a
                  href={mapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#002c5f] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#001f44] transition active:scale-95"
                >
                  <Navigation className="h-3.5 w-3.5" />
                  <span>Get Directions</span>
                </a>
                <a
                  href={deptData.phoneHref}
                  className="flex-1 min-w-[130px] inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 transition shadow-2xs active:scale-95"
                >
                  <Phone className="h-3.5 w-3.5 text-[#002c5f]" />
                  <span>Call {deptData.name}</span>
                </a>
                {activeDept === "service" ? (
                  <Link
                    to="/service"
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#002c5f]/30 bg-[#002c5f]/5 px-3.5 py-2.5 text-xs font-bold text-[#002c5f] hover:bg-[#002c5f]/10 transition"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Book Service</span>
                  </Link>
                ) : (
                  <Link
                    to="/inventory"
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#002c5f]/30 bg-[#002c5f]/5 px-3.5 py-2.5 text-xs font-bold text-[#002c5f] hover:bg-[#002c5f]/10 transition"
                  >
                    <span>View Inventory</span>
                  </Link>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Interactive Google Map with floating verified info card */}
            <div className="lg:col-span-6 relative min-h-[380px] lg:min-h-[500px] bg-slate-100 flex flex-col">
              {/* Floating Verified Card on Top of Map */}
              <div className="absolute top-3 left-3 right-3 sm:right-auto sm:max-w-xs z-10 rounded-xl bg-white/95 p-3.5 shadow-xl backdrop-blur-md border border-slate-200/90">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                      {dealerInfo.name}
                    </h4>
                    <p className="mt-0.5 text-[11px] text-slate-600 font-medium">
                      {dealerInfo.street}, {dealerInfo.locality}, {dealerInfo.region} {dealerInfo.postalCode}
                    </p>
                  </div>
                  <a
                    href={mapsDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#002c5f] text-white shadow-xs hover:bg-[#001f44] transition"
                    aria-label="Open directions in Google Maps"
                  >
                    <Navigation className="h-3.5 w-3.5" />
                  </a>
                </div>

                <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px]">
                  <div className="flex items-center gap-1 font-black text-slate-900">
                    <span className="text-amber-500">4.9</span>
                    <div className="flex text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-current" />
                      ))}
                    </div>
                    <span className="text-slate-500 font-normal">(2,400+)</span>
                  </div>
                  <a
                    href={mapsDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-[#002c5f] hover:underline flex items-center gap-0.5"
                  >
                    <span>Directions</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
              </div>

              {/* Real Responsive Google Map Embed */}
              <iframe
                src={mapsEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="flex-1 w-full h-full min-h-[380px] lg:min-h-[500px]"
                title="AM Ford Dealership Location Map"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
