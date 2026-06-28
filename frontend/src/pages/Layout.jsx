import { useState, useEffect } from "react";
import { HomeIcon, OrdersIcon, EarningsIcon, ProfileIcon, BellIcon, SunIcon, MoonIcon } from "./Icons";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const LOGO_URL = "https://i.postimg.cc/hG4FkpbT/Chat-GPT-Image-Jun-6-2026-05-29-17-PM.png";

/* ─── Bottom Navigation ─────────────────────────────────── */
export function BottomNav({ active, onChange, T }) {
  const tabs = [
    { id: "home",     Icon: HomeIcon,     label: "Home"     },
    { id: "orders",   Icon: OrdersIcon,   label: "Orders"   },
    { id: "earnings", Icon: EarningsIcon, label: "Earnings" },
    { id: "profile",  Icon: ProfileIcon,  label: "Profile"  },
  ];
  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: T.navBg, borderTop: `1px solid ${T.border}`,
      display: "flex", zIndex: 100,
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
      boxShadow: `0 -2px 16px ${T.border}`,
    }}>
      {tabs.map(({ id, Icon, label }) => {
        const on = active === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            style={{
              flex: 1, padding: "10px 0 8px", background: "none", border: "none",
              display: "flex", flexDirection: "column", alignItems: "center", gap: "3px",
              cursor: "pointer", color: on ? T.brand : T.sub,
              transition: "color .15s",
            }}
          >
            <Icon size={22} color={on ? T.brand : T.sub} />
            <span style={{ fontSize: "10px", fontWeight: on ? "700" : "500" }}>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

/* ─── Top Bar ───────────────────────────────────────────── */
export function TopBar({ title, agentName, agentStatus, right, T, onThemeToggle, isDark, notifications = [] }) {
  const [showNotifs, setShowNotifs] = useState(false);
  const [logoError, setLogoError]   = useState(false);

  /* Count unread: isActive=true and not expired */
  const now = new Date();
  const unread = notifications.filter(n => n.isActive && new Date(n.expiryDate) > now).length;

  const dotColor =
    agentStatus === "Available"   ? "#34C875" :
    agentStatus === "On Delivery" ? T.brand   : T.sub;

  const statusLabel =
    agentStatus === "Available"   ? "Available"   :
    agentStatus === "On Delivery" ? "On Delivery" : "Offline";

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "10px 16px 10px", background: T.card,
      borderBottom: `1px solid ${T.border}`,
      position: "sticky", top: 0, zIndex: 50,
    }}>
      {/* Left: logo + name + status */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {/* Logo */}
        <div style={{
          width: "36px", height: "36px", borderRadius: "50%",
          overflow: "hidden", flexShrink: 0,
          border: `2px solid ${T.brand}30`,
          background: T.brandLt,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {!logoError ? (
            <img
              src={LOGO_URL}
              alt="Noir Kitchen"
              onError={() => setLogoError(true)}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span style={{ fontSize: "14px", fontWeight: "800", color: T.brand }}>
              {agentName ? agentName.charAt(0).toUpperCase() : "NK"}
            </span>
          )}
        </div>

        <div>
          <span style={{ fontSize: "14px", fontWeight: "800", color: T.text, display: "block", lineHeight: 1.2 }}>
            {title}
          </span>
          {agentStatus && (
            <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "2px" }}>
              <span style={{
                width: "7px", height: "7px", borderRadius: "50%",
                background: dotColor, display: "inline-block", flexShrink: 0,
              }} />
              <span style={{ fontSize: "11px", color: dotColor, fontWeight: "600" }}>
                {statusLabel}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Right: theme toggle + bell */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <button
          onClick={onThemeToggle}
          style={{
            background: T.cardAlt, border: `1px solid ${T.border}`,
            borderRadius: "10px", padding: "7px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
          title={isDark ? "Switch to Light" : "Switch to Dark"}
        >
          {isDark ? <SunIcon size={16} color={T.brand} /> : <MoonIcon size={16} color={T.brand} />}
        </button>

        <button
          onClick={() => setShowNotifs(v => !v)}
          style={{
            background: T.cardAlt, border: `1px solid ${T.border}`,
            borderRadius: "10px", padding: "7px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative",
          }}
        >
          <BellIcon size={18} color={showNotifs ? T.brand : T.sub} badge={unread} />
        </button>

        {right}
      </div>

      {/* Notification dropdown */}
      {showNotifs && (
        <NotificationPanel
          notifications={notifications}
          T={T}
          onClose={() => setShowNotifs(false)}
        />
      )}
    </div>
  );
}

/* ─── Notification Panel ────────────────────────────────── */
function NotificationPanel({ notifications, T, onClose }) {
  const now    = new Date();
  /* Match MongoDB schema: isActive + expiryDate */
  const active = notifications
    .filter(n => n.isActive && new Date(n.expiryDate) > now)
    .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));

  const typeIcon = (type) => {
    if (type === "success") return "🎉";
    if (type === "warning") return "⚠️";
    if (type === "error")   return "🚨";
    return "📢";
  };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 199 }} />
      <div style={{
        position: "absolute", top: "100%", right: "14px", width: "300px",
        background: T.card, border: `1px solid ${T.border}`,
        borderRadius: "16px", boxShadow: T.shadowMd,
        zIndex: 200, overflow: "hidden", marginTop: "6px",
      }}>
        <div style={{
          padding: "14px 16px 10px",
          borderBottom: `1px solid ${T.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ fontSize: "13px", fontWeight: "800", color: T.text }}>Notifications</span>
          {active.length > 0 && (
            <span style={{
              fontSize: "10px", fontWeight: "700", color: T.brand,
              background: T.brandLt, borderRadius: "20px", padding: "2px 8px",
            }}>
              {active.length} new
            </span>
          )}
        </div>

        <div style={{ maxHeight: "340px", overflowY: "auto" }}>
          {active.length === 0 ? (
            <div style={{ padding: "28px 16px", textAlign: "center" }}>
              <span style={{ fontSize: "28px" }}>🔔</span>
              <p style={{ margin: "8px 0 0", fontSize: "13px", color: T.sub }}>No new notifications</p>
            </div>
          ) : (
            active.map(n => (
              <div key={n._id} style={{
                padding: "12px 16px",
                borderBottom: `1px solid ${T.border}`,
                display: "flex", gap: "10px", alignItems: "flex-start",
              }}>
                {/* Image or emoji/icon */}
                {n.imageUrl ? (
                  <img
                    src={n.imageUrl}
                    alt=""
                    style={{ width: "36px", height: "36px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }}
                    onError={e => { e.target.style.display = "none"; }}
                  />
                ) : (
                  <span style={{ fontSize: "20px", flexShrink: 0, lineHeight: 1.3 }}>
                    {n.emoji || typeIcon(n.type)}
                  </span>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: "0 0 2px", fontSize: "13px", fontWeight: "700", color: T.text }}>
                    {n.title}
                  </p>
                  <p style={{
                    margin: 0, fontSize: "12px", color: T.sub,
                    overflow: "hidden", textOverflow: "ellipsis",
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                  }}>
                    {n.message}
                  </p>
                  {n.link && (
                    <a
                      href={n.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: "11px", color: T.brand, fontWeight: "700",
                        textDecoration: "none", marginTop: "4px", display: "inline-block",
                      }}
                    >
                      View →
                    </a>
                  )}
                  <p style={{ margin: "4px 0 0", fontSize: "10px", color: T.sub }}>
                    Expires {new Date(n.expiryDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

/* ─── Modal ─────────────────────────────────────────────── */
export function Modal({ title, children, onClose, T }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: T.overlay,
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 999, padding: "20px",
    }}>
      <div style={{
        background: T.card, borderRadius: "20px", padding: "28px 22px",
        width: "100%", maxWidth: "370px", boxShadow: T.shadowMd,
      }}>
        <p style={{ fontSize: "16px", fontWeight: "800", color: T.text, margin: "0 0 6px" }}>{title}</p>
        {children}
        <button onClick={onClose} style={{
          background: "none", border: `1px solid ${T.border}`, borderRadius: "12px",
          padding: "10px", fontSize: "13px", color: T.sub, cursor: "pointer",
          width: "100%", marginTop: "10px",
        }}>Dismiss</button>
      </div>
    </div>
  );
}