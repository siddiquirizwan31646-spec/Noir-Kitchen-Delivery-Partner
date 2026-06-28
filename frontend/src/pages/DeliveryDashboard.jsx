import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { THEMES } from "./theme";
import { BottomNav } from "./Layout";
import Dashboard       from "./Dashboard";
import { OrdersPage, OrderDetailPage, ActionModal } from "./Orders";
import EarningsPage    from "./Earnings";
import ProfilePage     from "./Profile";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

/* ─────────────────────────────────────────────────────────── */
/*  ROOT                                                       */
/* ─────────────────────────────────────────────────────────── */
export default function DeliveryDashboard() {
  const navigate = useNavigate();

  /* ── theme ── */
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem("deliveryTheme") === "dark"; } catch { return false; }
  });
  const T = THEMES[isDark ? "dark" : "light"];
  const toggleTheme = () => {
    setIsDark(v => {
      const next = !v;
      try { localStorage.setItem("deliveryTheme", next ? "dark" : "light"); } catch {}
      return next;
    });
  };

  /* ── data ── */
  const [agent,         setAgent]         = useState(null);
  const [orders,        setOrders]        = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(true);

  /* ── nav ── */
  const [tab,         setTab]         = useState("home");
  const [detailOrder, setDetailOrder] = useState(null);

  /* ── action modal ── */
  const [actionType,    setActionType]    = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError,   setActionError]   = useState("");

  /* ── loaders ── */
  const loadMe = () =>
    fetch(`${API}/api/delivery-auth/me`, { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => setAgent(d?.agent || null))
      .finally(() => setLoading(false));

  const loadOrders = () =>
    fetch(`${API}/api/assign-orders/my`, { credentials: "include" })
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        setOrders(data);
        if (detailOrder) {
          const updated = data.find(o => o._id === detailOrder._id);
          if (updated) setDetailOrder(updated);
        }
      });
      const loadNotifications = () =>
    fetch(`${API}/api/notifications/active`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setNotifications(Array.isArray(data) ? data : data.notifications || []))
      .catch(() => {});

  useEffect(() => {
    loadMe();
    loadOrders();
    loadNotifications();
  }, []);

  useEffect(() => {
    if (!loading && !agent) navigate("/delivery/login");
  }, [loading, agent]);

  /* auto-refresh every 30s */
  useEffect(() => {
    const t = setInterval(() => { loadOrders(); loadNotifications(); }, 30000);
    return () => clearInterval(t);
  }, []);

  /* ── actions ── */
  const toggleStatus = async () => {
    const next = agent.status === "Available" ? "Offline" : "Available";
    await fetch(`${API}/api/delivery-auth/status`, {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    loadMe();
  };

  const logout = async () => {
    await fetch(`${API}/api/delivery-auth/status`, {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Offline" }),
    });
    await fetch(`${API}/api/delivery-auth/logout`, { method: "POST", credentials: "include" });
    window.location.href = "/delivery/login";
  };

  const openAction  = (type) => { setActionType(type); setActionError(""); };
  const closeAction = () => { setActionType(null); setActionLoading(false); setActionError(""); };

  const submitAction = async ({ otp, reason }) => {
    if (!detailOrder) return;
    const id = detailOrder._id;
    setActionError("");

    if (actionType === "deliver"         && !otp.trim())    { setActionError("OTP is required.");          return; }
    if (actionType !== "deliver"         && !reason.trim()) { setActionError("Reason is required.");       return; }
    if (actionType === "cancel-customer" && !otp.trim())    { setActionError("Customer OTP is required."); return; }

    setActionLoading(true);
    try {
      let url, body;
      if (actionType === "deliver") {
        url  = `${API}/api/assign-orders/${id}/status`;
        body = { status: "Delivered", otp: otp.trim() };
      } else {
        url  = `${API}/api/assign-orders/${id}/cancel`;
        body = {
          cancelledBy:  actionType === "cancel-customer" ? "customer" : "partner",
          cancelReason: reason.trim(),
          ...(actionType === "cancel-customer" && { otp: otp.trim() }),
        };
      }
      const r    = await fetch(url, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await r.json();
      if (!r.ok) { setActionError(data.message || "Failed."); setActionLoading(false); return; }
      closeAction();
      await loadOrders();
      setDetailOrder(prev => orders.find(o => o._id === prev?._id) || prev);
    } catch {
      setActionError("Network error. Try again.");
      setActionLoading(false);
    }
  };

  /* ── shared page props ── */
  const sharedProps = { T, isDark, onThemeToggle: toggleTheme, notifications };

  /* ── loading screen ── */
  if (loading) return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: T.bg,
    }}>
      <div style={{
        width: "38px", height: "38px",
        border: `3px solid ${T.brandLt}`,
        borderTop: `3px solid ${T.brand}`,
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <p style={{ color: T.sub, fontSize: "13px", marginTop: "16px" }}>Loading…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!agent) return null;

  return (
    <div style={{
      /* Full viewport on desktop, constrained on mobile */
      width: "100%",
      minHeight: "100vh",
      maxWidth: "480px",
      margin: "0 auto",
      background: T.bg,
      fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
      position: "relative",
      /* On desktop, show a subtle shadow to frame the app */
      boxShadow: "0 0 0 1px rgba(0,0,0,.06), 0 8px 48px rgba(0,0,0,.12)",
    }}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 0; height: 0; }
        input:focus, textarea:focus, select:focus {
          border-color: ${T.brand} !important;
          box-shadow: 0 0 0 3px ${T.brand}22 !important;
          outline: none;
        }
        @media (min-width: 481px) {
          body { background: ${isDark ? "#0A0806" : "#F0EAE3"}; }
        }
      `}</style>

      {/* ── Pages ── */}
      {!detailOrder && tab === "home" && (
        <Dashboard
          agent={agent}
          orders={orders}
          onToggleStatus={toggleStatus}
          onViewOrder={o => { setDetailOrder(o); setTab("orders"); }}
          onLogout={logout}
          {...sharedProps}
        />
      )}
      {!detailOrder && tab === "orders" && (
        <OrdersPage
          orders={orders}
          onViewOrder={o => setDetailOrder(o)}
          {...sharedProps}
        />
      )}
      {!detailOrder && tab === "earnings" && (
        <EarningsPage orders={orders} {...sharedProps} />
      )}
      {!detailOrder && tab === "profile" && (
        <ProfilePage
          agent={agent}
          orders={orders}
          onLogout={logout}
          onToggleStatus={toggleStatus}
          {...sharedProps}
        />
      )}

      {/* ── Order Detail ── */}
      {detailOrder && (
        <OrderDetailPage
          order={detailOrder}
          onBack={() => setDetailOrder(null)}
          onAction={openAction}
          T={T}
        />
      )}

      {/* ── Action Modal ── */}
      {actionType && (
        <ActionModal
          type={actionType}
          loading={actionLoading}
          error={actionError}
          onClose={closeAction}
          onSubmit={submitAction}
          T={T}
        />
      )}

      <BottomNav
        active={tab}
        onChange={t => { setTab(t); setDetailOrder(null); }}
        T={T}
      />
    </div>
  );
}