import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, MessageCircle, Send, X } from "lucide-react";
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
const TYPING_MS = 650;

type FlowId = "availability" | "financing" | "trade" | "test_drive";

/** Everything submitQuickLead needs except the phone the visitor is about to type. */
type CaptureCtx = Omit<QuickLeadInput, "phone">;

type Msg =
  | { id: number; kind: "assistant" | "user"; text: string }
  | { id: number; kind: "form"; ctx: CaptureCtx }
  | { id: number; kind: "success" };

type ChipSet = { kind: "root" } | { kind: "vehicles"; flow: FlowId } | { kind: "none" };

const ROOT_CHIPS: { label: string; flow: FlowId }[] = [
  { label: "Is a car still available?", flow: "availability" },
  { label: "Financing with imperfect credit?", flow: "financing" },
  { label: "What's my trade worth?", flow: "trade" },
  { label: "Book a test drive", flow: "test_drive" },
];

const GREETING =
  `Hi! You're chatting with ${dealerInfo.name} in ${dealerInfo.city}. ` +
  "What can we help with today?";

const FINANCING_REPLY =
  "We work with 12+ lenders including credit-rebuild programs — approvals happen at every " +
  "credit level. A soft pull takes 60 seconds and won't affect your score. Want a specialist " +
  "to text you the next steps?";

const TRADE_REPLY =
  "Most trades at AM Ford appraise higher than owners expect — plus a $500 bonus on top right " +
  "now. Fastest path: our 60-second valuator, or a specialist can call you.";

const vehicleName = (v: Vehicle) => `${v.year} ${v.model} ${v.trim}`;

/* ---------------------------------- tiny subcomponents ---------------------------------- */

function Bubble({ role, children }: { role: "assistant" | "user"; children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex", role === "user" ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
          role === "user"
            ? "rounded-br-md bg-[#002c5f] text-white"
            : "rounded-bl-md bg-slate-100 text-slate-800",
        )}
      >
        {children}
      </div>
    </motion.div>
  );
}

function TypingDots() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-slate-100 px-4 py-3">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </motion.div>
  );
}

function Chip({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-10 rounded-full bg-white px-4 py-2 text-left text-[13px] font-semibold text-[#002c5f] ring-1 ring-slate-200 transition hover:bg-slate-50 hover:ring-[#002c5f]/40"
    >
      {children}
    </motion.button>
  );
}

function SuccessBubble() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex">
      <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-emerald-50 px-4 py-3 ring-1 ring-emerald-200">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <div>
            <p className="text-sm font-bold text-slate-900">Done!</p>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{RESPONSE_PROMISE}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function PhoneCaptureForm({
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
      setError("Please enter a valid phone number (at least 10 digits).");
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
        className="w-full max-w-[92%] space-y-2.5 rounded-2xl rounded-bl-md bg-slate-100 p-3.5"
      >
        <p className="text-sm font-semibold text-slate-800">
          Best number for a quick call or text?
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
          className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition focus:border-[#002c5f] focus:ring-2 focus:ring-[#002c5f]/20"
        />
        <label className="flex cursor-pointer items-start gap-2 py-1">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 accent-[#002c5f]"
          />
          <span className="text-[11px] leading-snug text-slate-500">{CONSENT_TEXT}</span>
        </label>
        {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={!consent || sending}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#002c5f] text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {sending ? (
            "Sending..."
          ) : (
            <>
              <Send className="h-4 w-4" /> Send my number
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}

/* -------------------------------------- main widget -------------------------------------- */

export function ChatWidget() {
  const [open, setOpen] = useState(false);
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
  const [chips, setChips] = useState<ChipSet>({ kind: "root" });
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

  // Escape closes the panel.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Keep the newest bubble in view.
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing, chips]);

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

  const sendUser = (text: string) =>
    setMessages((prev) => [...prev, { id: nextId(), kind: "user", text }]);

  /** Show the typing dots briefly, then append the scripted reply and next chip set. */
  const replyAfterTyping = (make: () => Msg[], nextChips: ChipSet) => {
    setChips({ kind: "none" });
    setTyping(true);
    const t = window.setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [...prev, ...make()]);
      setChips(nextChips);
    }, TYPING_MS);
    timersRef.current.push(t);
  };

  const startFlow = (flow: FlowId, label: string) => {
    sendUser(label);
    if (flow === "availability") {
      replyAfterTyping(() => [asst("Absolutely — which one are you looking at?")], {
        kind: "vehicles",
        flow,
      });
    } else if (flow === "test_drive") {
      replyAfterTyping(() => [asst("Pick the car and we'll have it warmed up out front.")], {
        kind: "vehicles",
        flow,
      });
    } else if (flow === "financing") {
      replyAfterTyping(
        () => [
          asst(FINANCING_REPLY),
          formMsg({ message: "Chat: financing question (imperfect credit)" }),
        ],
        { kind: "none" },
      );
    } else {
      replyAfterTyping(
        () => [asst(TRADE_REPLY), formMsg({ message: "Chat: trade-in valuation request" })],
        { kind: "none" },
      );
    }
  };

  const pickVehicle = (flow: FlowId, v: Vehicle) => {
    const name = vehicleName(v);
    sendUser(name);
    if (flow === "test_drive") {
      replyAfterTyping(
        () => [
          formMsg({
            vehicle: v,
            leadType: "test_drive",
            message: `Chat: test drive request for ${name}`,
          }),
        ],
        { kind: "none" },
      );
    } else {
      replyAfterTyping(
        () => [
          asst(
            "Good news — it's in stock as of today. Want me to have a specialist confirm and hold it for you?",
          ),
          formMsg({ vehicle: v, message: `Chat: availability check + hold request for ${name}` }),
        ],
        { kind: "none" },
      );
    }
  };

  const handleCaptured = (formId: number, phone: string) => {
    setMessages((prev) => [
      ...prev.filter((m) => m.id !== formId),
      { id: nextId(), kind: "user", text: phone },
      { id: nextId(), kind: "success" },
    ]);
    setChips({ kind: "root" });
  };

  return (
    <>
      {/* Launcher + desktop teaser pill */}
      <div className="fixed bottom-24 right-4 z-[60] flex items-center gap-3 sm:bottom-6">
        <AnimatePresence>
          {!open && !labelDismissed && (
            <motion.div
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              className="hidden items-center gap-1.5 rounded-full bg-white py-1.5 pl-4 pr-1.5 shadow-lg ring-1 ring-slate-200 sm:flex"
            >
              <span className="text-[13px] font-semibold text-slate-700">
                Questions? We answer fast
              </span>
              <button
                type="button"
                onClick={dismissLabel}
                aria-label="Dismiss chat prompt"
                className="grid h-7 w-7 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button
          type="button"
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => {
            if (open) {
              setOpen(false);
            } else {
              setOpen(true);
              dismissLabel();
            }
          }}
          aria-label={open ? "Close chat" : "Chat with AM Ford"}
          className="grid h-14 w-14 place-items-center rounded-full bg-[#002c5f] text-white shadow-xl shadow-slate-900/25"
        >
          {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        </motion.button>
      </div>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Chat with AM Ford"
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="fixed bottom-24 right-4 z-[70] flex h-[min(28rem,calc(100dvh-8rem))] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200 sm:bottom-24"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-[#002c5f] to-[#0a4a8f] px-5 py-4">
              <div>
                <p className="text-sm font-bold text-white">AM Ford</p>
                <p className="flex items-center gap-1.5 text-xs text-white/70">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  Typically replies in minutes
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="grid h-10 w-10 place-items-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Conversation */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((m) => {
                if (m.kind === "form") {
                  return (
                    <PhoneCaptureForm
                      key={m.id}
                      ctx={m.ctx}
                      onCaptured={(phone) => handleCaptured(m.id, phone)}
                    />
                  );
                }
                if (m.kind === "success") return <SuccessBubble key={m.id} />;
                return (
                  <Bubble key={m.id} role={m.kind}>
                    {m.text}
                  </Bubble>
                );
              })}

              {typing && <TypingDots />}

              {!typing && chips.kind === "root" && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {ROOT_CHIPS.map((c) => (
                    <Chip key={c.flow} onClick={() => startFlow(c.flow, c.label)}>
                      {c.label}
                    </Chip>
                  ))}
                </div>
              )}
              {!typing && chips.kind === "vehicles" && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {vehicles.map((v) => (
                    <Chip key={v.id} onClick={() => pickVehicle(chips.flow, v)}>
                      {vehicleName(v)}
                    </Chip>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
