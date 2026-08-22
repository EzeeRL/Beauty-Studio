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
            `https://eve-back.vercel.app/users/${userId}`,
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
            error,
          );
        }
      };

      fetchUser();
    }
  }, [datosCliente, setDatosCliente]);

  // Orden específico para la categoría "Manicuria"
  const ordenDeseado = [
    "Semipermanente con nivelación",
    "Capping ", // En la búsqueda usaremos .trim() para ignorar si el backend manda "Capping " con espacio
    "Esculpidas en acrílico N1 o 2",
    "Esculpidas en acrílico N3",
    "Esculpidas en acrílico N4",
    "Soft gel",
    "Soft gel XL",
    "Semipermanente en pies",
    "Set nuevo + retiro.",
  ];

  const ordenPestanas = [
    "Clasicas",
    "Efecto rímel",
    "V. Brasilero (2D)",
    "V. Hawaiano (3D)",
    "V. Hollywood (4D)",
    "V. Argentino (5D)",
    "Capping mega 6D",
    "Volumen tech marrones",
    "V. Ef foxy (2D/3D)",
    "Spire Lashes",
  ];

  // 1. Obtener servicios en el orden deseado
  const serviciosEnOrden =
    title === "Manicuria"
      ? ordenDeseado
          .map((nombre) => services.find((s) => s.name === nombre))
          .filter(Boolean)
      : title === "Pestañas"
        ? ordenPestanas
            .map((nombre) => services.find((s) => s.name === nombre))
            .filter(Boolean)
        : [];

  // 2. Agregar los servicios que NO están en la lista de orden
  const serviciosNoListados =
    title === "Manicuria"
      ? services.filter((s) => !ordenDeseado.includes(s.name))
      : title === "Pestañas"
        ? services.filter((s) => !ordenPestanas.includes(s.name))
        : services;

  // 3. Combinar ambos → primero en orden, luego los demás
  const serviciosOrdenados = [...serviciosEnOrden, ...serviciosNoListados];

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
            // Si la categoría es "Pestañas" o "Lifting y cejas", mostrar card con nombre e imagen
            if (
              service.category === "Pestañas" ||
              title === "Pestañas" ||
              service.category === "Lifting y cejas" ||
              title === "Lifting y cejas"
            ) {
              let imageUrl = service.image || "/Expertos/pestanas_default.jpg";
              let description = service.description;
              if (service.name === "Lifting con tinte y nutricion") {
                description =
                  "El Lash Lifting es una técnica que trabaja sobre tus pestañas naturales, arqueándolas desde la raíz. Además, les aportamos color para que luzcan más intensas y definidas, sin necesidad de máscara de pestañas.";
              } else if (service.name === "Diseño, perfilado y henna") {
                description =
                  "En el perfilado de cejas combinamos la técnica con hilo y pinza. La henna es un tinte que aporta color y rellena visualmente las áreas despobladas. Su duración aprox es de hasta 10 días en la piel, dependiendo de los cuidados posteriores.";
              } else if (service.name === "Dieño y perfilado de cejas") {
                description =
                  "Combinamos la técnica con hilo y pinza para retirar hasta los vellos más pequeños y lograr un diseño limpio, preciso y súper definido.";
              } else if (service.name === "Diseño, perfilado y laminado") {
                description =
                  "En el perfilado de cejas combinamos la técnica con hilo y pinza. El laminado alisa y estira los vellos para mantenerlos en su lugar, logra un efecto prolijo, ordenado y con mayor volumen. Su duración aprox es de 21 días.";
              }
              if (service.name === "V. Brasilero (2D)") {
                imageUrl = "/pestañas/2d.jpeg";
              } else if (service.name === "Spire Lashes") {
                imageUrl = "/pestañas/sprieLashes.jpeg";
              } else if (service.name === "V. Hawaiano (3D)") {
                imageUrl = "/pestañas/3d.jpeg";
              } else if (service.name === "V. Hollywood (4D)") {
                imageUrl = "/pestañas/4d.jpeg";
              } else if (service.name === "Efecto rímel") {
                imageUrl = "/pestañas/rimel.jpeg";
              } else if (service.name === "Capping mega 6D") {
                imageUrl = "/pestañas/6d.jpeg";
              } 
               else if (service.name === "Volumen mega 6D") {
                imageUrl = "/pestañas/mega6d.jpeg";
              } else if (service.name === "Clasicas") {
                imageUrl = "/pestañas/clasicas.jpeg";
              } else if (service.name === "V. Argentino (5D)") {
                imageUrl = "/pestañas/5d.jpeg";
              } else if (service.name === "Volumen foxy") {
                imageUrl = "/pestañas/vfoxy.jpeg";
              } else if (service.name === "Laminado + perfilado") {
                imageUrl = "/pestañas/perf.jpeg";
              } else if (service.name === "Volumen tech marrones") {
                imageUrl = "/pestañas/VolumenTechMarrones.jpeg";
              } else if (service.name === "Lifting con tinte y nutricion") {
                imageUrl = "/lifting/lifting.jpeg";
              } else if (service.name === "Diseño, perfilado y henna") {
                imageUrl = "/lifting/perfilado.jpeg";
              } else if (service.name === "Diseño, perfilado y laminado") {
                imageUrl = "/lifting/lamyperf.jpeg";
              }  else if (service.name === "Full cejas: Diseño + perfilado + laminado + henna") {
                imageUrl = "/lifting/fullcejas.jpeg";
              }
              return (
                <div
                  key={service.id || service.name}
                  className="service-card"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <img
                    src={imageUrl}
                    alt={service.name}
                    className="service-image-pestanas"
                  />
                  <h3 className="service-name" style={{ marginTop: "10px" }}>
                    {service.name}
                  </h3>
                  <p className="details-service">${service.price}</p>
                  {description && (
                    <p
                      className={`description ${
                        isExpanded ? "expanded" : "collapsed"
                      }`}
                    >
                      {isExpanded
                        ? description
                        : description.slice(0, 158) +
                          (description.length > 200 ? "..." : "")}
                    </p>
                  )}
                  {description && description.length > 100 && (
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
                            service.name.toLowerCase(),
                          )}`,
                        );
                      }}
                    >
                      Agendar
                    </button>
                  </div>
                </div>
              );
            }
            // Para el resto, renderizado original
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
                {service.description && service.description.length > 100 && (
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
                          service.name.toLowerCase(),
                        )}`,
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
