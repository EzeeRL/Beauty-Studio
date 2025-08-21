import React, { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import { format } from "date-fns";

const TurnosImageGenerator = () => {
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  ); // Fecha inicial: hoy
  const imageRef = useRef();

  const fetchHorarios = async (fecha) => {
    setLoading(true);
    try {
      console.log("📅 Fecha de consulta:", fecha);

      const res = await fetch(
        `https://eve-back.vercel.app/hours/available?date=${fecha}`
      );
      console.log("🔗 Status de la petición:", res.status);

      const data = await res.json();
      console.log("📥 Respuesta cruda del backend:", data);

      setHorariosDisponibles(data.availableSlots || []);
    } catch (err) {
      console.error("❌ Error cargando horarios:", err);
      setHorariosDisponibles([]);
    } finally {
      setLoading(false);
    }
  };

  // 🚀 Traer horarios cada vez que cambia la fecha
  useEffect(() => {
    fetchHorarios(selectedDate);
  }, [selectedDate]);

  const handleDownload = async () => {
    if (!imageRef.current) return;

    const canvas = await html2canvas(imageRef.current, { useCORS: true });
    const dataURL = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = dataURL;
    link.download = `turnos_${selectedDate}.png`;
    link.click();
  };

  return (
    <div style={{ textAlign: "center", padding: "15px" }}>
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        style={{
          padding: "8px 12px",
          fontSize: "16px",
          marginBottom: "15px",
          borderRadius: "8px",
          border: "1px solid #ccc",
        }}
      />

      {loading ? (
        <p>Cargando turnos...</p>
      ) : (
        <div
          ref={imageRef}
          style={{
            width: "100%",
            maxWidth: "450px",
            aspectRatio: "9 / 16",
            position: "relative",
            backgroundImage: "url('/curso2.jpeg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: "20px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "6%",
            boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(0,0,0,0.55)",
              borderRadius: "15px",
              padding: "6%",
              textAlign: "center",
              width: "95%",
            }}
          >
            <h1
              style={{
                fontSize: "25px",
                color: "#ffde59",
                textShadow: "2px 2px 6px rgba(0,0,0,0.9)",
                marginBottom: "20px",
              }}
            >
              📅 Turnos disponibles {selectedDate}
            </h1>
            <ul
              style={{
                fontSize: "22px",
                lineHeight: "1.8",
                color: "#ffffff",
                fontWeight: "bold",
                textShadow: "2px 2px 6px rgba(0,0,0,0.9)",
                listStyle: "none",
                padding: 0,
                margin: 0,
              }}
            >
              {horariosDisponibles.length > 0 ? (
                horariosDisponibles.map((slot, idx) => (
                  <li key={idx}>
                    🕒 {slot.start} - ({slot.expert?.specialty})
                  </li>
                ))
              ) : (
                <li>No hay turnos disponibles</li>
              )}
            </ul>
          </div>
        </div>
      )}

      <button
        onClick={handleDownload}
        style={{
          marginTop: "20px",
          padding: "12px 28px",
          fontSize: "clamp(14px, 4vw, 18px)",
          cursor: "pointer",
          borderRadius: "12px",
          border: "none",
          background: "linear-gradient(90deg, #ff914d, #ffde59)",
          color: "#000",
          fontWeight: "bold",
          boxShadow: "0 6px 15px rgba(0,0,0,0.2)",
        }}
      >
        📥 Descargar flyer
      </button>
    </div>
  );
};

export default TurnosImageGenerator;
