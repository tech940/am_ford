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
        <div style={{ marginBottom: 20, textAlign: "center" }}>
          <div
            style={{
              background: "#fff",
              padding: "10px 20px",
              borderRadius: 8,
              display: "inline-block",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <img
              src="https://di-uploads-development.dealerinspire.com/amford/uploads/2025/08/Am-ford.png"
              alt="AM Ford"
              style={{
                height: 48,
                width: "auto",
                objectFit: "contain",
                display: "block",
              }}
            />
          </div>
        </div>

        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "#fff",
            marginBottom: 12,
            fontStyle: "italic",
            lineHeight: 1.2,
          }}
        >
          Unlock Your Instant Price
        </h2>

        <p
          style={{
            fontSize: 13,
            color: "#ffffffcc",
            marginBottom: 0,
            lineHeight: 1.5,
          }}
        >
          Please provide your contact information to reveal this vehicle's Instant Price
        </p>

        {carData.title && (
          <div
            style={{
              marginTop: 24,
              padding: 16,
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: 8,
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "#fff",
            }}
          >
            <div
              style={{
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "#ffffffaa",
              }}
            >
              Selected Vehicle
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>{carData.title}</div>
            {carData.price && (
              <div style={{ fontSize: 18, fontWeight: 800, color: "#ffd633", marginTop: 4 }}>
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

              <div className="sms-consent-group">
                <label
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    cursor: "pointer",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: invalidFields.includes("consent")
                      ? "1px solid #dc2626"
                      : "1px solid rgba(255,255,255,0.25)",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={smsConsent}
                    onChange={(e) => setSmsConsent(e.target.checked)}
                    style={{ marginTop: 3, width: 16, height: 16, accentColor: "#ffd633" }}
                  />
                  <span
                    className="sms-consent-copy"
                    style={{ color: "#d1d5db", textAlign: "left" }}
                  >
                    {SMS_CONSENT_DISCLOSURE}{" "}
                    <a href={TERMS_OF_USE_URL} target="_blank" rel="noopener noreferrer">
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
                    Unlock Instant Price
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
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: "#f0fdf4",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 24px",
                  border: "3px solid #bbf7d0",
                }}
              >
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="2.5"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <h2
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: "#111827",
                  marginBottom: 8,
                  fontStyle: "italic",
                }}
              >
                Request Received!
              </h2>
              <p
                style={{
                  fontSize: 14,
                  color: "#6b7280",
                  marginBottom: 28,
                  lineHeight: 1.6,
                  maxWidth: 420,
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                Thanks,{" "}
                <strong style={{ color: "#111827" }}>{`${firstName} ${lastName}`.trim()}</strong> —
                a specialist is preparing your price now. Expect a call or text within 15 minutes
                during business hours.
              </p>
              <div
                style={{
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  padding: "20px 24px",
                  textAlign: "left",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  maxWidth: 420,
                  marginLeft: "auto",
                  marginRight: "auto",
                  width: "100%",
                }}
              >
                {[
                  { icon: "👤", label: "Name", value: `${firstName} ${lastName}`.trim() },
                  { icon: "📧", label: "Email", value: email },
                  { icon: "📱", label: "Phone", value: cleanPhone },
                  { icon: "💬", label: "Preferred", value: preferredContact },
                ].map(({ icon, label, value }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 18 }}>{icon}</span>
                    <div>
                      <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>{label}</div>
                      <div style={{ fontSize: 14, color: "#111827", fontWeight: 500 }}>{value}</div>
                    </div>
                  </div>
                ))}
              </div>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    marginTop: 24,
                    width: "100%",
                    maxWidth: 420,
                    marginLeft: "auto",
                    marginRight: "auto",
                    display: "block",
                    padding: "13px 0",
                    background: BRAND,
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
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
