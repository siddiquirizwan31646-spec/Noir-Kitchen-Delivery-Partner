/* ─────────────────────────────────────────────────────────── */
/*  ICON COMPONENTS (inline SVG, zero deps)                   */
/* ─────────────────────────────────────────────────────────── */

export const HomeIcon = ({ size = 20, color = "#888" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z" fill={color} />
  </svg>
);

export const OrdersIcon = ({ size = 20, color = "#888" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="18" height="18" rx="3" stroke={color} strokeWidth="2" fill="none" />
    <path d="M7 8H17M7 12H14M7 16H11" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const EarningsIcon = ({ size = 20, color = "#888" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" fill="none" />
    <path d="M12 7V12" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M8 11H16" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M9.5 14.5C9.5 14.5 10.5 16 12 16C13.5 16 14.5 15 14.5 14C14.5 13 13.5 12.5 12 12.5C10.5 12.5 9.5 12 9.5 11C9.5 10 10.5 9 12 9C13.5 9 14.5 10 14.5 10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const ProfileIcon = ({ size = 20, color = "#888" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2" fill="none" />
    <path d="M4 20C4 17 7.6 15 12 15C16.4 15 20 17 20 20" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const BellIcon = ({ size = 20, color = "#888", badge = 0 }) => (
  <div style={{ position: "relative", display: "inline-flex" }}>
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={color} strokeWidth="2" fill="none" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={color} strokeWidth="2" />
    </svg>
    {badge > 0 && (
      <span style={{
        position: "absolute", top: "-4px", right: "-4px",
        background: "#E53935", color: "#fff", fontSize: "9px", fontWeight: "800",
        borderRadius: "50%", width: "16px", height: "16px",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {badge > 9 ? "9+" : badge}
      </span>
    )}
  </div>
);

export const PhoneIcon = ({ size = 16, color = "#E07B39" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.3 1L6.6 10.8z" fill={color} />
  </svg>
);

export const MapPinIcon = ({ size = 14, color = "#E07B39" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5c-1.4 0-2.5-1.1-2.5-2.5S10.6 6.5 12 6.5 14.5 7.6 14.5 9 13.4 11.5 12 11.5z" fill={color} />
  </svg>
);

export const CopyIcon = ({ size = 14, color = "#9E9087" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="9" y="9" width="13" height="13" rx="2" stroke={color} strokeWidth="2" fill="none" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke={color} strokeWidth="2" />
  </svg>
);

export const ChevronRightIcon = ({ size = 16, color = "#9E9087" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M9 18L15 12L9 6" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

export const StarIcon = ({ size = 14, color = "#F59E0B", filled = true }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path
      d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 18l-6.2 3.1 1.2-6.9-5-4.9 6.9-1z"
      fill={filled ? color : "none"} stroke={color} strokeWidth="2"
    />
  </svg>
);

export const SunIcon = ({ size = 18, color = "#E07B39" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="5" stroke={color} strokeWidth="2" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const MoonIcon = ({ size = 18, color = "#E07B39" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke={color} strokeWidth="2" fill="none" />
  </svg>
);

export const TruckIcon = ({ size = 20, color = "#E07B39" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="1" y="7" width="15" height="10" rx="1" stroke={color} strokeWidth="2" fill="none" />
    <path d="M16 10h4l3 3v4h-7V10z" stroke={color} strokeWidth="2" fill="none" />
    <circle cx="5.5" cy="17.5" r="1.5" fill={color} />
    <circle cx="18.5" cy="17.5" r="1.5" fill={color} />
  </svg>
);