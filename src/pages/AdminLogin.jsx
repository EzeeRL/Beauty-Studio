import { useState } from "react";
import { loginAdmin } from "../utils/adminApi";
import "./Loguin.css";

const AdminLogin = ({ onSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginAdmin(email, password);
      onSuccess();
    } catch (err) {
      console.error("❌ Error en login de admin:", err);
      setError(
        err.response?.status === 401
          ? "Email o contraseña incorrectos."
          : "No se pudo iniciar sesión. Probá de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lg-page">
      <div className="lg-card">
        <div className="lg-side">
          <span className="lg-ring lg-r1"></span>
          <span className="lg-ring lg-r2"></span>
          <span className="lg-ring lg-r3"></span>
          <div className="lg-brand">
            <img src="/logo.png" alt="Logo D´Art" className="lg-logo" />
            <span>D´Art</span>
          </div>
          <h4 className="lg-tagline">Panel de control</h4>
          <p className="lg-side-text">Acceso exclusivo para administración.</p>
        </div>

        <form onSubmit={handleSubmit} className="lg-form">
          <h2 className="lg-title">Ingreso admin</h2>
          <p className="lg-sub">Ingresá con tu email y contraseña de admin</p>

          <div className="lg-field">
            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M3 7l9 6 9-6" />
            </svg>
          </div>

          <div className="lg-field">
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="11" width="16" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
          </div>

          {error && <p className="lg-error">{error}</p>}

          <button type="submit" className="lg-btn" disabled={loading}>
            {loading ? "Ingresando..." : "Entrar"}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
