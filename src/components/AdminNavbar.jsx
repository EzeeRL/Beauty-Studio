import {
  CalendarDays,
  Clock,
  BarChart3,
  Sparkles,
  MessageCircle,
  ShoppingBag,
  Ticket,
  Bell,
} from "lucide-react";

const TABS = [
  { key: "turnos", icon: CalendarDays, title: "Turnos" },
  { key: "horarios", icon: Clock, title: "Horarios" },
  { key: "ingresos", icon: BarChart3, title: "Ingresos" },
  { key: "admin", icon: Sparkles, title: "Servicios" },
  { key: "coment", icon: MessageCircle, title: "Comentarios" },
  { key: "products", icon: ShoppingBag, title: "Productos" },
  { key: "cupones", icon: Ticket, title: "Cupones" },
  { key: "notificaciones", icon: Bell, title: "Notificaciones" },
];

const AdminNavbar = ({ activeTab, setActiveTab }) => (
  <nav className="admin-nav">
    <div className="nav-logo">Panel Control</div>
    {TABS.map(({ key, icon: Icon, title }) => (
      <button
        key={key}
        onClick={() => setActiveTab(key)}
        className={activeTab === key ? "nav-btn active" : "nav-btn"}
      >
        <span className="nav-icon">
          <Icon strokeWidth={2} />
        </span>
        <span className="nav-text">{title}</span>
      </button>
    ))}
  </nav>
);

export default AdminNavbar;
