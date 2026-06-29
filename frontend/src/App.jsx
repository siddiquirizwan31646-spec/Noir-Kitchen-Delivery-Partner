import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Login from "./pages/Login";
import DeliveryDashboard from "./pages/DeliveryDashboard";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// 🔒 Blocks unauthenticated delivery agents
function ProtectedDeliveryRoute({ children }) {
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("deliveryToken");
    fetch(`${API}/api/delivery-auth/me`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => setAgent(data?.agent || null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ padding: "40px", textAlign: "center" }}>Loading…</p>;
  if (!agent) return <Navigate to="/delivery/login" replace />;
  return children;
}

// 🔁 Redirects already logged-in agents away from login page
function DeliveryPublicRoute({ children }) {
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("deliveryToken");
    fetch(`${API}/api/delivery-auth/me`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => setAgent(data?.agent || null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ padding: "40px", textAlign: "center" }}>Loading…</p>;
  if (agent) return <Navigate to="/delivery/dashboard" replace />;
  return children;
}

export default function App() {
  useEffect(() => {
    const block = (e) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key)) ||
        (e.ctrlKey && e.key === "U")
      ) {
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", block);
    return () => document.removeEventListener("keydown", block);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Admin Login */}
        <Route path="/login" element={
          <DeliveryPublicRoute>
            <Login />
          </DeliveryPublicRoute>
        } />

        <Route
          path="/delivery/login"
          element={
            <DeliveryPublicRoute>
              <Login />
            </DeliveryPublicRoute>
          }
        />
        <Route
          path="/delivery/dashboard"
          element={
            <ProtectedDeliveryRoute>
              <DeliveryDashboard />
            </ProtectedDeliveryRoute>
          }
        />

        {/* Redirect Root */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 404 Catch-All */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}