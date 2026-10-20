// Piezas visuales compartidas por todas las pestañas de Ingresos
export const Card = ({ titulo, sub, accion, ancho, children }) => (
  <section className={`ing-card ${ancho ? "ing-ancho" : ""}`}>
    {(titulo || accion) && (
      <div className="ing-card-head">
        <div>
          <h3 className="ing-card-title">{titulo}</h3>
          {sub && <p className="ing-card-sub">{sub}</p>}
        </div>
        {accion}
      </div>
    )}
    {children}
  </section>
);

export const Delta = ({ valor, sufijo = "vs. mes anterior" }) => {
  if (valor == null) return <span className="ing-kpi-extra">Sin datos del mes anterior</span>;
  const redondeado = Math.round(valor);
  const clase = redondeado > 0 ? "up" : redondeado < 0 ? "down" : "";
  const flecha = redondeado > 0 ? "▲" : redondeado < 0 ? "▼" : "=";
  return (
    <span className="ing-kpi-extra">
      <span className={`ing-delta ${clase}`}>
        {flecha} {Math.abs(redondeado)}%
      </span>{" "}
      {sufijo}
    </span>
  );
};

export const Segmentado = ({ opciones, valor, onChange }) => (
  <div className="ing-seg" role="tablist">
    {opciones.map((o) => (
      <button
        key={o.id}
        type="button"
        className={valor === o.id ? "activo" : ""}
        onClick={() => onChange(o.id)}
      >
        {o.label}
      </button>
    ))}
  </div>
);

export const Leyenda = ({ items }) => (
  <ul className="ing-leyenda">
    {items.map((i) => (
      <li key={i.nombre}>
        <span className="ing-punto" style={{ background: i.color }} />
        {i.nombre}
      </li>
    ))}
  </ul>
);

// Ranking en filas: nombre, valor y una barra proporcional al máximo
export const BarrasLista = ({ items, formato, max, color, limite }) => {
  const visibles = limite ? items.slice(0, limite) : items;
  const tope = max ?? Math.max(1, ...visibles.map((i) => i.valor));
  return (
    <ol className="ing-barras">
      {visibles.map((i, idx) => (
        <li key={i.clave ?? i.nombre} className="ing-barra-fila">
          <span className="ing-barra-pos">{idx + 1}</span>
          <span className="ing-barra-nombre" title={i.nombre}>
            {i.nombre}
          </span>
          <span className="ing-barra-valor">{formato(i.valor)}</span>
          <span className="ing-barra-track">
            <span
              className="ing-barra-fill"
              style={{
                display: "block",
                width: `${(i.valor / tope) * 100}%`,
                background: i.color ?? color,
              }}
            />
          </span>
          {i.sub && <span className="ing-barra-sub">{i.sub}</span>}
        </li>
      ))}
    </ol>
  );
};
