import { useState, useEffect, useRef } from "react";
import "./ServiceSection.css";

const ServiceSection = ({ title, services }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setIsSticky(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      { threshold: [0] }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => {
      if (sentinelRef.current) {
        observer.unobserve(sentinelRef.current);
      }
    };
  }, [isOpen]);

  return (
    <div className="section" ref={sectionRef}>
      {/* Elemento centinela para detectar cuando el título sale de la vista */}
      <div ref={sentinelRef} className="sentinel" />

      <button
        className={`section-title ${isSticky ? "sticky" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        ref={titleRef}
      >
        <span>{title}</span>
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="icon"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M6 15l6 -6l6 6" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="icon"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M6 9l6 6l6 -6" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="services-container">
          {services.map((service, idx) => (
            <div key={idx} className="service-card">
              <h3 className="service-name">{service.name}</h3>
              <p className="details-service">{service.duration}</p>
              <p className="details-service">${service.price}</p>
              <p className="note">{service.note}</p>
              <div className="container-button">
                <button className="book-button">Agendar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServiceSection;
