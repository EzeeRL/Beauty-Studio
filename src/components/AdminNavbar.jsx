const TABS = [
  { key: "turnos", icon: "📅", title: "Turnos" },
  { key: "horarios", icon: "🕒", title: "Horarios" },
  { key: "ingresos", icon: "📊", title: "Ingresos" },
  { key: "admin", icon: "🛠️", title: "Servicios" },
  { key: "coment", icon: "💬", title: "Comentarios" },
  { key: "products", icon: "💳", title: "Productos" },
  { key: "cupones", icon: "🎟️", title: "Cupones" },
];

const AdminNavbar = ({ activeTab, setActiveTab }) => (
  <nav className="admin-nav">
    <div className="nav-logo">Panel Control</div>
    {TABS.map(({ key, icon, title }) => (
      <button
        key={key}
        onClick={() => setActiveTab(key)}
        className={activeTab === key ? "nav-btn active" : "nav-btn"}
      >
        <span className="nav-icon">{icon}</span>
        <span className="nav-text">{title}</span>
      </button>
    ))}
  </nav>
);

export default AdminNavbar;
