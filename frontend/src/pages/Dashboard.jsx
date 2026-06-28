import { TopBar } from "./Layout";
import { MapPinIcon, PhoneIcon } from "./Icons";
import { fmt, shortId, todayRange, statusStyle } from "./Theme";

/* ─── Active Order Card ───────────────────────────────────── */
function ActiveOrderCard({ order: o, onPress, T }) {
  const ss = statusStyle(o.status, T);
  return (
    <div
      onClick={onPress}
      style={{
        background: T.card, borderRadius: "16px",
        border: `2px solid ${T.brand}40`, padding: "16px",
        marginBottom: "10px", cursor: "pointer",
        boxShadow: T.shadowMd,
        position: "relative", overflow: "hidden",
      }}
    >
      {/* Active indicator strip */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: "4px",
        background: `linear-gradient(180deg, ${T.brand}, ${T.brandDk})`,
        borderRadius: "4px 0 0 4px",
      }} />
      <div style={{ paddingLeft: "8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <span style={{ fontSize: "13px", fontWeight: "800", color: T.brand }}>{shortId(o.order)}</span>
          <span style={{
            fontSize: "11px", fontWeight: "700", padding: "4px 12px",
            borderRadius: "20px", ...ss,
          }}>{o.status}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
          <p style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: T.text }}>
            {o.customerDetails?.fullName}
          </p>
          {o.customerDetails?.mobile && (
            <a
              href={`tel:${o.customerDetails.mobile}`}
              onClick={e => e.stopPropagation()}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: "30px", height: "30px", borderRadius: "50%",
                background: T.brandLt, textDecoration: "none", flexShrink: 0,
              }}
            >
              <PhoneIcon size={14} color={T.brand} />
            </a>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "5px", marginBottom: "8px" }}>
          <MapPinIcon size={13} color={T.sub} />
          <p style={{
            margin: 0, fontSize: "12px", color: T.sub,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "200px",
          }}>
            {o.customerDetails?.deliveryAddress}
          </p>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "15px", fontWeight: "800", color: T.text }}>{fmt(o.foodDetails?.totalAmount)}</span>
          <span style={{ fontSize: "12px", color: T.brand, fontWeight: "700" }}>View Details →</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Recent Order Row ────────────────────────────────────── */
function RecentOrderRow({ order: o, onPress, T }) {
  const ss = statusStyle(o.status, T);
  const isDone = ["Delivered", "Cancelled"].includes(o.status);
  return (
    <div
      onClick={onPress}
      style={{
        background: T.card, borderRadius: "12px",
        border: `1px solid ${T.border}`,
        padding: "12px 14px", marginBottom: "8px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        cursor: "pointer", opacity: isDone ? 0.72 : 1,
      }}
    >
      <div style={{ flex: 1 }}>
        <p style={{ margin: "0 0 3px", fontSize: "13px", fontWeight: "700", color: T.text }}>
          {shortId(o.order)}
        </p>
        <p style={{ margin: 0, fontSize: "12px", color: T.sub }}>
          {o.customerDetails?.city || o.customerDetails?.deliveryAddress?.split(",")[0]}
        </p>
      </div>
      <div style={{ textAlign: "right" }}>
        <span style={{
          fontSize: "11px", fontWeight: "700", padding: "3px 9px",
          borderRadius: "20px", ...ss, display: "block", marginBottom: "3px",
        }}>{o.status}</span>
        <p style={{ margin: 0, fontSize: "13px", fontWeight: "700", color: T.text }}>
          {fmt(o.foodDetails?.totalAmount)}
        </p>
      </div>
    </div>
  );
}

/* ─── HOME PAGE ───────────────────────────────────────────── */
export default function HomePage({ agent, orders, onViewOrder, notifications, T, onThemeToggle, isDark }) {
  const { s, e } = todayRange();
  const todayOrders  = orders.filter(o => { const d = new Date(o.assignedAt); return d >= s && d <= e; });
  const completed    = todayOrders.filter(o => o.status === "Delivered");
  const inProgress   = todayOrders.filter(o => !["Delivered", "Cancelled"].includes(o.status));
  const todayEarning = completed.reduce((acc, o) => acc + (o.foodDetails?.totalAmount || 0), 0);
  const recentOrders = [...orders].slice(0, 5);

  const sparkPoints = Array.from({ length: 6 }, (_, i) => {
    return completed.filter(o => {
      const h = new Date(o.deliveredAt || o.assignedAt).getHours();
      return h >= i * 4 && h < (i + 1) * 4;
    }).length;
  });
  const maxSpark = Math.max(...sparkPoints, 1);

  const stats = [
    { label: "Total Orders", value: todayOrders.length, icon: "📦" },
    { label: "Completed",    value: completed.length,   icon: "✅" },
    { label: "In Progress",  value: inProgress.length,  icon: "🚴" },
    { label: "Earnings",     value: fmt(todayEarning),  icon: "💰" },
  ];

  return (
    <div style={{ paddingBottom: "80px", background: T.bg, minHeight: "100vh" }}>
      <TopBar
        title="Delivery Partner"
        agentName={agent.name}
        agentStatus={agent.status}
        T={T}
        isDark={isDark}
        onThemeToggle={onThemeToggle}
        notifications={notifications}
      />

      {/* ── Hero gradient card ── */}
      <div style={{
        margin: "14px 14px 0",
        background: `linear-gradient(135deg, ${T.brand} 0%, ${T.brandDk} 100%)`,
        borderRadius: "22px", padding: "20px 18px", color: "#fff",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", right: "-20px", top: "-20px", width: "100px", height: "100px", borderRadius: "50%", background: "rgba(255,255,255,.08)" }} />
        <div style={{ position: "absolute", right: "20px", bottom: "-30px", width: "80px", height: "80px", borderRadius: "50%", background: "rgba(255,255,255,.06)" }} />

        <div style={{ marginBottom: "18px" }}>
          <p style={{ margin: "0 0 2px", fontSize: "20px", fontWeight: "800" }}>
            Hello, {agent.name?.split(" ")[0]} 👋
          </p>
          <p style={{ margin: 0, fontSize: "13px", opacity: .82 }}>Ready to deliver happiness!</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          {stats.map(st => (
            <div key={st.label} style={{ background: "rgba(255,255,255,.16)", borderRadius: "14px", padding: "12px 14px" }}>
              <p style={{ margin: "0 0 2px", fontSize: "11px", opacity: .8 }}>{st.icon} {st.label}</p>
              <p style={{ margin: 0, fontSize: "20px", fontWeight: "800" }}>{st.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Earnings sparkline card ── */}
      <div style={{
        margin: "12px 14px 0", background: T.card,
        borderRadius: "18px", border: `1px solid ${T.border}`,
        padding: "16px 16px 14px", boxShadow: T.shadow,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ margin: "0 0 2px", fontSize: "12px", color: T.sub }}>Today's Earnings</p>
            <p style={{ margin: "0 0 4px", fontSize: "28px", fontWeight: "800", color: T.text }}>{fmt(todayEarning)}</p>
            <p style={{ margin: 0, fontSize: "12px", color: T.green, fontWeight: "600" }}>
              {completed.length > 0 ? `+${completed.length} deliveries` : "No deliveries yet"}
            </p>
          </div>
          <svg width="90" height="48" viewBox="0 0 90 48">
            <polyline
              points={sparkPoints.map((v, i) => `${i * 18},${44 - (v / maxSpark) * 38}`).join(" ")}
              fill="none" stroke={T.brand} strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
            />
            {sparkPoints.map((v, i) => (
              <circle key={i} cx={i * 18} cy={44 - (v / maxSpark) * 38} r="3.5" fill={T.brand} />
            ))}
          </svg>
        </div>
      </div>

      {/* ── Goal nudge ── */}
      {inProgress.length === 0 && (
        <div style={{
          margin: "12px 14px 0", background: "#FFFBEB", borderRadius: "16px",
          border: "1px solid #FDE68A", padding: "14px 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <p style={{ margin: "0 0 2px", fontSize: "13px", fontWeight: "700", color: "#92400E" }}>
              Keep Delivering!
            </p>
            <p style={{ margin: 0, fontSize: "12px", color: "#B45309" }}>
              {completed.length >= 3 ? "Great work today! 🔥" : `${3 - completed.length} more to hit daily goal`}
            </p>
          </div>
          <span style={{ fontSize: "28px" }}>👑</span>
        </div>
      )}

      {/* ── Active orders ── */}
      {inProgress.length > 0 && (
        <div style={{ margin: "16px 14px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{
                width: "8px", height: "8px", borderRadius: "50%",
                background: T.green, boxShadow: `0 0 0 3px ${T.green}30`,
              }} />
              <p style={{ margin: 0, fontSize: "14px", fontWeight: "800", color: T.text }}>Active Orders</p>
            </div>
            <span style={{
              fontSize: "11px", color: "#fff", fontWeight: "700",
              background: T.green, borderRadius: "20px", padding: "3px 10px",
            }}>{inProgress.length} ongoing</span>
          </div>
          {inProgress.map(o => (
            <ActiveOrderCard key={o._id} order={o} onPress={() => onViewOrder(o)} T={T} />
          ))}
        </div>
      )}

      {/* ── Recent orders ── */}
      <div style={{ margin: "16px 14px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: T.sub }} />
            <p style={{ margin: 0, fontSize: "14px", fontWeight: "800", color: T.text }}>Recent Orders</p>
          </div>
          <span style={{ fontSize: "11px", color: T.brand, fontWeight: "700", cursor: "pointer" }}>View all</span>
        </div>
        {recentOrders.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "32px 20px", background: T.card,
            borderRadius: "16px", border: `1px solid ${T.border}`,
          }}>
            <span style={{ fontSize: "32px" }}>📭</span>
            <p style={{ fontSize: "13px", color: T.sub, marginTop: "8px" }}>No orders yet</p>
          </div>
        ) : (
          recentOrders.map(o => (
            <RecentOrderRow key={o._id} order={o} onPress={() => onViewOrder(o)} T={T} />
          ))
        )}
      </div>
    </div>
  );
}