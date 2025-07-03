import { useState, useEffect } from "react";
import "./Header.css";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // En tu Header.jsx
  // const { servicio, experto, fecha, datosCliente } = useServicioStore();

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMenuOpen]);

  return (
    <>
      <header className="header">
        <div className="logo-container">
          <img
            src="/logo.png"
            alt="Logo del salón"
            className="logo"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/public/logo.png"; // Ruta alternativa en caso de error
            }}
          />
        </div>

        <button
          className={`menu-button ${isMenuOpen ? "open" : ""}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Menú"
        >
          <div className="menu-icon">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
      </header>

      {/* Overlay y menú lateral */}
      <div
        className={`menu-overlay ${isMenuOpen ? "active" : ""}`}
        onClick={() => setIsMenuOpen(false)}
      ></div>

      <nav className={`side-menu ${isMenuOpen ? "open" : ""}`}>
        <button
          className="close-menu-button"
          onClick={() => setIsMenuOpen(false)}
          aria-label="Cerrar menú"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6L6 18" />
            <path d="M6 6l12 12" />
          </svg>
        </button>

        <div className="menu-content">
          <a
            href="#payment-methods"
            className="menu-item"
            onClick={() => setIsMenuOpen(false)}
          >
            Métodos de Pago
          </a>
          <a
            href="#location"
            className="menu-item"
            onClick={() => setIsMenuOpen(false)}
          >
            Dónde nos ubicamos
          </a>
          <a
            href="/"
            className="menu-item"
            onClick={() => setIsMenuOpen(false)}
          >
            Mi perfil
          </a>
        </div>
      </nav>
    </>
  );
};

export default Header;
