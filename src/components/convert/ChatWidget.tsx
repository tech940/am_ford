import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  MessageSquare,
  Send,
  X,
  Sparkles,
  Phone,
  Clock,
  MapPin,
  Car,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Search,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { dealerInfo, vehicles, type Vehicle } from "@/lib/vehicles";
import {
  CONSENT_TEXT,
  RESPONSE_PROMISE,
  hasSubmittedLead,
  submitQuickLead,
  type QuickLeadInput,
} from "@/lib/leads";
import { cn } from "@/lib/utils";

const LABEL_DISMISSED_KEY = "am:chat-label-dismissed";
const TYPING_MS = 550;

type FlowId = "availability" | "financing" | "trade" | "test_drive" | "hours_location";

type CaptureCtx = Omit<QuickLeadInput, "phone">;

type Msg =
  | { id: number; kind: "assistant" | "user"; text: string }
  | { id: number; kind: "form"; ctx: CaptureCtx }
  | { id: number; kind: "vehicles"; list: Vehicle[]; title?: string }
  | { id: number; kind: "dealership_info" }
  | { id: number; kind: "success" };

const QUICK_ACTIONS = [
  { id: "availability" as FlowId, icon: Car, label: "Search & Browse Inventory" },
  { id: "test_drive" as FlowId, icon: Sparkles, label: "Schedule a Test Drive" },
  { id: "financing" as FlowId, icon: ShieldCheck, label: "Fast Financing Pre-Approval" },
  { id: "trade" as FlowId, icon: RefreshCw, label: "Instant $500 Bonus Trade Value" },
  { id: "hours_location" as FlowId, icon: MapPin, label: "Dealership Hours & Location" },
];

const GREETING =
  `Welcome to AM Ford! I'm your digital dealership concierge. How can I help you today? You can search any vehicle, ask about financing, or tap a quick option below.`;

const vehicleName = (v: Vehicle) => `${v.year} ${v.model} ${v.trim}`;

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [labelDismissed, setLabelDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(LABEL_DISMISSED_KEY) !== null || hasSubmittedLead();
    } catch {
      return true;
    }
  });

  const [messages, setMessages] = useState<Msg[]>([
    {
      id: 1,
      kind: "assistant",
      text: GREETING,
    },
  ]);
  const [typing, setTyping] = useState(false);

  const idRef = useRef(1);
  const nextId = () => {
    idRef.current += 1;
    return idRef.current;
  };

  const timersRef = useRef<number[]>([]);
  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      setTimeout(() => {
        el.scrollTop = el.scrollHeight;
      }, 50);
    }
  }, [messages, typing]);

  const dismissLabel = () => {
    setLabelDismissed(true);
    try {
      sessionStorage.setItem(LABEL_DISMISSED_KEY, new Date().toISOString());
    } catch {
      /* best effort */
    }
  };

  const asst = (text: string): Msg => ({ id: nextId(), kind: "assistant", text });
  const formMsg = (ctx: CaptureCtx): Msg => ({ id: nextId(), kind: "form", ctx });

  const replyAfterTyping = (make: () => Msg[]) => {
    setTyping(true);
    const t = window.setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [...prev, ...make()]);
    }, TYPING_MS);
    timersRef.current.push(t);
  };

  const handleUserSearchOrMessage = (rawText: string) => {
    const text = rawText.trim();
    if (!text) return;

    // Add user message bubble
    setMessages((prev) => [...prev, { id: nextId(), kind: "user", text }]);
    setInputText("");

    const lower = text.toLowerCase();

    // 1. Check for vehicle searches (model, trim, year, or general words)
    const matchingVehicles = vehicles.filter((v) => {
      const q = lower;
      return (
        v.model.toLowerCase().includes(q) ||
        v.make.toLowerCase().includes(q) ||
        v.type.toLowerCase().includes(q) ||
        v.trim.toLowerCase().includes(q) ||
        (q.includes("f-150") && v.model.includes("F-150")) ||
        (q.includes("f150") && v.model.includes("F-150")) ||
        (q.includes("truck") && v.type === "Truck") ||
        (q.includes("suv") && v.type === "SUV") ||
        (q.includes("electric") && (v.fuel === "Electric" || v.type === "EV")) ||
        (q.includes("hybrid") && v.fuel === "Hybrid") ||
        (q.includes("used") && v.condition === "Used") ||
        (q.includes("new") && v.condition === "New")
      );
    });

    if (lower.includes("hour") || lower.includes("location") || lower.includes("address") || lower.includes("open") || lower.includes("where")) {
      replyAfterTyping(() => [
        asst(`We are located at ${dealerInfo.address}. Here are our full showroom hours:`),
        { id: nextId(), kind: "dealership_info" },
      ]);
    } else if (lower.includes("financ") || lower.includes("credit") || lower.includes("loan") || lower.includes("rate") || lower.includes("payment")) {
      replyAfterTyping(() => [
        asst(
          "We work with 12+ lenders including guaranteed credit rebuild programs. Approvals happen at all credit levels with 0% impact on your credit score during initial pre-qualification. Would you like our finance team to connect with you?",
        ),
        formMsg({ message: `Chat inquiry regarding financing / credit: "${text}"` }),
      ]);
    } else if (lower.includes("trade") || lower.includes("worth") || lower.includes("sell") || lower.includes("apprais")) {
      replyAfterTyping(() => [
        asst(
          "We are currently offering top-dollar appraisals plus an additional $500 Trade-In Bonus. Enter your contact details and vehicle model below to receive an instant valuation offer.",
        ),
        formMsg({ message: `Chat inquiry regarding trade-in appraisal: "${text}"` }),
      ]);
    } else if (matchingVehicles.length > 0) {
      const topMatches = matchingVehicles.slice(0, 4);
      replyAfterTyping(() => [
        asst(`I found ${matchingVehicles.length} vehicles matching "${text}". Here are top matches currently in stock at AM Ford:`),
        { id: nextId(), kind: "vehicles", list: topMatches, title: `Matched Results (${matchingVehicles.length})` },
      ]);
    } else {
      replyAfterTyping(() => [
        asst(
          `Thanks for reaching out! A dedicated AM Ford product specialist is ready to answer your specific question about "${text}". Leave your phone number below for immediate assistance.`,
        ),
        formMsg({ message: `General inquiry: "${text}"` }),
      ]);
    }
  };

  const handleActionClick = (id: FlowId) => {
    if (id === "availability") {
      setMessages((prev) => [...prev, { id: nextId(), kind: "user", text: "Browse Featured Inventory" }]);
      replyAfterTyping(() => [
        asst("Here are several of our most popular new and pre-owned vehicles on the lot today:"),
        { id: nextId(), kind: "vehicles", list: vehicles.slice(0, 4), title: "Popular in Ashtabula County" },
      ]);
    } else if (id === "test_drive") {
      setMessages((prev) => [...prev, { id: nextId(), kind: "user", text: "Schedule a Test Drive" }]);
      replyAfterTyping(() => [
        asst("Select a vehicle below or enter the model you'd like us to warm up for your test drive:"),
        { id: nextId(), kind: "vehicles", list: vehicles.slice(0, 3), title: "Available for VIP Test Drive" },
      ]);
    } else if (id === "financing") {
      setMessages((prev) => [...prev, { id: nextId(), kind: "user", text: "Apply for Financing Pre-Approval" }]);
      replyAfterTyping(() => [
        asst(
          "We offer competitive rates with 12+ prime and subprime lenders. Leave your phone number and our finance director will personally review your pre-approval options.",
        ),
        formMsg({ message: "Chat: Fast Financing Pre-Approval Request" }),
      ]);
    } else if (id === "trade") {
      setMessages((prev) => [...prev, { id: nextId(), kind: "user", text: "Claim $500 Trade Bonus" }]);
      replyAfterTyping(() => [
        asst("Get the maximum value for your trade-in with our $500 bonus. Enter your phone number to get started:"),
        formMsg({ message: "Chat: $500 Trade Bonus & Instant Appraisal" }),
      ]);
    } else if (id === "hours_location") {
      setMessages((prev) => [...prev, { id: nextId(), kind: "user", text: "Show Hours & Location" }]);
      replyAfterTyping(() => [
        asst("AM Ford is conveniently located in Ashtabula County, OH serving all of Northeast Ohio and beyond:"),
        { id: nextId(), kind: "dealership_info" },
      ]);
    }
  };

  const selectVehicleForLead = (v: Vehicle) => {
    const name = vehicleName(v);
    setMessages((prev) => [...prev, { id: nextId(), kind: "user", text: `I'm interested in the ${name}` }]);
    replyAfterTyping(() => [
      asst(`The ${name} (Stock #${v.stockNumber || v.id.slice(0, 8).toUpperCase()}) is currently in stock at $${v.price.toLocaleString()}. Would you like us to hold it or schedule a test drive?`),
      formMsg({ vehicle: v, message: `Chat: Inquired about ${name} (Stock #${v.stockNumber || v.id})` }),
    ]);
  };

  const handleCaptured = (formId: number, phone: string) => {
    setMessages((prev) => [
      ...prev.filter((m) => m.id !== formId),
      { id: nextId(), kind: "user", text: phone },
      { id: nextId(), kind: "success" },
    ]);
  };

  return (
    <>
      {/* Clean Modern Floating Launcher (Bottom Right) */}
      <div
        className="fixed bottom-6 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center gap-3"
        style={{ marginBottom: "env(safe-area-inset-bottom)" }}
      >
        <AnimatePresence>
          {!open && !labelDismissed && (
            <motion.div
              initial={{ opacity: 0, x: 12, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 12, scale: 0.95 }}
              className="hidden sm:flex items-center gap-2.5 rounded-full bg-white/95 px-4 py-2 shadow-xl ring-1 ring-slate-200/80 backdrop-blur-md"
            >
              <div className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </div>
              <span className="text-xs font-bold text-slate-800 tracking-tight">
                Online Concierge <span className="font-normal text-slate-500">• Replies instantly</span>
              </span>
              <button
                type="button"
                onClick={dismissLabel}
                aria-label="Dismiss chat prompt"
                className="ml-1 grid h-5 w-5 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (open) {
              setOpen(false);
            } else {
              setOpen(true);
              dismissLabel();
            }
          }}
          aria-label={open ? "Close chat assistant" : "Open AM Ford Chat Concierge"}
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#002c5f] text-white shadow-[0_12px_32px_rgba(0,44,95,0.38)] ring-4 ring-white transition hover:bg-[#001f44] cursor-pointer"
        >
          {open ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <div className="relative flex items-center justify-center">
              <MessageSquare className="h-6 w-6 fill-white/15" />
            </div>
          )}
        </motion.button>
      </div>

      {/* Redesigned Sleek Concierge Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="AM Ford Concierge Assistant"
            initial={{ opacity: 0, y: 30, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="fixed bottom-22 right-3 sm:bottom-24 sm:right-6 z-50 flex h-[min(600px,calc(100dvh-7rem))] w-[calc(100vw-1.5rem)] sm:w-[410px] flex-col overflow-hidden rounded-3xl bg-slate-50 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] ring-1 ring-slate-900/10 backdrop-blur-xl"
          >
            {/* Header */}
            <div className="relative bg-[#002c5f] px-5 py-4 text-white shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
                    <Car className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-black tracking-tight leading-none text-white">
                        AM Ford Concierge
                      </p>
                      <span className="rounded bg-white/20 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-slate-100">
                        Live
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-200">
                      Official Dealership Assistant • Ashtabula County, OH
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <a
                    href={dealerInfo.phoneHref}
                    title="Call Dealership"
                    className="grid h-8 w-8 place-items-center rounded-full text-white/80 hover:bg-white/15 hover:text-white transition"
                  >
                    <Phone className="h-4 w-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close chat"
                    className="grid h-8 w-8 place-items-center rounded-full text-white/80 hover:bg-white/15 hover:text-white transition cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Suggestions Bar */}
            <div className="bg-white/80 border-b border-slate-200/80 px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 pl-1">
                Quick:
              </span>
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => handleActionClick(action.id)}
                    className="flex shrink-0 items-center gap-1 rounded-full bg-slate-100/90 hover:bg-[#002c5f] hover:text-white px-2.5 py-1 text-[11px] font-bold text-slate-700 transition active:scale-95 cursor-pointer"
                  >
                    <Icon className="h-3 w-3" />
                    <span>{action.label.split(" ")[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* Conversation Log */}
            <div ref={scrollRef} className="flex-1 space-y-3.5 overflow-y-auto px-4 py-4 bg-slate-50/60">
              {messages.map((m) => {
                if (m.kind === "form") {
                  return (
                    <PhoneCaptureCard
                      key={m.id}
                      ctx={m.ctx}
                      onCaptured={(phone) => handleCaptured(m.id, phone)}
                    />
                  );
                }
                if (m.kind === "vehicles") {
                  return (
                    <div key={m.id} className="space-y-2">
                      {m.title && (
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-1">
                          {m.title}
                        </p>
                      )}
                      <div className="grid grid-cols-1 gap-2">
                        {m.list.map((v) => (
                          <div
                            key={v.id}
                            onClick={() => selectVehicleForLead(v)}
                            className="group flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-xs transition hover:border-[#002c5f] hover:shadow-md cursor-pointer"
                          >
                            <img
                              src={v.image}
                              alt={vehicleName(v)}
                              className="h-14 w-18 shrink-0 rounded-xl object-cover bg-slate-100"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-black text-slate-900 truncate group-hover:text-[#002c5f]">
                                {vehicleName(v)}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs font-extrabold text-[#002c5f]">
                                  ${v.price.toLocaleString()}
                                </span>
                                <span className="text-[10px] font-semibold text-slate-500">
                                  {v.condition}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                                {v.features.slice(0, 2).join(" • ")}
                              </p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#002c5f] shrink-0 transition-transform group-hover:translate-x-0.5" />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                if (m.kind === "dealership_info") {
                  return (
                    <div key={m.id} className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs space-y-2.5">
                      <div className="flex items-start gap-2.5">
                        <MapPin className="h-4 w-4 text-[#002c5f] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-slate-900">AM Ford Showroom</p>
                          <p className="text-[11px] text-slate-600 leading-snug">{dealerInfo.address}</p>
                        </div>
                      </div>
                      <div className="border-t border-slate-100 pt-2 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span>Showroom Hours:</span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-slate-600 pl-5">
                          {dealerInfo.hours.map((h, i) => (
                            <div key={i} className="flex justify-between gap-1">
                              <span className="font-medium text-slate-500">{h.day}:</span>
                              <span className="font-semibold text-slate-800">{h.time}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                }
                if (m.kind === "success") {
                  return <SuccessBanner key={m.id} />;
                }
                return (
                  <MessageBubble key={m.id} role={m.kind}>
                    {m.text}
                  </MessageBubble>
                );
              })}

              {typing && <TypingIndicator />}
            </div>

            {/* Smart Search & Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUserSearchOrMessage(inputText);
              }}
              className="p-3 bg-white border-t border-slate-200/90 flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask a question or search models (e.g. F-150, Bronco)..."
                  className="h-10 w-full rounded-full border border-slate-200 bg-slate-50 pl-3.5 pr-8 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#002c5f] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002c5f]/15 transition"
                />
                {inputText && (
                  <button
                    type="button"
                    onClick={() => setInputText("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={!inputText.trim()}
                aria-label="Send message"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#002c5f] text-white shadow-md transition hover:bg-[#001f44] disabled:opacity-40 disabled:hover:bg-[#002c5f] cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ---------------------------------- Subcomponents ---------------------------------- */

function MessageBubble({ role, children }: { role: "assistant" | "user"; children: ReactNode }) {
  const isUser = role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-xs",
          isUser
            ? "rounded-br-sm bg-[#002c5f] text-white font-medium shadow-[0_4px_12px_rgba(0,44,95,0.2)]"
            : "rounded-bl-sm bg-white border border-slate-200/80 text-slate-800 font-normal",
        )}
      >
        {children}
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-slate-200/80 bg-white px-3.5 py-2.5 shadow-xs">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#002c5f]" style={{ animationDelay: "0ms" }} />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#002c5f]" style={{ animationDelay: "150ms" }} />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#002c5f]" style={{ animationDelay: "300ms" }} />
      </div>
    </motion.div>
  );
}

function PhoneCaptureCard({
  ctx,
  onCaptured,
}: {
  ctx: CaptureCtx;
  onCaptured: (phone: string) => void;
}) {
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    setSending(true);
    setError("");
    const result = await submitQuickLead({ ...ctx, phone });
    setSending(false);
    if (result.success) {
      onCaptured(phone.trim());
    } else {
      setError(result.message);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex">
      <form
        onSubmit={handleSubmit}
        className="w-full rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs space-y-2.5"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-900">
            <Phone className="h-3 w-3" />
          </div>
          <p className="text-xs font-bold text-slate-900">
            Connect with an AM Ford Specialist
          </p>
        </div>
        <p className="text-[11px] text-slate-500 leading-normal">
          Enter your mobile number to receive instant pricing confirmation & text answers.
        </p>
        <input
          type="tel"
          required
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="(440) 555-0199"
          aria-label="Phone number"
          className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-900 outline-none transition focus:border-[#002c5f] focus:bg-white focus:ring-2 focus:ring-[#002c5f]/15"
        />
        <label className="flex cursor-pointer items-start gap-2 py-0.5">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-slate-300 accent-[#002c5f]"
          />
          <span className="text-[10px] leading-tight text-slate-500">{CONSENT_TEXT}</span>
        </label>
        {error && <p className="text-[11px] font-semibold text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={!consent || sending}
          className="flex h-9 w-full items-center justify-center gap-1.5 rounded-xl bg-[#002c5f] text-xs font-bold text-white shadow-xs transition hover:bg-[#001f44] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
        >
          {sending ? "Sending..." : "Submit & Connect"}
        </button>
      </form>
    </motion.div>
  );
}

function SuccessBanner() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex">
      <div className="w-full rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3.5 shadow-xs">
        <div className="flex items-start gap-2.5">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <div>
            <p className="text-xs font-black text-emerald-950">Inquiry Received!</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-emerald-800">{RESPONSE_PROMISE}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

