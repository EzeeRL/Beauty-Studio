import { useMemo, useState } from "react";
import { subDays } from "date-fns";
import { Card, Segmentado, BarrasLista } from "./ui";
import {
  estadisticasServicios,
  ingresosAgrupados,
  enRango,
  formatoPesos,
} from "../../utils/metricas";

const PERIODOS = [
  { id: "90", label: "Últimos 90 días" },
  { id: "todo", label: "Todo" },
];

const COLUMNAS = [
  { id: "nombre", label: "Servicio" },
  { id: "porHora", label: "$/hora" },
  { id: "price", label: "Precio" },
  { id: "duration", label: "Min" },
  { id: "cantidad", label: "Turnos" },
];

const medianaDe = (nums) => {
  const o = [...nums].sort((a, b) => a - b);
  return o.length ? o[Math.floor(o.length / 2)] : 0;
};

const ServiciosTab = ({ appointments }) => {
  const [periodo, setPeriodo] = useState("90");
  const [ranking, setRanking] = useState("cantidad");
  const [agrupar, setAgrupar] = useState("especialidad");
  const [orden, setOrden] = useState("porHora");

  const turnos = useMemo(() => {
    if (periodo === "todo") return appointments;
    const hoy = new Date();
    return enRango(appointments, subDays(hoy, 90), hoy);
  }, [appointments, periodo]);

  const servicios = useMemo(() => estadisticasServicios(turnos), [turnos]);

  const rankingItems = useMemo(
    () =>
      [...servicios]
        .sort((a, b) => b[ranking] - a[ranking])
        .map((s) => ({
          clave: s.id,
          nombre: s.nombre,
          valor: s[ranking],
          sub:
            ranking === "cantidad"
              ? `${formatoPesos(s.total)} generados`
              : `${s.cantidad} turnos · ${formatoPesos(s.total / s.cantidad)} por turno`,
        })),
    [servicios, ranking],
  );

  const agrupados = useMemo(
    () =>
      ingresosAgrupados(turnos, agrupar).map((g) => ({
        nombre: g.nombre,
        valor: g.total,
      })),
    [turnos, agrupar],
  );

  // Muy pedidos pero con $/hora bajo: candidatos a ajustar precio
  const tabla = useMemo(() => {
    const medCant = medianaDe(servicios.map((s) => s.cantidad));
    const medHora = medianaDe(servicios.map((s) => s.porHora));
    return [...servicios]
      .map((s) => ({
        ...s,
        revisar: s.cantidad > medCant && s.porHora < medHora,
      }))
      .sort((a, b) =>
        orden === "nombre"
          ? a.nombre.localeCompare(b.nombre)
          : b[orden] - a[orden],
      );
  }, [servicios, orden]);

  return (
    <div className="ing-grid dos">
      <div className="ing-ancho">
        <Segmentado opciones={PERIODOS} valor={periodo} onChange={setPeriodo} />
      </div>

      <Card
        titulo="Servicios más fuertes"
        sub={ranking === "cantidad" ? "Por cantidad de turnos" : "Por plata generada"}
        accion={
          <Segmentado
            opciones={[
              { id: "cantidad", label: "Turnos" },
              { id: "total", label: "$" },
            ]}
            valor={ranking}
            onChange={setRanking}
          />
        }
      >
        {rankingItems.length === 0 ? (
          <p className="ing-vacio">Sin turnos en el período.</p>
        ) : (
          <BarrasLista
            items={rankingItems}
            limite={10}
            formato={ranking === "cantidad" ? (v) => v : formatoPesos}
          />
        )}
      </Card>

      <Card
        titulo="Ingresos por área"
        accion={
          <Segmentado
            opciones={[
              { id: "especialidad", label: "Especialidad" },
              { id: "experta", label: "Experta" },
            ]}
            valor={agrupar}
            onChange={setAgrupar}
          />
        }
      >
        {agrupados.length === 0 ? (
          <p className="ing-vacio">Sin turnos en el período.</p>
        ) : (
          <BarrasLista items={agrupados} formato={formatoPesos} />
        )}
      </Card>

      <Card
        ancho
        titulo="Ingreso por hora de trabajo"
        sub="Precio ÷ duración del servicio. Tocá una columna para ordenar."
      >
        {tabla.length === 0 ? (
          <p className="ing-vacio">Sin turnos en el período.</p>
        ) : (
          <div className="ing-tabla-wrap">
            <table className="ing-tabla">
              <thead>
                <tr>
                  {COLUMNAS.map((c) => (
                    <th
                      key={c.id}
                      className={orden === c.id ? "orden" : ""}
                      onClick={() => setOrden(c.id)}
                    >
                      {c.label}
                      {orden === c.id && " ↓"}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tabla.map((s) => (
                  <tr key={s.id}>
                    <td>
                      {s.nombre}
                      {s.revisar && <span className="ing-tag">revisar precio</span>}
                      <span className="chico">{s.especialidad}</span>
                    </td>
                    <td>
                      <strong>{formatoPesos(s.porHora)}</strong>
                    </td>
                    <td>{formatoPesos(s.price)}</td>
                    <td>{s.duration}</td>
                    <td>{s.cantidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="ing-nota">
          <span className="ing-tag" style={{ marginLeft: 0 }}>revisar precio</span>{" "}
          = se pide más que la media pero deja menos por hora que la media. Son los
          primeros candidatos para subir el precio; los de $/hora alto conviene
          promocionarlos.
        </p>
      </Card>
    </div>
  );
};

export default ServiciosTab;
