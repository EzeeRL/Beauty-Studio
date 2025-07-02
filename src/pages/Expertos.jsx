import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import useServicioStore from "../store/servicioStore";

const Expertos = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { servicio, setExperto } = useServicioStore();

  const [expertos, setExpertos] = useState([]);

  useEffect(() => {
    const fetchExpertos = async () => {
      try {
        const response = await axios.get("https://eve-back.vercel.app/experts");
        setExpertos(response.data);
      } catch (error) {
        console.error("Error al cargar expertos:", error);
      }
    };

    fetchExpertos();
  }, []);

  const handleSelectExpert = (expert) => {
    setExperto(expert);
    navigate(`/fecha/${expert.id}`);
  };

  return (
    <div className="expertos-container">
      <h2>Selecciona un experto para {servicio?.name}</h2>
      <div className="experts-grid">
        {expertos.map((expert) => (
          <div key={expert.id} className="expert-card">
            <img src={expert.imageUrl} alt={expert.name} />
            <h3>{expert.name}</h3>
            <p>{expert.specialty}</p>
            <button
              onClick={() => handleSelectExpert(expert)}
              className="select-button"
            >
              Seleccionar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Expertos;
