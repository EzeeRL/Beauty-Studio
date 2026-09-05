import { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import "./NotificationsSection.css";

const API = "https://eve-back.vercel.app";

const NotificationsSection = () => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await axios.get(`${API}/notifications`);
      const sorted = [...res.data].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
      setHistory(sorted);
    } catch (err) {
      console.error("Error al cargar notificaciones enviadas:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const canSend = title.trim() !== "" && body.trim() !== "" && !sending;

  const handleSend = async () => {
    if (!canSend) return;

    const confirmar = window.confirm(
      "Se enviará esta notificación a todos los usuarios. ¿Confirmás el envío?",
    );
    if (!confirmar) return;

    setSending(true);
    try {
      await axios.post(`${API}/notifications/broadcast`, {
        title: title.trim(),
        body: body.trim(),
      });
      showToast("✅ Notificación enviada.");
      setTitle("");
      setBody("");
      fetchHistory();
    } catch (err) {
      console.error("Error al enviar notificación:", err);
      showToast("❌ No se pudo enviar la notificación.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="notifications-section section-card">
      <h2>🔔 Notificaciones</h2>
      <p className="notifications-subtitle">
        Enviá una notificación push a todos los usuarios con la app instalada.
      </p>

      <div className="notifications-form">
        <div className="input-group">
          <label htmlFor="notif-title">Título</label>
          <input
            id="notif-title"
            className="modern-input"
            placeholder="Ej. ¡Buenas noticias!"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={65}
          />
        </div>

        <div className="input-group">
          <label htmlFor="notif-body">Descripción</label>
          <textarea
            id="notif-body"
            className="modern-input"
            placeholder="Ej. Descuento con código EVE"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            maxLength={180}
          />
        </div>

        <button
          className="notif-send-btn"
          onClick={handleSend}
          disabled={!canSend}
        >
          {sending ? "Enviando..." : "📤 Enviar notificación"}
        </button>
      </div>

      <div className="notifications-preview">
        <span className="notifications-preview-label">Vista previa en celular</span>

        <div className="phone-notification">
          <div className="phone-notification-header">
            <img src="/logo.png" alt="" className="phone-notification-icon" />
            <span className="phone-notification-app">D´Art</span>
            <span className="phone-notification-time">ahora</span>
          </div>
          <div className="phone-notification-body">
            <strong className="phone-notification-title">
              {title.trim() || "Título de la notificación"}
            </strong>
            <p className="phone-notification-text">
              {body.trim() || "Acá va a aparecer la descripción del mensaje."}
            </p>
          </div>
        </div>
      </div>

      <div className="notifications-history">
        <span className="notifications-preview-label">Notificaciones enviadas</span>

        {loadingHistory ? (
          <p className="notif-history-empty">Cargando...</p>
        ) : history.length === 0 ? (
          <p className="notif-history-empty">Todavía no se envió ninguna notificación.</p>
        ) : (
          <div className="notif-history-list">
            {history.map((n) => (
              <div key={n.id} className="notif-history-item">
                <div className="notif-history-item-header">
                  <strong className="notif-history-item-title">{n.title}</strong>
                  <span className="notif-history-item-date">
                    {format(new Date(n.createdAt), "dd/MM/yyyy HH:mm")}
                  </span>
                </div>
                <p className="notif-history-item-body">{n.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {toastMsg && <div className="notif-toast">{toastMsg}</div>}
    </section>
  );
};

export default NotificationsSection;
