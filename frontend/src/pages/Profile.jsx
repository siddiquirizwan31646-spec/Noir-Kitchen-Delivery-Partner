import { TopBar } from "./Layout";
import { StarIcon, ChevronRightIcon } from "./Icons";
import { fmt, agentStatusStyle, makeBtn } from "./theme";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardList, faStar, faBell, faLock, faCircleQuestion, faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";

export default function ProfilePage({ agent, orders, onLogout, onToggleStatus, notifications, T, onThemeToggle, isDark }) {
  const delivered   = orders.filter(o => o.status === "Delivered").length;
  const cancelled   = orders.filter(o => o.status === "Cancelled").length;
  const totalEarned = orders.filter(o => o.status === "Delivered")
    .reduce((a, o) => a + (o.foodDetails?.totalAmount || 0), 0);
  const sc  = agentStatusStyle(agent.status, T);
  const btn = makeBtn(T);

  const infoRows = [
    { label: "Vehicle Type",   val: agent.vehicleType   || "—" },
    { label: "Vehicle Number", val: agent.vehicleNumber || "—" },
    { label: "Phone",          val: agent.phone         || "—" },
    { label: "Email",          val: agent.email         || "—" },
  ];

  const menuItems = [
    { icon: faClipboardList,  label: "Order History",     sub: `${delivered} delivered, ${cancelled} cancelled` },
    { icon: faStar,           label: "Ratings & Reviews", sub: "4.8 avg rating"        },
    { icon: faBell,           label: "Notifications",     sub: "All notifications on"  },
    { icon: faLock,           label: "Privacy & Security",sub: "Account secure"        },
    { icon: faCircleQuestion, label: "Help & Support",    sub: "24/7 support available"},
  ];

  return (
    <div style={{ paddingBottom: "80px", background: T.bg, minHeight: "100vh" }}>
      <TopBar
        title="Profile"
        agentName={agent.name}
        agentStatus={agent.status}
        T={T}
        isDark={isDark}
        onThemeToggle={onThemeToggle}
        notifications={notifications}
      />

      <div style={{ padding: "14px" }}>
        {/* Hero card */}
        <div style={{
          background: `linear-gradient(135deg, ${T.brand}, ${T.brandDk})`,
          borderRadius: "22px", padding: "22px 18px", marginBottom: "14px",
          display: "flex", alignItems: "center", gap: "16px", color: "#fff",
        }}>
          <div style={{
            width: "64px", height: "64px", borderRadius: "50%",
            background: "rgba(255,255,255,.25)", border: "3px solid rgba(255,255,255,.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "24px", fontWeight: "800", flexShrink: 0,
          }}>
            {agent.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: "0 0 1px", fontSize: "18px", fontWeight: "800", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {agent.name}
            </p>
            <p style={{ margin: "0 0 10px", fontSize: "12px", opacity: .82 }}>Delivery Partner</p>

            {/* Status chip — 3 states */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: "6px",
                background: "rgba(255,255,255,.2)", borderRadius: "20px", padding: "4px 12px",
              }}>
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: sc.dot, flexShrink: 0 }} />
                <span style={{ fontSize: "12px", fontWeight: "700" }}>
                  {agent.status === "Available"   ? "Available"    :
                   agent.status === "On Delivery" ? "On Delivery"  : "Offline"}
                </span>
              </div>
            </div>
          </div>

          
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "14px" }}>
          {[
            { val: orders.length, label: "Total"    },
            { val: delivered,     label: "Delivered"},
            { val: fmt(totalEarned), label: "Earned"},
          ].map(s => (
            <div key={s.label} style={{
              background: T.card, borderRadius: "16px", border: `1px solid ${T.border}`,
              padding: "14px 10px", textAlign: "center",
            }}>
              <p style={{ margin: "0 0 3px", fontSize: "18px", fontWeight: "800", color: T.text }}>{s.val}</p>
              <p style={{ margin: 0, fontSize: "11px", color: T.sub }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Rating */}
        <div style={{
          background: T.card, borderRadius: "16px", border: `1px solid ${T.border}`,
          padding: "14px 16px", marginBottom: "14px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <p style={{ margin: "0 0 6px", fontSize: "12px", color: T.sub }}>Your Rating</p>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              {[1, 2, 3, 4, 5].map(i => <StarIcon key={i} size={16} filled={i <= 4} />)}
              <span style={{ fontSize: "16px", fontWeight: "800", color: T.text, marginLeft: "5px" }}>4.8</span>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: "11px", color: T.sub, textAlign: "right" }}>
            Based on<br />{delivered} deliveries
          </p>
        </div>

        {/* Info rows */}
        <div style={{
          background: T.card, borderRadius: "16px", border: `1px solid ${T.border}`,
          padding: "4px 16px", marginBottom: "14px",
        }}>
          {infoRows.map((r, i) => (
            <div key={r.label} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "13px 0",
              borderBottom: i < infoRows.length - 1 ? `1px solid ${T.border}` : "none",
            }}>
              <p style={{ margin: 0, fontSize: "13px", color: T.sub }}>{r.label}</p>
              <p style={{ margin: 0, fontSize: "13px", fontWeight: "700", color: T.text }}>{r.val}</p>
            </div>
          ))}
        </div>

        {/* Menu */}
        <div style={{
          background: T.card, borderRadius: "16px", border: `1px solid ${T.border}`,
          padding: "4px 16px", marginBottom: "14px",
        }}>
          {menuItems.map((m, i) => (
            <div key={m.label} style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "14px 0",
              borderBottom: i < menuItems.length - 1 ? `1px solid ${T.border}` : "none",
              cursor: "pointer",
            }}>
              <FontAwesomeIcon icon={m.icon} style={{ fontSize: "16px", color: T.brand, flexShrink: 0, width: "18px" }} />
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: "13px", fontWeight: "700", color: T.text }}>{m.label}</p>
                <p style={{ margin: "2px 0 0", fontSize: "11px", color: T.sub }}>{m.sub}</p>
              </div>
              <ChevronRightIcon color={T.sub} />
            </div>
          ))}
        </div>

        <button
          onClick={onLogout}
          style={{ ...btn.ghost, color: T.red, borderColor: `${T.red}50` }}
        >
          <FontAwesomeIcon icon={faRightFromBracket} style={{ marginRight: 7 }} />
          Log Out
        </button>
      </div>
    </div>
  );
}