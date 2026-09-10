import { useState, useRef, useEffect, KeyboardEvent } from "react";
import {
  PRIVACY_POLICY_URL,
  SMS_CONSENT_DISCLOSURE,
  SMS_MARKETING_CONSENT_DISCLOSURE,
  SMS_TRANSACTIONAL_CONSENT_DISCLOSURE,
  TERMS_CONSENT_DISCLOSURE,
  TERMS_OF_USE_URL,
} from "@/lib/smsConsent";
import { submitLeadInquiry } from "@/lib/supabase";

interface UserData {
  firstName: string;
  lastName: string;
  preferredContact: string;
  phone: string;
  email: string;
  comments: string;
  verifiedAt: string;
  smsConsentChecked?: boolean;
  smsConsentText?: string;
  smsConsentAt?: string | null;
  termsConsentChecked?: boolean;
  termsConsentText?: string;
  termsConsentAt?: string | null;
  name?: string;
}

interface CarData {
  title: string;
  price: string;
  vin: string;
  stock: string;
  source: string;
  pageUrl: string;
  vehicleSnapshot?: Record<string, unknown> | null;
}

export interface OTPVerifySuccessPayload {
  user: UserData;
  car: CarData;
}

function pickSnapshotStr(snap: Record<string, unknown> | null | undefined, keys: string[]): string {
  if (!snap) return "";
  for (const k of keys) {
    const v = snap[k];
    if (v != null && String(v).trim() !== "") return String(v).trim();
  }
  return "";
}

function formatListPrice(raw: string): string {
  if (!raw) return "";
  const n = Number(String(raw).replace(/[^\d.]/g, ""));
  if (!Number.isFinite(n) || n <= 0) return raw.trim();
  return n.toLocaleString("en-US");
}

function buildMileageLabel(raw: string): string {
  if (!raw) return "";
  const s = raw.trim();
  if (/mile/i.test(s)) return s;
  if (/^\d[\d,]*$/.test(s)) return `${Number(s.replace(/,/g, "")).toLocaleString("en-US")} miles`;
  return s;
}

type SidebarStep = "form" | "otp" | "success";

function VehicleSidebarPanel({ carData, step }: { carData: CarData; step: SidebarStep }) {
  return (
    <div className="otp-sidebar">
      <div className="otp-sidebar-inner">
        <div style={{ marginBottom: 16, textAlign: "center" }}>
          <div
            style={{
              background: "#fff",
              padding: "8px 16px",
              borderRadius: 6,
              display: "inline-block",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <img
              src="https://di-uploads-development.dealerinspire.com/amford/uploads/2025/08/Am-ford.png"
              alt="AM Ford"
              style={{
                height: 38,
                width: "auto",
                objectFit: "contain",
                display: "block",
              }}
            />
          </div>
        </div>

        <h2
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: "#fff",
            marginBottom: 8,
            lineHeight: 1.25,
            letterSpacing: "-0.01em",
          }}
        >
          {carData.source?.toLowerCase().includes("discount")
            ? "Request Extra Discount & Pricing"
            : "Unlock Your Instant Price"}
        </h2>

        <p
          style={{
            fontSize: 12.5,
            color: "#ffffffcc",
            marginBottom: 0,
            lineHeight: 1.45,
          }}
        >
          {carData.source?.toLowerCase().includes("discount")
            ? "Inquire directly with AM Ford for unadvertised manager incentives, extra discounts, and vehicle availability."
            : "Please provide your contact information to reveal this vehicle's Instant Price"}
        </p>

        {carData.title && (
          <div
            style={{
              marginTop: 16,
              padding: "12px 14px",
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: 6,
              border: "1px solid rgba(255, 255, 255, 0.18)",
              color: "#fff",
            }}
          >
            <div
              style={{
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontWeight: 700,
                color: "#ffffffaa",
              }}
            >
              Selected Vehicle
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, marginTop: 3 }}>{carData.title}</div>
            {carData.price && (
              <div style={{ fontSize: 17, fontWeight: 800, color: "#ffd633", marginTop: 3 }}>
                ${formatListPrice(carData.price)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface OTPPopupProps {
  onSuccess?: (data: OTPVerifySuccessPayload) => void;
  onClose?: () => void;
  initialCarData?: Partial<CarData>;
}

type Step = "form" | "otp" | "success";

function formatE164(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  return "+" + digits;
}

const BRAND = "#05214F";
const BRAND_LIGHT = "#e8edf5";

export default function OTPPopup({ onSuccess, onClose, initialCarData }: OTPPopupProps) {
  const [step, setStep] = useState<Step>("form");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [preferredContact, setPreferredContact] = useState("Text");
  const [phone, setPhone] = useState("+1");
  const [email, setEmail] = useState("");
  const [comments, setComments] = useState("");
  const [smsConsent, setSmsConsent] = useState(false);
  const [cleanPhone, setCleanPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [invalidFields, setInvalidFields] = useState<string[]>([]);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [carData, setCarData] = useState<CarData>({
    title: initialCarData?.title || "2025 Ford Vehicle",
    price: initialCarData?.price || "",
    vin: initialCarData?.vin || "",
    stock: initialCarData?.stock || "",
    source: initialCarData?.source || "VDP",
    pageUrl: initialCarData?.pageUrl || (typeof window !== "undefined" ? window.location.href : ""),
  });

  useEffect(() => {
    if (initialCarData) {
      setCarData((prev) => ({ ...prev, ...initialCarData }));
    }
  }, [initialCarData]);

  const handleSendOTP = async () => {
    setError("");
    setInvalidFields([]);

    const errors: string[] = [];
    if (!firstName.trim()) errors.push("firstName");
    if (phone.length < 12) errors.push("phone");

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push("email");
    }

    if (!smsConsent) errors.push("consent");

    if (errors.length > 0) {
      setInvalidFields(errors);
      setTimeout(() => setInvalidFields([]), 410);
      if (!smsConsent) setError("Please tick the consent box so we can send your price.");
      return;
    }

    setLoading(true);
    try {
      const cPhone = formatE164(phone);
      setCleanPhone(cPhone);

      const res = await submitLeadInquiry({
        lead_type: "quote_request",
        full_name: `${firstName} ${lastName}`.trim(),
        email: email,
        phone: cPhone,
        message: `Unlocked Instant Price for ${carData.title}. Preferred contact: ${preferredContact}. ${comments} [SMS/call consent granted ${new Date().toISOString()}]`,
      });

      if (res.success) {
        const userData: UserData = {
          firstName,
          lastName,
          preferredContact,
          phone: cPhone,
          email,
          comments,
          verifiedAt: new Date().toISOString(),
          smsConsentChecked: true,
          smsConsentText: SMS_CONSENT_DISCLOSURE,
          smsConsentAt: new Date().toISOString(),
        };

        setStep("success");
        onSuccess?.({ user: userData, car: carData });
      } else {
        setError(res.message);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field: string): React.CSSProperties => {
    const isInvalid = invalidFields.includes(field);
    return {
      width: "100%",
      padding: "10px 12px",
      border: isInvalid
        ? "2px solid #dc2626"
        : `1.5px solid ${focusedField === field ? BRAND : "#d1d5db"}`,
      borderRadius: 6,
      fontSize: 16,
      color: "#111827",
      outline: "none",
      background: "#fff",
      boxShadow: focusedField === field ? `0 0 0 3px ${BRAND}22` : "none",
      fontFamily: "inherit",
    };
  };

  return (
    <div className="otp-overlay">
      <div className="otp-card" style={{ pointerEvents: "auto" }}>
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="otp-close-btn"
            aria-label="Close popup"
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              background: "rgba(255,255,255,0.9)",
              border: "none",
              borderRadius: "50%",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 10,
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              transition: "none",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#374151"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}

        {/* ── STEP 1: Form ── */}
        {step === "form" && (
          <div className="otp-flex-container">
            <VehicleSidebarPanel carData={carData} step="form" />

            {/* Right Panel - Form */}
            <div className="otp-form-panel">
              <div className="otp-input-grid">
                {/* First Name */}
                <div className="otp-name-field">
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#374151",
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    First Name <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input
                    className={invalidFields.includes("firstName") ? "field-error" : ""}
                    style={inputStyle("firstName")}
                    type="text"
                    placeholder=""
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      if (invalidFields.includes("firstName"))
                        setInvalidFields(invalidFields.filter((f) => f !== "firstName"));
                    }}
                    onFocus={() => setFocusedField("firstName")}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>

                {/* Last Name */}
                <div className="otp-name-field">
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#374151",
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    Last Name
                  </label>
                  <input
                    className={invalidFields.includes("lastName") ? "field-error" : ""}
                    style={inputStyle("lastName")}
                    type="text"
                    placeholder=""
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      if (invalidFields.includes("lastName"))
                        setInvalidFields(invalidFields.filter((f) => f !== "lastName"));
                    }}
                    onFocus={() => setFocusedField("lastName")}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>

                {/* Preferred Contact */}
                <div className="otp-contact-field">
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#374151",
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    Preferred Contact
                  </label>
                  <select
                    className={invalidFields.includes("preferredContact") ? "field-error" : ""}
                    style={{
                      ...inputStyle("preferredContact"),
                      cursor: "pointer",
                      appearance: "auto",
                    }}
                    value={preferredContact}
                    onChange={(e) => setPreferredContact(e.target.value)}
                    onFocus={() => setFocusedField("preferredContact")}
                    onBlur={() => setFocusedField(null)}
                  >
                    <option>Text</option>
                    <option>Call</option>
                    <option>Email</option>
                  </select>
                </div>

                {/* Phone */}
                <div className="otp-phone-field">
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#374151",
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    Phone <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input
                    className={invalidFields.includes("phone") ? "field-error" : ""}
                    style={inputStyle("phone")}
                    type="tel"
                    placeholder=""
                    value={phone}
                    onChange={(e) => {
                      let val = e.target.value;
                      if (!val.startsWith("+1")) {
                        val = "+1" + val.replace(/\D/g, "");
                      }
                      const digits = val.slice(2).replace(/\D/g, "").slice(0, 10);
                      setPhone("+1" + digits);
                      if (invalidFields.includes("phone"))
                        setInvalidFields(invalidFields.filter((f) => f !== "phone"));
                    }}
                    onFocus={() => setFocusedField("phone")}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#374151",
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    Email
                  </label>
                  <input
                    className={invalidFields.includes("email") ? "field-error" : ""}
                    style={inputStyle("email")}
                    type="email"
                    placeholder=""
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (invalidFields.includes("email"))
                        setInvalidFields(invalidFields.filter((f) => f !== "email"));
                    }}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>

                {/* Comments */}
                <div>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#374151",
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    Comments
                  </label>
                  <input
                    style={inputStyle("comments")}
                    type="text"
                    placeholder="Any additional info..."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    onFocus={() => setFocusedField("comments")}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>
              </div>

              {error && (
                <div
                  style={{
                    marginTop: 16,
                    padding: "10px 14px",
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: 6,
                    color: "#dc2626",
                    fontSize: 13,
                  }}
                >
                  {error}
                </div>
              )}

              <div className="sms-consent-group" style={{ marginTop: 16 }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    cursor: "pointer",
                    padding: "10px 12px",
                    borderRadius: 6,
                    background: "#f8fafc",
                    border: invalidFields.includes("consent")
                      ? "1.5px solid #dc2626"
                      : "1px solid #e2e8f0",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={smsConsent}
                    onChange={(e) => setSmsConsent(e.target.checked)}
                    style={{ marginTop: 2.5, width: 16, height: 16, accentColor: BRAND }}
                  />
                  <span
                    className="sms-consent-copy"
                    style={{ color: "#475569", textAlign: "left", fontSize: 11, lineHeight: 1.45 }}
                  >
                    {SMS_CONSENT_DISCLOSURE}{" "}
                    <a href={TERMS_OF_USE_URL} target="_blank" rel="noopener noreferrer" style={{ color: BRAND, fontWeight: 600, textDecoration: "underline" }}>
                      Terms of use
                    </a>
                  </span>
                </label>
              </div>

              <button
                onClick={handleSendOTP}
                disabled={loading}
                style={{
                  marginTop: 24,
                  width: "100%",
                  padding: "13px 0",
                  background: loading ? "#94a3b8" : BRAND,
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  letterSpacing: "0.01em",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                }}
              >
                {loading ? (
                  "Please wait"
                ) : (
                  <>
                    {carData.source?.toLowerCase().includes("discount")
                      ? "Claim Extra Discount"
                      : "Unlock Instant Price"}
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Success ── */}
        {step === "success" && (
          <div className="otp-flex-container">
            <VehicleSidebarPanel carData={carData} step="success" />
            <div
              className="otp-form-panel otp-form-panel--narrow-flow"
              style={{ paddingTop: 44, paddingBottom: 44, textAlign: "center" }}
            >
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  background: "#f0fdf4",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                  border: "1.5px solid #86efac",
                }}
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#0f172a",
                  marginBottom: 6,
                  letterSpacing: "-0.02em",
                }}
              >
                Request Received!
              </h2>
              <p
                style={{
                  fontSize: 14,
                  color: "#64748b",
                  marginBottom: 24,
                  lineHeight: 1.55,
                  maxWidth: 400,
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                Thanks, <strong style={{ color: "#0f172a" }}>{`${firstName} ${lastName}`.trim()}</strong> — our team is preparing your custom pricing now. Expect a call or text shortly during business hours.
              </p>

              {/* Clean structured inquiry summary (No generic emojis) */}
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 12,
                  padding: "16px 20px",
                  textAlign: "left",
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: "14px 16px",
                  maxWidth: 400,
                  marginLeft: "auto",
                  marginRight: "auto",
                  width: "100%",
                }}
              >
                <div>
                  <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Name
                  </div>
                  <div style={{ fontSize: 13, color: "#0f172a", fontWeight: 600, marginTop: 2, wordBreak: "break-word" }}>
                    {`${firstName} ${lastName}`.trim() || "—"}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Phone
                  </div>
                  <div style={{ fontSize: 13, color: "#0f172a", fontWeight: 600, marginTop: 2 }}>
                    {cleanPhone || phone || "—"}
                  </div>
                </div>

                <div style={{ gridColumn: "span 2" }}>
                  <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Email
                  </div>
                  <div style={{ fontSize: 13, color: "#0f172a", fontWeight: 600, marginTop: 2, wordBreak: "break-all" }}>
                    {email || "—"}
                  </div>
                </div>

                <div style={{ gridColumn: "span 2" }}>
                  <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Preferred Contact
                  </div>
                  <div style={{ fontSize: 13, color: "#0f172a", fontWeight: 600, marginTop: 2 }}>
                    {preferredContact === "Text" ? "Text Message (SMS)" : preferredContact === "Call" ? "Phone Call" : "Email / Any"}
                  </div>
                </div>
              </div>

              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    marginTop: 20,
                    width: "100%",
                    maxWidth: 400,
                    marginLeft: "auto",
                    marginRight: "auto",
                    display: "block",
                    padding: "12px 0",
                    background: BRAND,
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "opacity 0.2s ease",
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.92")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
                >
                  Done
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
