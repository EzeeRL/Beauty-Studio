import { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ IMPORTANTE
import "./ServiceSection.css";
import useServicioStore from "../store/servicioStore";

const ServiceSection = ({ title, services, isOpen }) => {
  const setServicio = useServicioStore((state) => state.setServicio);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const navigate = useNavigate(); // ✅ NECESARIO para que funcione el botón

  const toggleDescription = (id) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="section">
      <button className="section-title">
        <span>{title}</span>
      </button>

      {isOpen && (
        <div className="services-container">
          {services.map((service, idx) => {
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
                  {service.description}
                </p>

                {service.description.length > 100 && (
                  <button
                    className="toggle-description"
                    onClick={() => toggleDescription(service.id)}
                  >
                    {isExpanded ? "Ver menos" : "Ver más"}
                  </button>
                )}

                <div className="container-button">
                  <button
                    className="book-button"
                    onClick={() => {
                      setServicio(service);
                      navigate(`/expertos/${encodeURIComponent(service.name.toLowerCase())}`);
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
