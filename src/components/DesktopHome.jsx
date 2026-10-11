import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useServicioStore from "../store/servicioStore";
import ComentarioList from "./ComentarioList";
import {
  ordenarServicios,
  imagenServicio,
  descripcionServicio,
  imagenCategoria,
} from "../utils/serviceDisplay";
import "./DesktopHome.css";

// Categorías que van como foto grande en el mosaico; el resto, como chips
const CATEGORIAS_MOSAICO = 4;

const DesktopHome = ({ services, categoryOrder }) => {
  const navigate = useNavigate();
  const setServicio = useServicioStore((state) => state.setServicio);
  const { datosCliente, setDatosCliente } = useServicioStore();

  const categorias = Object.keys(services).sort((a, b) => {
    const ia = categoryOrder.indexOf(a);
    const ib = categoryOrder.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  const [activa, setActiva] = useState(categorias[0]);
  const [busqueda, setBusqueda] = useState("");
  const [termino, setTermino] = useState("");
  const [expandidos, setExpandidos] = useState({});

  // Igual que ServiceSection: carga los datos de la clienta logueada para la reserva
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (
      userId &&
      (!datosCliente?.nombre || !datosCliente?.email || !datosCliente?.telefono)
    ) {
      axios
        .get(`https://eve-back.vercel.app/users/${userId}`)
        .then(({ data: user }) =>
          setDatosCliente({
            nombre: user.name,
            email: user.email,
            telefono: user.phone,
          }),
        )
        .catch((error) =>
          console.error(
            "❌ Error al cargar usuario desde localStorage:",
            error,
          ),
        );
    }
  }, [datosCliente, setDatosCliente]);

  const buscar = (e) => {
    e.preventDefault();
    setTermino(busqueda.trim());
    document
      .getElementById("dh-lista")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const elegirCategoria = (categoria) => {
    setActiva(categoria);
    setTermino("");
    setBusqueda("");
    setTimeout(() => {
      document
        .getElementById("dh-lista")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const agendar = (servicio) => {
    setServicio(servicio);
    navigate(`/expertos/${encodeURIComponent(servicio.name.toLowerCase())}`);
  };

  const listado = termino
    ? categorias.flatMap((c) =>
        services[c].filter((s) =>
          s.name.toLowerCase().includes(termino.toLowerCase()),
        ),
      )
    : ordenarServicios(activa, services[activa] || []);

  const mosaico = categorias.slice(0, CATEGORIAS_MOSAICO);
  const chips = categorias.slice(CATEGORIAS_MOSAICO);

  return (
    <div className="dh-page">
      {/* Portada */}
      <section className="dh-hero">
        <span className="dh-ring dh-r1"></span>
        <span className="dh-ring dh-r2"></span>
        <img className="dh-hero-wm" src="/logo.png" alt="" />
        <h1>D´ART</h1>
        <p>Elegí tu servicio y reservá online con tu especialista.</p>
        <form className="dh-search" onSubmit={buscar}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            type="text"
            placeholder="¿Qué te querés hacer hoy?"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              if (!e.target.value.trim()) setTermino("");
            }}
          />
          <button type="submit">Buscar</button>
        </form>
      </section>

      {/* Mosaico de categorías */}
      <div className="dh-tiles">
        {mosaico.map((categoria) => {
          const img = imagenCategoria(categoria, services[categoria]);
          return (
            <button
              type="button"
              key={categoria}
              className={`dh-tile ${!termino && activa === categoria ? "on" : ""} ${img ? "" : "no-photo"}`}
              onClick={() => elegirCategoria(categoria)}
            >
              {img ? (
                <img src={img} alt="" />
              ) : (
                <img className="dh-tile-wm" src="/logo.png" alt="" />
              )}
              <div>
                <b>{categoria}</b>
                <small>
                  {services[categoria].length}{" "}
                  {services[categoria].length === 1 ? "servicio" : "servicios"}
                </small>
              </div>
            </button>
          );
        })}
      </div>

      <div className="dh-chips">
        {chips.map((categoria) => (
          <button
            type="button"
            key={categoria}
            className={`dh-chip ${!termino && activa === categoria ? "on" : ""}`}
            onClick={() => elegirCategoria(categoria)}
          >
            {categoria}
          </button>
        ))}
        <button
          type="button"
          className="dh-chip"
          onClick={() => navigate("/productos")}
        >
          Productos →
        </button>
        <button
          type="button"
          className="dh-chip"
          onClick={() => navigate("/Cursos")}
        >
          Cursos →
        </button>
      </div>

      {/* Lista de precios */}
      <section className="dh-list" id="dh-lista">
        <h2>{termino ? `Resultados para “${termino}”` : activa}</h2>
        <small className="dh-list-sub">
          {termino
            ? `${listado.length} ${listado.length === 1 ? "servicio encontrado" : "servicios encontrados"}`
            : "Precios y duración por servicio"}
        </small>

        {listado.length === 0 && (
          <p className="dh-empty">No encontramos servicios con ese nombre.</p>
        )}

        {listado.map((servicio, idx) => {
          const img = imagenServicio(servicio);
          const descripcion = descripcionServicio(servicio);
          const abierta = expandidos[servicio.id];
          return (
            <div
              className="dh-row"
              key={servicio.id || servicio.name}
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              {img ? (
                <img className="dh-thumb" src={img} alt="" />
              ) : (
                <span className="dh-thumb dh-thumb-initial">
                  {servicio.name.trim()[0]}
                </span>
              )}
              <div className="dh-row-info">
                <h4>{servicio.name}</h4>
                <p className={abierta ? "open" : ""}>
                  {servicio.duration ? `${servicio.duration} min · ` : ""}
                  {descripcion}
                </p>
                {descripcion.length > 120 && (
                  <button
                    type="button"
                    className="dh-more"
                    onClick={() =>
                      setExpandidos((prev) => ({
                        ...prev,
                        [servicio.id]: !prev[servicio.id],
                      }))
                    }
                  >
                    {abierta ? "Ver menos" : "Ver más"}
                  </button>
                )}
              </div>
              <span className="dh-price">${servicio.price}</span>
              <button
                type="button"
                className="dh-book"
                onClick={() => agendar(servicio)}
              >
                Agendar
              </button>
            </div>
          );
        })}
      </section>

      <ComentarioList />
    </div>
  );
};

export default DesktopHome;
