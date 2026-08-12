import { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import { format } from "date-fns";
import "./imagenGenerador.css";

const TurnosImageGenerator = () => {
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [modalVisible, setModalVisible] = useState(false);
  const imageRef = useRef();

  const fetchHorarios = async (fecha) => {
    setLoading(true);
    try {
      const res = await fetch(`https://eve-back.vercel.app/hours/available?date=${fecha}`);
      const data = await res.json();
      setHorariosDisponibles(data.availableSlots || []);
    } catch (err) {
      console.error("❌ Error cargando horarios:", err);
      setHorariosDisponibles([]);
    } finally {
      setLoading(false);
    }
  };

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

  const handleCopyText = () => {
    const texto = horariosDisponibles.length
      ? `📅 Turnos disponibles ${selectedDate}\n` +
        horariosDisponibles
          .map((slot) => `🕒 ${slot.start} - (${slot.expert?.specialty})`)
          .join("\n")
      : `📅 No hay turnos disponibles el ${selectedDate}`;

    navigator.clipboard.writeText(texto);

    setModalVisible(true);
    setTimeout(() => setModalVisible(false), 2000);
  };

  return (
    <section className="flyer-card">
      <h2 className="flyer-title">🖼️ Generador de flyer</h2>

      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        className="flyer-date-input"
      />

      {loading ? (
        <p className="flyer-loading">Cargando turnos...</p>
      ) : (
        <div ref={imageRef} className="flyer-preview">
          <div className="flyer-preview-overlay">
            <h3 className="flyer-preview-title">
              📅 Turnos disponibles {selectedDate}
            </h3>
            <ul className="flyer-preview-list">
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

      <div className="flyer-actions">
        <button className="flyer-btn flyer-btn-download" onClick={handleDownload}>
          📥 Descargar flyer
        </button>
        <button className="flyer-btn flyer-btn-copy" onClick={handleCopyText}>
          📋 Copiar texto
        </button>
      </div>

      <div className="flyer-text-preview">
        <h3 className="flyer-text-preview-title">Texto de los turnos</h3>
        <ul className="flyer-text-preview-list">
          {horariosDisponibles.length > 0 ? (
            horariosDisponibles.map((slot, idx) => (
              <li key={idx}>
                🕒 {slot.start} - ({slot.expert?.specialty})
              </li>
            ))
          ) : (
            <li className="flyer-text-preview-empty">No hay turnos disponibles</li>
          )}
        </ul>
      </div>

      {modalVisible && (
        <div className="flyer-toast-overlay">
          <div className="flyer-toast">✅ Horarios copiados exitosamente</div>
        </div>
      )}
    </section>
  );
};

export default TurnosImageGenerator;
