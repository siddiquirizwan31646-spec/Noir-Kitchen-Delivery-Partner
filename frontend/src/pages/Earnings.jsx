import { useState } from "react";
import { TopBar } from "./Layout";
import { fmt } from "./Theme";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBox, faCircleCheck, faChartBar, faDollarSign,
  faBullseye, faStar, faTrophy, faCalendarDay,
  faCalendarWeek, faCalendar,
} from "@fortawesome/free-solid-svg-icons";
export default function EarningsPage({ orders, notifications, T, onThemeToggle, isDark }) {
  const [period, setPeriod]     = useState("Daily");
  const [hoverIdx, setHoverIdx] = useState(null);
  const now = new Date();

  /* ── filter helpers ── */
  const filterByPeriod = (o) => {
    const d = new Date(o.deliveredAt || o.assignedAt);
    if (period === "Daily")  return d.toDateString() === now.toDateString();
    if (period === "Weekly") {
      const wk = new Date(now); wk.setDate(now.getDate() - 7);
      return d >= wk;
    }
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  };

  const deliveredOrders = orders.filter(o => o.status === "Delivered" && filterByPeriod(o));
  const totalEarning    = deliveredOrders.reduce((a, o) => a + (o.foodDetails?.totalAmount || 0), 0);
  const avgPerOrder     = deliveredOrders.length ? Math.round(totalEarning / deliveredOrders.length) : 0;
  const incentives      = Math.round(totalEarning * 0.08);

  /* ── chart config ── */
  const chartConfig = {
    Daily:   { labels: ["12a","4a","8a","12p","4p","8p"], bucketFn: (d) => Math.floor(d.getHours() / 4) },
    Weekly:  { labels: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], bucketFn: (d) => (d.getDay() + 6) % 7 },
    Monthly: { labels: ["Wk 1","Wk 2","Wk 3","Wk 4"], bucketFn: (d) => Math.min(Math.floor((d.getDate() - 1) / 7), 3) },
  };
  const { labels, bucketFn } = chartConfig[period];

  const chartData = labels.map((_, i) =>
    deliveredOrders
      .filter(o => bucketFn(new Date(o.deliveredAt || o.assignedAt)) === i)
      .reduce((a, o) => a + (o.foodDetails?.totalAmount || 0), 0)
  );
  const maxChart = Math.max(...chartData, 1);
  const W = 320, H = 100, padL = 8, padR = 8, padT = 12, padB = 8;
  const slotW = (W - padL - padR) / (labels.length - 1 || 1);

  const points = labels.map((_, i) => ({
    x: padL + i * slotW,
    y: padT + (H - padT - padB) * (1 - chartData[i] / maxChart),
    val: chartData[i],
  }));

  const polyline = points.map(p => `${p.x},${p.y}`).join(" ");
  const areaPoly = [
    ...points.map(p => `${p.x},${p.y}`),
    `${points[points.length - 1].x},${H}`,
    `${points[0].x},${H}`,
  ].join(" ");

  const periodLabel = period === "Daily" ? "Today's" : period === "Weekly" ? "This Week's" : "This Month's";

  const statCards = [
    { label: "Orders",      val: deliveredOrders.length, icon: faBox },
    { label: "Completed",   val: deliveredOrders.length, icon: faCircleCheck },
    { label: "Avg / Order", val: fmt(avgPerOrder),       icon: faChartBar },
  ];

  const breakdown = [
    { label: "Order Earnings",  val: fmt(totalEarning), color: T.text,  icon: faDollarSign },
    { label: "Incentives (8%)", val: fmt(incentives),   color: T.green, icon: faBullseye },
    { label: "Tips",            val: fmt(0),            color: T.text,  icon: faStar },
  ];

  return (
    <div style={{ paddingBottom: "80px", background: T.bg, minHeight: "100vh" }}>
      <TopBar
        title="Earnings"
        T={T}
        isDark={isDark}
        onThemeToggle={onThemeToggle}
        notifications={notifications}
      />

      {/* Period tab selector */}
      <div style={{
        display: "flex", background: T.card, borderBottom: `1px solid ${T.border}`,
        padding: "0 14px",
      }}>
        {[
          { label: "Daily",   icon: faCalendarDay },
          { label: "Weekly",  icon: faCalendarWeek },
          { label: "Monthly", icon: faCalendar },
        ].map(({ label, icon }) => (
          <button
            key={label}
            onClick={() => { setPeriod(label); setHoverIdx(null); }}
            style={{
              flex: 1, padding: "14px 0", background: "none", border: "none",
              fontSize: "13px", fontWeight: period === label ? "800" : "500",
              color: period === label ? T.brand : T.sub,
              cursor: "pointer",
              borderBottom: period === label ? `2.5px solid ${T.brand}` : "2.5px solid transparent",
              transition: "all .15s",
            }}
          >
            <FontAwesomeIcon icon={icon} style={{ marginRight: 6 }} />
            {label}
          </button>
        ))}
      </div>

      <div style={{ padding: "14px" }}>

        {/* Big number + chart card */}
        <div style={{
          background: T.card, borderRadius: "20px", border: `1px solid ${T.border}`,
          padding: "20px 18px 16px", marginBottom: "12px", boxShadow: T.shadow,
        }}>
          <p style={{ margin: "0 0 2px", fontSize: "12px", color: T.sub }}>{periodLabel} Earnings</p>
          <p style={{ margin: "0 0 2px", fontSize: "34px", fontWeight: "800", color: T.text }}>{fmt(totalEarning)}</p>
          <p style={{ margin: "0 0 18px", fontSize: "12px", color: T.green, fontWeight: "600" }}>
            {deliveredOrders.length > 0 ? (
              <><FontAwesomeIcon icon={faCircleCheck} style={{ marginRight: 5 }} />{deliveredOrders.length} deliveries completed</>
            ) : (
              <><FontAwesomeIcon icon={faBullseye} style={{ marginRight: 5 }} />No deliveries yet</>
            )}
          </p>

          {/* Interactive SVG chart */}
          <div style={{ position: "relative" }}>
            <svg
              width="100%"
              viewBox={`0 0 ${W} ${H + 4}`}
              preserveAspectRatio="none"
              style={{ overflow: "visible", cursor: "crosshair" }}
            >
              <defs>
                <linearGradient id={`cg-${period}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={T.brand} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={T.brand} stopOpacity="0" />
                </linearGradient>
              </defs>

              {[0.25, 0.5, 0.75].map(f => {
                const y = padT + (H - padT - padB) * f;
                return (
                  <line key={f} x1={padL} x2={W - padR} y1={y} y2={y}
                    stroke={T.border} strokeWidth="1" strokeDasharray="3 3" />
                );
              })}

              <polygon points={areaPoly} fill={`url(#cg-${period})`} />
              <polyline
                points={polyline}
                fill="none" stroke={T.brand} strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round"
              />

              {hoverIdx !== null && (
                <line
                  x1={points[hoverIdx].x} x2={points[hoverIdx].x}
                  y1={padT} y2={H}
                  stroke={T.brand} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.6"
                />
              )}

              {points.map((p, i) => (
                <g key={i}>
                  <rect
                    x={p.x - slotW / 2} y={0}
                    width={slotW} height={H}
                    fill="transparent"
                    onMouseEnter={() => setHoverIdx(i)}
                    onMouseLeave={() => setHoverIdx(null)}
                  />
                  <circle
                    cx={p.x} cy={p.y} r={hoverIdx === i ? 5.5 : 3.5}
                    fill={hoverIdx === i ? T.brandDk : T.brand}
                    style={{ transition: "r .12s" }}
                  />
                </g>
              ))}

              {hoverIdx !== null && (() => {
                const p = points[hoverIdx];
                const tipW = 70;
                const tipX = Math.min(Math.max(p.x - tipW / 2, 0), W - tipW);
                return (
                  <g>
                    <rect x={tipX} y={p.y - 32} width={tipW} height={24} rx="6" fill={T.brand} />
                    <text x={tipX + tipW / 2} y={p.y - 16}
                      textAnchor="middle" fontSize="11" fill="#fff" fontWeight="700">
                      {fmt(p.val)}
                    </text>
                  </g>
                );
              })()}
            </svg>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
              {labels.map((l, i) => (
                <span
                  key={l}
                  onClick={() => setHoverIdx(hoverIdx === i ? null : i)}
                  style={{
                    fontSize: "10px", color: hoverIdx === i ? T.brand : T.sub,
                    fontWeight: hoverIdx === i ? "700" : "400",
                    cursor: "pointer", transition: "color .12s",
                    flex: 1, textAlign: "center",
                  }}
                >
                  {l}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Stats 3-col */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "12px" }}>
          {statCards.map(s => (
            <div key={s.label} style={{
              background: T.card, borderRadius: "14px", border: `1px solid ${T.border}`,
              padding: "14px 10px", textAlign: "center",
            }}>
              <p style={{ margin: "0 0 3px", fontSize: "18px", color: T.brand }}>
                <FontAwesomeIcon icon={s.icon} />
              </p>
              <p style={{ margin: "0 0 3px", fontSize: "16px", fontWeight: "800", color: T.text }}>{s.val}</p>
              <p style={{ margin: 0, fontSize: "10px", color: T.sub }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Breakdown */}
        <div style={{
          background: T.card, borderRadius: "18px", border: `1px solid ${T.border}`,
          padding: "18px 16px", boxShadow: T.shadow,
        }}>
          <p style={{ margin: "0 0 16px", fontSize: "14px", fontWeight: "800", color: T.text }}>
            <FontAwesomeIcon icon={faDollarSign} style={{ marginRight: 7, color: T.brand }} /> Breakdown
          </p>
          {breakdown.map((row, i) => (
            <div
              key={row.label}
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                paddingBottom: "12px", marginBottom: "12px",
                borderBottom: i < breakdown.length - 1 ? `1px solid ${T.border}` : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FontAwesomeIcon icon={row.icon} style={{ fontSize: "15px", color: T.brand }} />
                <p style={{ margin: 0, fontSize: "13px", color: T.sub }}>{row.label}</p>
              </div>
              <p style={{ margin: 0, fontSize: "13px", fontWeight: "700", color: row.color }}>{row.val}</p>
            </div>
          ))}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            paddingTop: "4px", borderTop: `1px solid ${T.border}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <FontAwesomeIcon icon={faTrophy} style={{ fontSize: "15px", color: T.brand }} />
              <p style={{ margin: 0, fontSize: "14px", fontWeight: "800", color: T.text }}>Total</p>
            </div>
            <p style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: T.brand }}>
              {fmt(totalEarning + incentives)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}