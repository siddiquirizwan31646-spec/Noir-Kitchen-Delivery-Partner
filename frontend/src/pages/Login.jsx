import { useState } from "react";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .dl-root {
    min-height: 100vh;
    display: flex;
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: #fdf6f0;
  }

  /* ── LEFT PANEL ── */
  .dl-left {
    width: 420px;
    flex-shrink: 0;
    background: linear-gradient(160deg, #1a0e08 0%, #2d1810 50%, #1a0e08 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 40px;
    position: relative;
    overflow: hidden;
  }

  .dl-left::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 60% 40% at 30% 20%, rgba(196,81,10,0.18) 0%, transparent 70%),
      radial-gradient(ellipse 50% 50% at 80% 80%, rgba(196,81,10,0.10) 0%, transparent 70%);
    pointer-events: none;
  }

  .dl-left-inner {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
    width: 100%;
  }

  .dl-logo {
    width: 90px;
    height: 90px;
    border-radius: 50%;
    object-fit: cover;
    border: 2.5px solid rgba(196,81,10,0.5);
    box-shadow: 0 0 0 6px rgba(196,81,10,0.10), 0 8px 32px rgba(0,0,0,0.4);
    margin-bottom: 22px;
  }

  .dl-brand {
    font-family: 'Cormorant Garamond', serif;
    font-size: 36px;
    font-weight: 700;
    letter-spacing: 0.04em;
    line-height: 1;
    margin-bottom: 4px;
    text-align: center;
  }
  .dl-brand-dark   { color: #fff; }
  .dl-brand-accent { color: #C4510A; }

  .dl-tagline {
    font-size: 11px;
    color: rgba(255,255,255,0.45);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 48px;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  .dl-divider {
    width: 100%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(196,81,10,0.4), transparent);
    margin-bottom: 40px;
  }

  .dl-features {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 100%;
  }

  .dl-feature {
    display: flex;
    align-items: flex-start;
    gap: 14px;
  }

  .dl-feature-dot {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    background: rgba(196,81,10,0.15);
    border: 1px solid rgba(196,81,10,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    flex-shrink: 0;
  }

  .dl-feature-text p {
    font-size: 13px;
    font-weight: 700;
    color: #fff;
    margin-bottom: 2px;
  }
  .dl-feature-text span {
    font-size: 11px;
    color: rgba(255,255,255,0.42);
    line-height: 1.4;
  }

  .dl-left-footer {
    position: absolute;
    bottom: 24px;
    font-size: 10px;
    color: rgba(255,255,255,0.2);
    letter-spacing: 0.06em;
  }

  /* ── RIGHT PANEL ── */
  .dl-right {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 24px;
    background: linear-gradient(135deg, #fdf6f0 0%, #fff8f4 60%, #fef3eb 100%);
  }

  .dl-card {
    width: 100%;
    max-width: 400px;
  }

  .dl-card-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 30px;
    font-weight: 700;
    color: #1A1208;
    margin-bottom: 6px;
    line-height: 1.15;
  }

  .dl-card-sub {
    font-size: 13px;
    color: #9A8570;
    margin-bottom: 28px;
    line-height: 1.5;
  }

  .dl-google-wrap {
    display: flex;
    justify-content: center;
    margin-bottom: 22px;
  }
  .dl-google-wrap > div,
  .dl-google-wrap iframe {
    width: 100% !important;
  }

  /* OR divider */
  .dl-or {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 22px;
  }
  .dl-or hr {
    flex: 1;
    border: none;
    border-top: 1px solid rgba(196,81,10,0.15);
  }
  .dl-or span {
    font-size: 11px;
    color: #C4A882;
    font-weight: 600;
    letter-spacing: 0.06em;
    white-space: nowrap;
  }

  /* Form */
  .dl-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .dl-label {
    display: block;
    font-size: 11px;
    font-weight: 700;
    color: #9A8570;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 6px;
  }

  .dl-input {
    width: 100%;
    padding: 12px 14px;
    border: 1.5px solid rgba(196,81,10,0.2);
    border-radius: 12px;
    font-size: 14px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    outline: none;
    background: #fff;
    color: #1A1208;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .dl-input:focus {
    border-color: #C4510A;
    box-shadow: 0 0 0 3px rgba(196,81,10,0.1);
  }
  .dl-input::placeholder { color: #C4A882; }

  .dl-otp-input {
    letter-spacing: 10px;
    text-align: center;
    font-size: 20px;
    font-weight: 700;
    font-family: 'Cormorant Garamond', serif;
  }

  .dl-btn {
    width: 100%;
    padding: 13px;
    background: linear-gradient(135deg, #C4510A, #E8763A);
    color: #fff;
    border: none;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 700;
    font-family: 'Plus Jakarta Sans', sans-serif;
    cursor: pointer;
    box-shadow: 0 8px 22px rgba(196,81,10,0.32);
    transition: all 0.22s;
    letter-spacing: 0.02em;
  }
  .dl-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 12px 28px rgba(196,81,10,0.42);
  }
  .dl-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .dl-error {
    font-size: 12px;
    color: #A32D2D;
    background: #FEF2F2;
    border: 1px solid rgba(220,38,38,0.2);
    padding: 10px 12px;
    border-radius: 10px;
  }

  .dl-sent-info {
    font-size: 12px;
    color: #9A8570;
    line-height: 1.5;
    background: rgba(196,81,10,0.05);
    border: 1px solid rgba(196,81,10,0.12);
    padding: 10px 14px;
    border-radius: 10px;
  }
  .dl-sent-info strong { color: #C4510A; }

  .dl-link-btn {
    border: none;
    background: none;
    color: #C4510A;
    font-weight: 700;
    cursor: pointer;
    padding: 0;
    font-size: 12px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .dl-resend {
    text-align: center;
    font-size: 12px;
    color: #9A8570;
  }
  .dl-resend button {
    border: none;
    background: none;
    color: #C4510A;
    font-weight: 700;
    cursor: pointer;
    font-size: 12px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    margin-left: 4px;
  }
  .dl-resend button:disabled { opacity: 0.4; cursor: not-allowed; }

  /* ── RESPONSIVE ── */
  @media (max-width: 768px) {
    .dl-left { display: none; }
    .dl-right { padding: 32px 20px; }
  }
`;

function ErrorBox({ text }) {
  return <p className="dl-error">{text}</p>;
}

function LoginInner() {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSuccess = async (cred) => {
    setError("");
    try {
      const r = await fetch(`${API}/api/delivery-auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: cred.credential }),
      });
      const data = await r.json();
      if (!r.ok) return setError(data.message || "Login failed");
      localStorage.setItem("deliveryToken", data.token);
      navigate("/delivery/dashboard");
    } catch {
      setError("Something went wrong. Try again.");
    }
  };

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setError("");
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/delivery-auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await r.json();
      if (!r.ok) return setError(data.message || "Failed to send OTP");
      setStep("otp");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/delivery-auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await r.json();
      if (!r.ok) return setError(data.message || "Invalid OTP");
      localStorage.setItem("deliveryToken", data.token);
      navigate("/delivery/dashboard");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dl-root">
      <style>{CSS}</style>

      {/* ── LEFT PANEL ── */}
      <div className="dl-left">
        <div className="dl-left-inner">
          <img
            src="https://i.postimg.cc/hG4FkpbT/Chat-GPT-Image-Jun-6-2026-05-29-17-PM.png"
            alt="Noir Kitchen"
            className="dl-logo"
          />
          <div className="dl-brand">
            <span className="dl-brand-dark">NOIR </span>
            <span className="dl-brand-accent">KITCHEN</span>
          </div>
          <p className="dl-tagline">Delivery Partner Portal</p>

          <div className="dl-divider" />

          <div className="dl-features">
            {[
              { icon: "🛵", title: "Real-time Orders", desc: "Get order alerts the moment they're assigned to you" },
              { icon: "📍", title: "GPS Navigation", desc: "One-tap directions straight to the customer" },
              { icon: "💰", title: "Daily Earnings", desc: "Track your income and incentives in one place" },
              { icon: "📊", title: "Performance Stats", desc: "View your ratings and delivery history anytime" },
            ].map((f) => (
              <div className="dl-feature" key={f.title}>
                <div className="dl-feature-dot">{f.icon}</div>
                <div className="dl-feature-text">
                  <p>{f.title}</p>
                  <span>{f.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <span className="dl-left-footer">© 2026 NOIR KITCHEN · ALL RIGHTS RESERVED</span>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="dl-right">
        <div className="dl-card">

          {step === "email" ? (
            <>
              <h1 className="dl-card-title">Welcome back,<br />Partner 👋</h1>
              <p className="dl-card-sub">Sign in to access your delivery dashboard and start earning.</p>

              <div className="dl-google-wrap">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError("Google sign-in failed")}
                />
              </div>

              <div className="dl-or">
                <hr /><span>or continue with email</span><hr />
              </div>

              <form onSubmit={handleSendOtp} className="dl-form">
                <div>
                  <label className="dl-label">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="dl-input"
                  />
                </div>
                {error && <ErrorBox text={error} />}
                <button type="submit" disabled={loading} className="dl-btn">
                  {loading ? "Sending code…" : "Send OTP →"}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="dl-card-title">Check your<br />inbox ✉️</h1>
              <p className="dl-card-sub">Enter the 6-digit code we sent to confirm your identity.</p>

              <div className="dl-sent-info" style={{ marginBottom: "20px" }}>
                Code sent to <strong>{email}</strong>.{" "}
                <button
                  type="button"
                  onClick={() => { setStep("email"); setOtp(""); setError(""); }}
                  className="dl-link-btn"
                >
                  Change email
                </button>
              </div>

              <form onSubmit={handleVerifyOtp} className="dl-form">
                <div>
                  <label className="dl-label">One-Time Password</label>
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="——————"
                    className={`dl-input dl-otp-input`}
                  />
                </div>
                {error && <ErrorBox text={error} />}
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="dl-btn"
                >
                  {loading ? "Verifying…" : "Verify & Sign In →"}
                </button>
                <p className="dl-resend">
                  Didn't receive it?
                  <button type="button" onClick={handleSendOtp} disabled={loading}>
                    Resend code
                  </button>
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DeliveryLogin() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <LoginInner />
    </GoogleOAuthProvider>
  );
}