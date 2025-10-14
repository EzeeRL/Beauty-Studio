import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ServiceSection.css";
import useServicioStore from "../store/servicioStore";
import axios from "axios";

const ServiceSection = ({ title, services, isOpen, onToggle }) => {
  const setServicio = useServicioStore((state) => state.setServicio);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const navigate = useNavigate();
  const { datosCliente, setDatosCliente } = useServicioStore();

  const toggleDescription = (id) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    if (
      userId &&
      (!datosCliente?.nombre || !datosCliente?.email || !datosCliente?.telefono)
    ) {
      const fetchUser = async () => {
        try {
          const response = await axios.get(
            `https://eve-back.vercel.app/users/${userId}`
          );
          const user = response.data;
          setDatosCliente({
            nombre: user.name,
            email: user.email,
            telefono: user.phone,
          });
          console.log("🟢 Usuario cargado desde localStorage:", user);
        } catch (error) {
          console.error(
            "❌ Error al cargar usuario desde localStorage:",
            error
          );
        }
      };

      fetchUser();
    }
  }, [datosCliente, setDatosCliente]);

  // Orden específico para la categoría "Manicuria"
  const ordenDeseado = [
    "Semipermanente con nivelación",
    "Capping N'1/N'2",
    "Capping N'3",
    "Esculpidas en acrílico N1/2",
    "Esculpidas en acrílico N3",
    "Esculpidas en acrílico N4",
    "Soft gel N1/2/3",
    "Soft gel XXL N4/5/6",
    "Semipermanente en pies ",
  ];

  const ordenPestanas = [
    "Clasicas",
    "Efecto rímel",
    "V. Brasilero (2D)",
    "V. Hawaiano (3D)",
    "V. Hollywood (4D)",
    "V. Argentino (5D/6D)",
    "Capping mega 6D",
    "V. Ef foxy (2D/3D)",
    "Spire Lashes",
  ];

  const serviciosOrdenados =
    title === "Manicuria"
      ? ordenDeseado
          .map((nombre) => services.find((s) => s.name === nombre))
          .filter(Boolean)
      : title === "Pestañas"
      ? ordenPestanas
          .map((nombre) => services.find((s) => s.name === nombre))
          .filter(Boolean)
      : services;

  return (
    <div className="section">
      <div className="container-section-titles">
        <button className="section-title" onClick={onToggle}>
          <span>{title}</span>
          <span className="toggle-icon">{isOpen ? "−" : "+"}</span>
        </button>
      </div>

      {isOpen && (
        <div className="services-container">
          {serviciosOrdenados.map((service, idx) => {
            const isExpanded = expandedDescriptions[service.id];
            return (
              <div
                key={service.id}
                className="service-card"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <h3 className="service-name">{service.name}</h3>
                <p className="details-service">{service.duration} min</p>
                <p className="details-service">${service.price}</p>

                <p
                  className={`description ${
                    isExpanded ? "expanded" : "collapsed"
                  }`}
                >
                  {isExpanded
                    ? service.description
                    : service.description.slice(0, 158) +
                      (service.description.length > 200 ? "..." : "")}
                </p>

                {service.description.length > 100 && (
                  <button
                    className="toggle-description"
                    onClick={() => toggleDescription(service.id)}
                  >
                    <u>{isExpanded ? "Ver menos" : "Ver más"}</u>
                  </button>
                )}

                <div className="container-button">
                  <button
                    className="book-button"
                    onClick={() => {
                      setServicio(service);
                      navigate(
                        `/expertos/${encodeURIComponent(
                          service.name.toLowerCase()
                        )}`
                      );
                    }}
                  >
                    Agendar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ServiceSection;
