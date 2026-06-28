/* ─────────────────────────────────────────────────────────── */
/*  THEME SYSTEM — Light & Dark                               */
/* ─────────────────────────────────────────────────────────── */

export const THEMES = {
  light: {
    brand:    "#E07B39",
    brandDk:  "#C45E20",
    brandLt:  "#FFF3E0",
    brandMd:  "#F5D9B8",
    green:    "#27AE60",
    greenLt:  "#E8F8EF",
    red:      "#E53935",
    redLt:    "#FDEAEA",
    text:     "#1A1208",
    textSub:  "#6B6057",
    sub:      "#9E9087",
    border:   "#EDE5DC",
    bg:       "#FAF6F2",
    card:     "#FFFFFF",
    cardAlt:  "#F7F2EE",
    overlay:  "rgba(26,18,8,.42)",
    navBg:    "#FFFFFF",
    inputBg:  "#FAFAF8",
    shadow:   "0 2px 16px rgba(224,123,57,.10)",
    shadowMd: "0 4px 28px rgba(224,123,57,.14)",
  },
  dark: {
    brand:    "#F0935A",
    brandDk:  "#D97040",
    brandLt:  "#2C1F14",
    brandMd:  "#3A2518",
    green:    "#34C875",
    greenLt:  "#0D2E1C",
    red:      "#F25C5C",
    redLt:    "#2E1010",
    text:     "#F4EDE6",
    textSub:  "#C4B8AE",
    sub:      "#8A7E74",
    border:   "#2E2520",
    bg:       "#111009",
    card:     "#1C1712",
    cardAlt:  "#221D18",
    overlay:  "rgba(0,0,0,.65)",
    navBg:    "#1C1712",
    inputBg:  "#221D18",
    shadow:   "0 2px 16px rgba(0,0,0,.40)",
    shadowMd: "0 4px 28px rgba(0,0,0,.50)",
  },
};

/* ─────────────────────────────────────────────────────────── */
/*  STATUS COLOUR MAPS                                         */
/* ─────────────────────────────────────────────────────────── */
export function statusStyle(s, theme) {
  const T = theme;
  const map = {
    "Assigned":         { bg: "#EEF2FF", color: "#3730A3" },
    "Picked Up":        { bg: T.brandLt, color: T.brand   },
    "Out for Delivery": { bg: T.brandLt, color: T.brand   },
    "Delivered":        { bg: T.greenLt, color: T.green   },
    "Cancelled":        { bg: T.redLt,   color: T.red     },
  };
  return map[s] || { bg: T.cardAlt, color: T.sub };
}

export function agentStatusStyle(s, theme) {
  const T = theme;
  if (s === "Available")    return { bg: T.greenLt, color: T.green, dot: T.green   };
  if (s === "On Delivery")  return { bg: T.brandLt, color: T.brand, dot: T.brand   };
  return                           { bg: T.cardAlt,  color: T.sub,   dot: "#666"    };
}

/* ─────────────────────────────────────────────────────────── */
/*  HELPERS                                                    */
/* ─────────────────────────────────────────────────────────── */
export function fmt(n) {
  return `₹${Number(n ?? 0).toLocaleString("en-IN")}`;
}

export function shortId(id) {
  return "#" + String(id ?? "").slice(-8).toUpperCase();
}

export function todayRange() {
  const s = new Date(); s.setHours(0, 0, 0, 0);
  const e = new Date(); e.setHours(23, 59, 59, 999);
  return { s, e };
}

/* ─────────────────────────────────────────────────────────── */
/*  BUTTON / FIELD STYLE FACTORIES                            */
/* ─────────────────────────────────────────────────────────── */
export function makeBtn(T) {
  return {
    primary: {
      background: T.brand, color: "#fff", border: "none", borderRadius: "14px",
      padding: "13px 20px", fontSize: "14px", fontWeight: "700", cursor: "pointer",
      width: "100%", marginTop: "10px", letterSpacing: "0.2px",
    },
    ghost: {
      background: "none", border: `1px solid ${T.border}`, borderRadius: "12px",
      padding: "10px", fontSize: "13px", color: T.sub, cursor: "pointer",
      width: "100%", marginTop: "10px",
    },
    danger: {
      background: T.redLt, color: T.red, border: `1px solid ${T.red}30`,
      borderRadius: "12px", padding: "10px 14px", fontSize: "12px",
      fontWeight: "700", cursor: "pointer",
    },
    warn: {
      background: T.brandLt, color: T.brand, border: `1px solid ${T.brand}30`,
      borderRadius: "12px", padding: "10px 14px", fontSize: "12px",
      fontWeight: "700", cursor: "pointer",
    },
  };
}

export function makeField(T) {
  return {
    label: {
      fontSize: "11px", fontWeight: "700", color: T.sub,
      display: "block", marginBottom: "6px", letterSpacing: "0.5px",
    },
    input: {
      width: "100%", padding: "11px 14px", borderRadius: "12px",
      border: `1.5px solid ${T.border}`, fontSize: "14px",
      fontFamily: "inherit", boxSizing: "border-box", outline: "none",
      background: T.inputBg, marginBottom: "14px", color: T.text,
    },
    textarea: {
      width: "100%", padding: "11px 14px", borderRadius: "12px",
      border: `1.5px solid ${T.border}`, fontSize: "14px",
      fontFamily: "inherit", boxSizing: "border-box", resize: "vertical",
      background: T.inputBg, marginBottom: "14px", color: T.text,
    },
  };
}