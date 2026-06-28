import { useState } from "react";
import { TopBar, Modal } from "./Layout";
import { MapPinIcon, PhoneIcon, CopyIcon } from "./Icons";
import { fmt, shortId, statusStyle, makeBtn, makeField } from "./theme";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLayerGroup, faBiking, faCircleCheck, faCircleXmark,
  faBoxOpen, faInbox, faFileLines, faDollarSign,
} from "@fortawesome/free-solid-svg-icons";

/* ─── Order Card (list) ─────────────────────────────────── */
function OrderCard({ order: o, onPress, T }) {
  const ss   = statusStyle(o.status, T);
  const isCash = o.foodDetails?.paymentMethod?.toLowerCase() === "cash";
  const at   = new Date(o.assignedAt);
  const timeStr = at.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const isActive = !["Delivered", "Cancelled"].includes(o.status);

  return (
    <div
      onClick={onPress}
      style={{
        background: T.card, borderRadius: "16px",
        border: isActive ? `2px solid ${T.brand}40` : `1px solid ${T.border}`,
        padding: "16px 14px", marginBottom: "10px", cursor: "pointer",
        position: "relative", overflow: "hidden",
        opacity: isActive ? 1 : 0.8,
      }}
    >
      {isActive && (
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: "4px",
          background: `linear-gradient(180deg, ${T.brand}, ${T.brandDk})`,
          borderRadius: "4px 0 0 4px",
        }} />
      )}
      <div style={{ paddingLeft: isActive ? "8px" : "0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
          <div>
            <p style={{ margin: "0 0 2px", fontSize: "13px", fontWeight: "800", color: T.brand }}>{shortId(o.order)}</p>
            <p style={{ margin: 0, fontSize: "11px", color: T.sub }}>{timeStr}</p>
          </div>
          <span style={{ fontSize: "11px", fontWeight: "700", padding: "4px 12px", borderRadius: "20px", ...ss }}>{o.status}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
          <p style={{ margin: 0, fontSize: "13px", fontWeight: "700", color: T.text }}>
            {o.customerDetails?.fullName}
          </p>
          {o.customerDetails?.mobile && isActive && (
            <a
              href={`tel:${o.customerDetails.mobile}`}
              onClick={e => e.stopPropagation()}
              style={{
                display: "flex", alignItems: "center", gap: "4px",
                background: T.brandLt, borderRadius: "20px", padding: "4px 10px",
                textDecoration: "none", fontSize: "11px", color: T.brand, fontWeight: "700",
              }}
            >
              <PhoneIcon size={12} color={T.brand} />
              {o.customerDetails.mobile}
            </a>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "8px" }}>
          <MapPinIcon size={13} color={T.sub} />
          <p style={{ margin: 0, fontSize: "12px", color: T.sub, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {o.customerDetails?.deliveryAddress}
          </p>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ margin: 0, fontSize: "12px", color: T.sub }}>
            {o.foodDetails?.itemName} × {o.foodDetails?.quantity}
          </p>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: 0, fontSize: "14px", fontWeight: "800", color: T.text }}>{fmt(o.foodDetails?.totalAmount)}</p>
            <p style={{ margin: 0, fontSize: "11px", fontWeight: "600", color: isCash ? T.brand : T.green }}>
              {isCash ? "Cash" : "Paid"}
            </p>
          </div>
        </div>
        {o.cancelReason && (
          <div style={{ marginTop: "10px", background: T.redLt, borderRadius: "8px", padding: "7px 10px" }}>
            <p style={{ margin: 0, fontSize: "11px", color: T.red }}>
              Cancelled by {o.cancelledBy}: {o.cancelReason}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── ORDERS PAGE ───────────────────────────────────────── */
export function OrdersPage({ orders, onViewOrder, notifications, T, onThemeToggle, isDark }) {
  const [filter, setFilter] = useState("All");

  const tabConfig = [
    { id: "All",       icon: faLayerGroup   },
    { id: "Active",    icon: faBiking       },
    { id: "Delivered", icon: faCircleCheck  },
    { id: "Cancelled", icon: faCircleXmark  },
  ];

  const filtered = orders.filter(o => {
    if (filter === "Active")    return !["Delivered", "Cancelled"].includes(o.status);
    if (filter === "Delivered") return o.status === "Delivered";
    if (filter === "Cancelled") return o.status === "Cancelled";
    return true;
  });

  return (
    <div style={{ paddingBottom: "80px", background: T.bg, minHeight: "100vh" }}>
      <TopBar
        title="Orders"
        T={T}
        isDark={isDark}
        onThemeToggle={onThemeToggle}
        notifications={notifications}
        right={
          <span style={{ fontSize: "12px", color: T.sub, fontWeight: "600" }}>
            {orders.length} total
          </span>
        }
      />

      {/* Filter tabs */}
      <div style={{
        display: "flex", gap: "8px", padding: "14px 14px 0",
        overflowX: "auto", scrollbarWidth: "none",
      }}>
        {tabConfig.map(({ id, icon }) => {
          const count = id === "All" ? orders.length
            : id === "Active" ? orders.filter(o => !["Delivered","Cancelled"].includes(o.status)).length
            : orders.filter(o => o.status === id).length;
          return (
            <button
              key={id}
              onClick={() => setFilter(id)}
              style={{
                padding: "8px 14px", borderRadius: "20px", border: "none",
                fontSize: "12px", fontWeight: "700", cursor: "pointer", whiteSpace: "nowrap",
                background: filter === id ? T.brand : T.cardAlt,
                color: filter === id ? "#fff" : T.sub,
                display: "flex", alignItems: "center", gap: "5px",
              }}
            >
              <FontAwesomeIcon icon={icon} style={{ fontSize: 12 }} />
              {id}
              <span style={{
                fontSize: "10px", fontWeight: "800",
                color: filter === id ? "rgba(255,255,255,.75)" : T.sub,
              }}>{count}</span>
            </button>
          );
        })}
      </div>

      <div style={{ padding: "12px 14px 0" }}>
        {filtered.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "52px 20px", background: T.card,
            borderRadius: "16px", border: `1px solid ${T.border}`, marginTop: "8px",
          }}>
            <FontAwesomeIcon icon={faInbox} style={{ fontSize: "36px", color: T.sub }} />
            <p style={{ fontSize: "14px", color: T.sub, marginTop: "10px" }}>
              No {filter.toLowerCase()} orders
            </p>
          </div>
        ) : (
          filtered.map(o => <OrderCard key={o._id} order={o} onPress={() => onViewOrder(o)} T={T} />)
        )}
      </div>
    </div>
  );
}

/* ─── ORDER DETAIL PAGE ─────────────────────────────────── */
export function OrderDetailPage({ order: o, onBack, onAction, T }) {
  const [copied, setCopied] = useState(false);
  const ss     = statusStyle(o.status, T);
  const isCash = o.foodDetails?.paymentMethod?.toLowerCase() === "cash";
  const isDone = ["Delivered", "Cancelled"].includes(o.status);
  const btn    = makeBtn(T);

  /* Build navigation URL — prefer lat/lng for accuracy */
  const lat = o.customerDetails?.latitude;
  const lng = o.customerDetails?.longitude;
  const dirUrl = (lat && lng)
    ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(o.customerDetails?.deliveryAddress || "")}&travelmode=driving`;

  const copyId = () => {
    navigator.clipboard?.writeText(shortId(o.order));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const bannerBg    = o.status === "Delivered" ? T.greenLt : o.status === "Cancelled" ? T.redLt : T.brandLt;
  const bannerBorder= o.status === "Delivered" ? `${T.green}40` : o.status === "Cancelled" ? `${T.red}40` : `${T.brand}40`;
  const bannerColor = o.status === "Delivered" ? T.green  : o.status === "Cancelled" ? T.red   : T.brand;

  return (
    <div style={{ paddingBottom: "80px", background: T.bg, minHeight: "100vh" }}>
      {/* Sticky header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 18px", background: T.card, borderBottom: `1px solid ${T.border}`,
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <button
          onClick={onBack}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: "22px", color: T.text, padding: "0 8px 0 0" }}
        >←</button>
        <p style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: T.text }}>Order Details</p>
        <a href={`tel:${o.customerDetails?.mobile}`} style={{ color: T.brand, textDecoration: "none" }}>
          <PhoneIcon size={20} color={T.brand} />
        </a>
      </div>

      <div style={{ padding: "14px" }}>
        {/* Status banner */}
        <div style={{
          borderRadius: "16px", padding: "14px 16px", marginBottom: "12px",
          background: bannerBg, border: `1px solid ${bannerBorder}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <FontAwesomeIcon
              icon={o.status === "Delivered" ? faCircleCheck : o.status === "Cancelled" ? faCircleXmark : faBoxOpen}
              style={{ fontSize: "22px", color: bannerColor }}
            />
            <div>
              <p style={{ margin: "0 0 2px", fontSize: "13px", fontWeight: "800", color: bannerColor }}>
                {o.status === "Assigned"          ? "Pick up the order"
                : o.status === "Picked Up"        ? "Head to customer"
                : o.status === "Out for Delivery" ? "On the way"
                : o.status === "Delivered"        ? "Delivered successfully"
                : "Order cancelled"}
              </p>
              <p style={{ margin: 0, fontSize: "12px", color: T.sub }}>
                {o.status === "Assigned"  ? "Go to the restaurant and pick up the order"
                : o.status === "Delivered"? "Great job! Order has been delivered."
                : o.status === "Cancelled"? `Reason: ${o.cancelReason || "—"}`
                : "Please confirm to continue delivery"}
              </p>
            </div>
          </div>
        </div>

        {/* Order ID card */}
        <div style={{ background: T.card, borderRadius: "16px", border: `1px solid ${T.border}`, padding: "16px", marginBottom: "12px" }}>
          <p style={{ margin: "0 0 10px", fontSize: "11px", fontWeight: "700", color: T.sub, letterSpacing: "1px" }}>ORDER ID</p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <p style={{ margin: 0, fontSize: "17px", fontWeight: "800", color: T.brand }}>{shortId(o.order)}</p>
              <button onClick={copyId} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px" }}>
                <CopyIcon color={T.sub} />
              </button>
              {copied && <span style={{ fontSize: "11px", color: T.green }}>Copied!</span>}
            </div>
            <span style={{ fontSize: "11px", fontWeight: "700", padding: "4px 12px", borderRadius: "20px", ...ss }}>{o.status}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "12px" }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "50%", background: T.brandLt,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "13px", fontWeight: "800", color: T.brand,
            }}>NK</div>
            <div>
              <p style={{ margin: 0, fontSize: "10px", color: T.sub }}>Restaurant</p>
              <p style={{ margin: 0, fontSize: "13px", fontWeight: "700", color: T.text }}>Noir Kitchen</p>
            </div>
          </div>
        </div>

        {/* Customer card */}
        <div style={{ background: T.card, borderRadius: "16px", border: `1px solid ${T.border}`, padding: "16px", marginBottom: "12px" }}>
          <p style={{ margin: "0 0 12px", fontSize: "11px", fontWeight: "700", color: T.sub, letterSpacing: "1px" }}>CUSTOMER</p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <div>
              <p style={{ margin: "0 0 3px", fontSize: "16px", fontWeight: "700", color: T.text }}>
                {o.customerDetails?.fullName}
              </p>
              {o.customerDetails?.mobile && (
                <a
                  href={`tel:${o.customerDetails.mobile}`}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "5px",
                    fontSize: "13px", color: T.brand, fontWeight: "700",
                    textDecoration: "none",
                  }}
                >
                  <PhoneIcon size={13} color={T.brand} />
                  {o.customerDetails.mobile}
                </a>
              )}
            </div>
            <a href={`tel:${o.customerDetails?.mobile}`} style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: "38px", height: "38px", borderRadius: "50%", background: T.brandLt,
              textDecoration: "none",
            }}>
              <PhoneIcon size={16} color={T.brand} />
            </a>
          </div>
          <p style={{ margin: "0 0 8px", fontSize: "11px", fontWeight: "700", color: T.sub, letterSpacing: "1px" }}>ADDRESS</p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
            <div style={{ display: "flex", gap: "6px", flex: 1 }}>
              <MapPinIcon size={14} color={T.sub} />
              <p style={{ margin: 0, fontSize: "13px", color: T.sub, lineHeight: "1.5" }}>
                {o.customerDetails?.deliveryAddress}
              </p>
            </div>
            <a
              href={dirUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center", gap: "4px", color: "#fff",
                background: T.brand, borderRadius: "20px", padding: "6px 12px",
                textDecoration: "none", fontSize: "12px", fontWeight: "700", whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              <MapPinIcon size={13} color="#fff" /> Navigate
            </a>
          </div>
          {lat && lng && (
            <p style={{ margin: "6px 0 0 20px", fontSize: "10px", color: T.sub }}>
              {parseFloat(lat).toFixed(5)}, {parseFloat(lng).toFixed(5)}
            </p>
          )}
        </div>

        {/* Items card */}
        <div style={{ background: T.card, borderRadius: "16px", border: `1px solid ${T.border}`, padding: "16px", marginBottom: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <p style={{ margin: 0, fontSize: "11px", fontWeight: "700", color: T.sub, letterSpacing: "1px" }}>ITEMS</p>
            <span style={{ fontSize: "12px", color: T.brand, fontWeight: "700" }}>1 Item</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
            <div>
              <p style={{ margin: "0 0 3px", fontSize: "14px", fontWeight: "700", color: T.text }}>
                {o.foodDetails?.itemName}
                {o.foodDetails?.variant && o.foodDetails.variant !== "Standard" ? ` (${o.foodDetails.variant})` : ""}
                {" "}× {o.foodDetails?.quantity}
              </p>
              {o.foodDetails?.addons && (
                <p style={{ margin: 0, fontSize: "12px", color: T.sub }}>Add-ons: {o.foodDetails.addons}</p>
              )}
            </div>
            <p style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: T.text }}>{fmt(o.foodDetails?.baseAmount)}</p>
          </div>
          {o.foodDetails?.specialInstructions && (
            <div style={{ background: T.redLt, borderRadius: "8px", padding: "8px 10px", margin: "8px 0" }}>
              <p style={{ margin: 0, fontSize: "12px", color: T.red }}>
                <FontAwesomeIcon icon={faFileLines} style={{ marginRight: 5 }} />
                {o.foodDetails.specialInstructions}
              </p>
            </div>
          )}
          <div style={{
            borderTop: `1px solid ${T.border}`, marginTop: "12px", paddingTop: "12px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <p style={{ margin: 0, fontSize: "14px", fontWeight: "800", color: T.text }}>Total</p>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: 0, fontSize: "17px", fontWeight: "800", color: T.text }}>{fmt(o.foodDetails?.totalAmount)}</p>
              <span style={{ fontSize: "11px", fontWeight: "700", color: isCash ? T.brand : T.green }}>
                <FontAwesomeIcon icon={isCash ? faDollarSign : faCircleCheck} style={{ marginRight: 4 }} />
                {isCash ? "Collect Cash" : "Already Paid"}
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        {!isDone && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <button onClick={() => onAction("deliver")} style={{ ...btn.primary, marginTop: 0 }}>
              <FontAwesomeIcon icon={faCircleCheck} style={{ marginRight: 6 }} />
              Confirm Delivery
            </button>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => onAction("cancel-partner")} style={{ ...btn.warn, flex: 1 }}>
                Cancel (Me)
              </button>
              <button onClick={() => onAction("cancel-customer")} style={{ ...btn.danger, flex: 1 }}>
                Cancel (Customer)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── ACTION MODAL ──────────────────────────────────────── */
export function ActionModal({ type, onClose, onSubmit, loading, error, T }) {
  const [otp, setOtp]       = useState("");
  const [reason, setReason] = useState("");
  const btn   = makeBtn(T);
  const field = makeField(T);

  return (
    <Modal
      title={
        type === "deliver"         ? "Confirm Delivery"      :
        type === "cancel-customer" ? "Customer Cancellation" : "Cancel Order"
      }
      onClose={onClose}
      T={T}
    >
      {type === "deliver" && (
        <>
          <p style={{ fontSize: "13px", color: T.sub, marginBottom: "16px" }}>
            Ask the customer for their delivery OTP to confirm handoff.
          </p>
          <label style={field.label}>CUSTOMER OTP *</label>
          <input
            value={otp} onChange={e => setOtp(e.target.value)}
            placeholder="6-digit OTP" style={field.input}
            type="text" inputMode="numeric" maxLength={6} autoFocus
          />
        </>
      )}
      {type === "cancel-partner" && (
        <>
          <p style={{ fontSize: "13px", color: T.sub, marginBottom: "16px" }}>
            Provide a reason for cancelling this order.
          </p>
          <label style={field.label}>REASON *</label>
          <textarea
            value={reason} onChange={e => setReason(e.target.value)}
            placeholder="e.g. Customer unreachable, wrong address…"
            style={field.textarea} rows={3} autoFocus
          />
        </>
      )}
      {type === "cancel-customer" && (
        <>
          <p style={{ fontSize: "13px", color: T.sub, marginBottom: "16px" }}>
            Customer must provide their OTP to authorise cancellation.
          </p>
          <label style={field.label}>REASON *</label>
          <textarea
            value={reason} onChange={e => setReason(e.target.value)}
            placeholder="e.g. Order placed by mistake…" style={field.textarea} rows={2}
          />
          <label style={field.label}>CUSTOMER OTP *</label>
          <input
            value={otp} onChange={e => setOtp(e.target.value)}
            placeholder="6-digit OTP" style={field.input}
            type="text" inputMode="numeric" maxLength={6}
          />
        </>
      )}
      {error && <p style={{ fontSize: "12px", color: T.red, marginBottom: "8px" }}>{error}</p>}
      <button
        onClick={() => onSubmit({ otp, reason })}
        disabled={loading}
        style={{
          ...btn.primary,
          background: type === "deliver" ? T.brand : T.red,
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Processing…" : type === "deliver" ? "Confirm Delivery" : "Confirm Cancellation"}
      </button>
    </Modal>
  );
}