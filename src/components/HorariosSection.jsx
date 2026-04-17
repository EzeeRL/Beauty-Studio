import { format } from "date-fns";
import HorarioManager from "./HorarioManager";

const HorariosSection = ({
  selectedDate,
  setSelectedDate,
  startHour,
  setStartHour,
  endHour,
  setEndHour,
  expertId,
  setExpertId,
  experts,
  workingHours,
  onSave,
}) => {
  const selectedKey = format(new Date(selectedDate), "yyyy-MM-dd");
  const horario = workingHours[selectedKey];

  return (
    <section className="schedule-config">
      <h2>Configurar horario de atención</h2>

      <div className="inputs-row">
        {/* Fecha */}
        <div className="input-group">
          <label htmlFor="date">Fecha</label>
          <input
            id="date"
            type="date"
            value={format(new Date(selectedDate), "yyyy-MM-dd")}
            onChange={(e) => {
              const parts = e.target.value.split("-");
              const selected = new Date(parts[0], parts[1] - 1, parts[2]);
              setSelectedDate(selected);
            }}
          />
        </div>

        {/* Inicio */}
        <div className="input-group">
          <label htmlFor="start">Inicio</label>
          <input
            id="start"
            type="time"
            value={startHour}
            onChange={(e) => setStartHour(e.target.value)}
          />
        </div>

        {/* Cierre */}
        <div className="input-group">
          <label htmlFor="end">Cierre</label>
          <input
            id="end"
            type="time"
            value={endHour}
            onChange={(e) => setEndHour(e.target.value)}
          />
        </div>

        {/* Experto */}
        <div className="input-group">
          <label className="input-label" htmlFor="expertId">
            Experto
          </label>
          <div className="select-wrapper">
            <select
              id="expertId"
              className="custom-select"
              value={expertId}
              onChange={(e) => setExpertId(e.target.value)}
            >
              <option value="">Seleccionar experto</option>
              {experts.map((expert) => (
                <option key={expert.id} value={expert.id}>
                  {expert.name} ({expert.specialty})
                </option>
              ))}
            </select>
            <svg
              className="select-arrow"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#888"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
      </div>

      <button className="btn-save" onClick={onSave}>
        Guardar
      </button>

      <p className="horario-text">
        Horario para {format(new Date(selectedDate), "dd/MM/yyyy")}:{" "}
        {horario?.start || "No definido"} - {horario?.end || "No definido"}
      </p>

      <HorarioManager />
    </section>
  );
};

export default HorariosSection;
