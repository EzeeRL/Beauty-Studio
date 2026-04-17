const ToastNotification = ({
  message = "✅ Horario guardado correctamente",
}) => (
  <div
    style={{
      position: "fixed",
      bottom: "20px",
      right: "20px",
      backgroundColor: "#4CAF50",
      color: "white",
      padding: "12px 20px",
      borderRadius: "6px",
      boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
      zIndex: 9999,
      animation: "fadeInUp 0.3s ease",
    }}
  >
    {message}
  </div>
);

export default ToastNotification;
