import { useState, useEffect, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Users,
  Car,
  Search,
  RefreshCw,
  Download,
  Lock,
  LogOut,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
} from "lucide-react";
import { fetchAllLeads, updateLeadStatus, deleteLead, type DbLead } from "@/lib/supabase";
import { vehicles, type Vehicle, vehicleSlug } from "@/lib/vehicles";
import { cn } from "@/lib/utils";

// Route definition with strict noindex for privacy and search hygiene
export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "AM Ford Management Portal | Admin Dashboard" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

const DEFAULT_ADMIN_PASS = "amford2026";
const AUTH_STORAGE_KEY = "am_ford_admin_auth_v1";

type TabMode = "leads" | "inventory";

function AdminPage() {
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passInput, setPassInput] = useState("");
  const [authError, setAuthError] = useState("");

  // Dashboard state
  const [activeTab, setActiveTab] = useState<TabMode>("leads");
  const [leads, setLeads] = useState<DbLead[]>([]);
  const [loading, setLoading] = useState(false);
  const [leadSearch, setLeadSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  // Selected lead modal/detail view
  const [selectedLead, setSelectedLead] = useState<DbLead | null>(null);

  // Inventory search & filter state
  const [inventorySearch, setInventorySearch] = useState("");
  const [conditionFilter, setConditionFilter] = useState("All");

  // Check auth session — also marks the component as client-mounted to prevent
  // SSR hydration mismatches (sessionStorage doesn't exist on the server)
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (stored === "true") {
        setIsAuthenticated(true);
      }
    } catch {
      // ignore storage access restrictions
    }
    setMounted(true);
  }, []);

  // Prevent SSR from rendering the full admin UI (avoids hydration mismatch
  // that causes broken vehicle thumbnails to flash on the leads tab)
  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="text-sm font-semibold text-slate-400">Loading admin…</div>
      </div>
    );
  }

  // Fetch leads on authenticated load
  const loadLeads = async () => {
    setLoading(true);
    try {
      const data = await fetchAllLeads();
      setLeads(data);
    } catch (err) {
      console.error("Failed to load leads", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadLeads();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passInput.trim() === DEFAULT_ADMIN_PASS) {
      setIsAuthenticated(true);
      sessionStorage.setItem(AUTH_STORAGE_KEY, "true");
      setAuthError("");
    } else {
      setAuthError("Invalid access key. Please try again.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    // optimistic update
    setLeads((prev) =>
      prev.map((item) => (item.id === leadId ? { ...item, status: newStatus } : item)),
    );
    if (selectedLead?.id === leadId) {
      setSelectedLead((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    await updateLeadStatus(leadId, newStatus);
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!window.confirm("Are you sure you want to delete this lead record?")) return;
    setLeads((prev) => prev.filter((item) => item.id !== leadId));
    if (selectedLead?.id === leadId) setSelectedLead(null);
    await deleteLead(leadId);
  };

  // Export CSV
  const exportCsv = () => {
    const headers = [
      "Date",
      "Customer Name",
      "Phone",
      "Email",
      "Inquiry Type",
      "Vehicle / Title",
      "Status",
      "Message",
    ];
    const rows = filteredLeads.map((l) => [
      new Date(l.created_at).toLocaleString("en-US"),
      `"${(l.customer_name || "").replace(/"/g, '""')}"`,
      `"${(l.customer_phone || "").replace(/"/g, '""')}"`,
      `"${(l.customer_email || "").replace(/"/g, '""')}"`,
      `"${(l.inquiry_type || "").replace(/"/g, '""')}"`,
      `"${(l.listing_title || "").replace(/"/g, '""')}"`,
      `"${(l.status || "").replace(/"/g, '""')}"`,
      `"${(l.message || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `am_ford_leads_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((item) => {
      if (statusFilter !== "All" && item.status !== statusFilter) return false;
      if (typeFilter !== "All" && item.inquiry_type !== typeFilter) return false;
      if (leadSearch.trim()) {
        const q = leadSearch.toLowerCase();
        const text =
          `${item.customer_name} ${item.customer_phone} ${item.customer_email} ${item.listing_title} ${item.message}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [leads, statusFilter, typeFilter, leadSearch]);

  // Filtered Inventory
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v: Vehicle) => {
      if (conditionFilter !== "All" && v.condition !== conditionFilter) return false;
      if (inventorySearch.trim()) {
        const q = inventorySearch.toLowerCase();
        const text =
          `${v.year} ${v.make} ${v.model} ${v.trim} ${v.vin || ""} ${v.stockNumber || ""} ${v.type}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [conditionFilter, inventorySearch]);

  // Lead metrics
  const newLeadsCount = useMemo(() => leads.filter((l) => l.status === "New").length, [leads]);
  const contactedCount = useMemo(() => leads.filter((l) => l.status === "Contacted").length, [leads]);
  const scheduledCount = useMemo(() => leads.filter((l) => l.status === "Scheduled").length, [leads]);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl border border-slate-200">
          <div className="text-center">
            <img
              src="/am-ford-logo.png"
              alt="AM Ford"
              className="mx-auto h-9 w-auto object-contain"
            />
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
              <Lock className="h-3.5 w-3.5 text-[#002c5f]" /> Staff Portal Access
            </div>
            <h1 className="mt-2 text-xl font-bold text-slate-900">Sign in to Admin Dashboard</h1>
            <p className="mt-1 text-xs text-slate-500">
              Enter your dealership master key to view inquiries and manage inventory.
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Access Passcode
              </label>
              <input
                type="password"
                value={passInput}
                onChange={(e) => setPassInput(e.target.value)}
                placeholder="Enter password..."
                autoFocus
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-900 outline-none transition focus:border-[#002c5f] focus:ring-2 focus:ring-[#002c5f]/20"
              />
            </div>

            {authError && (
              <div className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700 border border-red-200 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-[#002c5f] py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-[#001f44] active:scale-95"
            >
              Sign In to Dashboard
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-4 text-center">
            <Link to="/" className="text-xs font-bold text-[#002c5f] hover:underline">
              ← Return to public website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* Admin Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            <Link to="/" target="_blank" className="flex items-center gap-2">
              <img
                src="/am-ford-logo.png"
                alt="AM Ford"
                className="h-8 w-auto object-contain"
              />
            </Link>
            <span className="hidden h-5 w-px bg-slate-200 sm:inline-block" />
            <span className="hidden rounded-md bg-[#002c5f]/10 px-2 py-0.5 text-xs font-bold text-[#002c5f] sm:inline-block">
              Admin Control Center
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setActiveTab("leads")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition",
                  activeTab === "leads"
                    ? "bg-[#002c5f] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900",
                )}
              >
                <Users className="h-3.5 w-3.5" />
                <span>Leads ({leads.length})</span>
                {newLeadsCount > 0 && (
                  <span className="rounded-full bg-red-500 px-1.5 py-0.2 text-[10px] text-white font-black">
                    {newLeadsCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("inventory")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition",
                  activeTab === "inventory"
                    ? "bg-[#002c5f] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900",
                )}
              >
                <Car className="h-3.5 w-3.5" />
                <span>Inventory ({vehicles.length})</span>
              </button>
            </div>

            <Link
              to="/"
              target="_blank"
              className="hidden items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 md:inline-flex"
            >
              <span>View Site</span>
              <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-red-600 shadow-2xs hover:bg-red-50"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {activeTab === "leads" ? (
          <div>
            {/* KPI Metric Cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 mb-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Total Inquiries
                </span>
                <div className="mt-1 text-2xl font-black text-slate-900">{leads.length}</div>
                <span className="text-xs text-slate-400 font-medium">All capture sources</span>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  New Actionable
                </span>
                <div className="mt-1 text-2xl font-black text-emerald-700">{newLeadsCount}</div>
                <span className="text-xs text-emerald-600 font-medium">Awaiting response</span>
              </div>
              <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800">
                  Contacted
                </span>
                <div className="mt-1 text-2xl font-black text-blue-700">{contactedCount}</div>
                <span className="text-xs text-blue-600 font-medium">In conversation</span>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                  Scheduled / Appt
                </span>
                <div className="mt-1 text-2xl font-black text-amber-700">{scheduledCount}</div>
                <span className="text-xs text-amber-600 font-medium">Test drive booked</span>
              </div>
            </div>

            {/* Filter & Action Bar */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
              <div className="flex flex-1 items-center gap-2">
                <div className="relative flex-1 min-w-[200px] max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={leadSearch}
                    onChange={(e) => setLeadSearch(e.target.value)}
                    placeholder="Search name, phone, email, vehicle..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs font-medium text-slate-900 outline-none focus:border-[#002c5f] focus:bg-white"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-[#002c5f]"
                >
                  <option value="All">All Statuses</option>
                  <option value="New">New Only</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Closed">Closed</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="hidden sm:inline-block rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-[#002c5f]"
                >
                  <option value="All">All Types</option>
                  <option value="Quote Request">Quote Request</option>
                  <option value="Test Drive">Test Drive</option>
                  <option value="Financing Pre-Approval">Financing</option>
                  <option value="Special Order">Special Order</option>
                  <option value="Stay Updated (VIP Offers)">Stay Updated (VIP Offers)</option>
                  <option value="General Contact">General Contact</option>
                </select>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={loadLeads}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                  title="Refresh leads list"
                >
                  <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={exportCsv}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#002c5f] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#001f44]"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Leads Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Received</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Contact</th>
                      <th className="px-4 py-3">Inquiry Type</th>
                      <th className="px-4 py-3">Vehicle / Focus</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLeads.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                          {loading ? "Loading leads from Supabase..." : "No leads found matching current filter criteria."}
                        </td>
                      </tr>
                    ) : (
                      filteredLeads.map((lead) => {
                        const dateStr = new Date(lead.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        });

                        return (
                          <tr
                            key={lead.id}
                            className="transition hover:bg-slate-50/80 cursor-pointer"
                            onClick={() => setSelectedLead(lead)}
                          >
                            <td className="whitespace-nowrap px-4 py-3.5 font-medium text-slate-500">
                              {dateStr}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3.5">
                              <div className="font-bold text-slate-900">{lead.customer_name}</div>
                              {lead.consent && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 font-semibold">
                                  <CheckCircle2 className="h-3 w-3" /> TCPA Consented
                                </span>
                              )}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3.5">
                              <div className="font-semibold text-slate-800">
                                <a
                                  href={`tel:${lead.customer_phone}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="hover:text-[#002c5f] hover:underline"
                                >
                                  {lead.customer_phone}
                                </a>
                              </div>
                              {lead.customer_email && (
                                <div className="text-[11px] text-slate-500">
                                  <a
                                    href={`mailto:${lead.customer_email}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="hover:underline"
                                  >
                                    {lead.customer_email}
                                  </a>
                                </div>
                              )}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3.5 font-semibold text-slate-700">
                              {lead.inquiry_type || "—"}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3.5 max-w-[200px] truncate text-slate-700">
                              {lead.listing_title || "Direct inquiry"}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                              <select
                                value={lead.status || "New"}
                                onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                                className={cn(
                                  "rounded-lg px-2.5 py-1 text-xs font-bold border transition outline-none",
                                  lead.status === "New" && "bg-red-50 text-red-700 border-red-200",
                                  lead.status === "Contacted" && "bg-blue-50 text-blue-700 border-blue-200",
                                  lead.status === "Scheduled" && "bg-amber-50 text-amber-800 border-amber-200",
                                  lead.status === "Closed" && "bg-slate-100 text-slate-600 border-slate-300",
                                )}
                              >
                                <option value="New">New</option>
                                <option value="Contacted">Contacted</option>
                                <option value="Scheduled">Scheduled</option>
                                <option value="Closed">Closed</option>
                              </select>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setSelectedLead(lead)}
                                  className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                                  title="View full details"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteLead(lead.id)}
                                  className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-red-600 hover:bg-red-50"
                                  title="Delete lead"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Inventory Overview */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
              <div className="flex flex-1 items-center gap-2">
                <div className="relative flex-1 min-w-[200px] max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                    placeholder="Search model, VIN, stock number..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs font-medium text-slate-900 outline-none focus:border-[#002c5f] focus:bg-white"
                  />
                </div>

                <select
                  value={conditionFilter}
                  onChange={(e) => setConditionFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-[#002c5f]"
                >
                  <option value="All">All Conditions</option>
                  <option value="New">New Vehicles</option>
                  <option value="Used">Used Vehicles</option>
                  <option value="Certified Pre-Owned">Certified Pre-Owned</option>
                </select>
              </div>

              <div className="text-xs font-semibold text-slate-600">
                Showing <strong className="text-slate-900">{filteredVehicles.length}</strong> of{" "}
                {vehicles.length} units
              </div>
            </div>

            {/* Inventory Cards Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredVehicles.map((v: Vehicle) => (
                <div
                  key={v.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition hover:shadow-md flex flex-col"
                >
                  <div className="relative aspect-[16/9] w-full bg-slate-950 overflow-hidden">
                    <img
                      src={v.image}
                      alt={`${v.year} ${v.make} ${v.model}`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute top-2 left-2 flex gap-1">
                      <span className="rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-bold text-slate-900 backdrop-blur-xs">
                        {v.condition}
                      </span>
                      <span className="rounded-md bg-[#002c5f]/90 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                        {v.type}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-slate-900 text-sm">
                          {v.year} {v.make} {v.model}{" "}
                          <span className="text-slate-500 font-medium">{v.trim}</span>
                        </h3>
                        <span className="text-sm font-black text-[#002c5f]">
                          ${v.price.toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-medium text-slate-500">
                        <span>{v.miles < 100 ? "Delivery miles" : `${v.miles.toLocaleString()} mi`}</span>
                        <span>•</span>
                        <span>{v.drivetrain}</span>
                        <span>•</span>
                        <span>{v.fuel}</span>
                      </div>
                      {v.vin && (
                        <div className="mt-2 text-[10px] font-mono text-slate-400">
                          VIN: {v.vin}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">ID: {v.id}</span>
                      <Link
                        to="/vehicle/$id"
                        params={{ id: vehicleSlug(v) }}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#002c5f] hover:underline"
                      >
                        <span>View VDP</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Selected Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-[#002c5f] uppercase tracking-wider">
                  {selectedLead.inquiry_type || "Customer Inquiry"}
                </span>
                <h2 className="mt-1 text-lg font-bold text-slate-900">
                  {selectedLead.customer_name}
                </h2>
                <div className="text-xs text-slate-400">
                  Received: {new Date(selectedLead.created_at).toLocaleString("en-US")}
                </div>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <div className="font-semibold text-slate-400 uppercase text-[10px]">Phone</div>
                  <a
                    href={`tel:${selectedLead.customer_phone}`}
                    className="font-bold text-[#002c5f] hover:underline text-sm"
                  >
                    {selectedLead.customer_phone}
                  </a>
                </div>
                <div>
                  <div className="font-semibold text-slate-400 uppercase text-[10px]">Email</div>
                  <a
                    href={`mailto:${selectedLead.customer_email}`}
                    className="font-bold text-slate-800 hover:underline"
                  >
                    {selectedLead.customer_email || "Not provided"}
                  </a>
                </div>
              </div>

              {selectedLead.listing_title && (
                <div>
                  <div className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                    Vehicle of Interest
                  </div>
                  <div className="mt-0.5 font-bold text-slate-900 text-sm">
                    {selectedLead.listing_title}
                  </div>
                </div>
              )}

              <div>
                <div className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                  Customer Message / Specifications
                </div>
                <div className="mt-1 rounded-xl bg-slate-50 p-3.5 leading-relaxed text-slate-700 border border-slate-200">
                  {selectedLead.message || "No custom message provided."}
                </div>
              </div>

              <div>
                <div className="font-bold uppercase tracking-wider text-slate-400 text-[10px] mb-1">
                  Update Lead Status
                </div>
                <div className="flex gap-2">
                  {(["New", "Contacted", "Scheduled", "Closed"] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(selectedLead.id, st)}
                      className={cn(
                        "flex-1 rounded-lg py-1.5 text-xs font-bold border transition",
                        selectedLead.status === st
                          ? "bg-[#002c5f] text-white border-[#002c5f]"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
                      )}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-3 flex justify-between items-center">
              <button
                onClick={() => handleDeleteLead(selectedLead.id)}
                className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:underline"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete Lead
              </button>
              <button
                onClick={() => setSelectedLead(null)}
                className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

