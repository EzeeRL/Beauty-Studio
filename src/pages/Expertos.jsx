import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import useServicioStore from "../store/servicioStore";
import "./Expertos.css";

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
    <div className="container-general-expertos">
      <h2 className="title-pagina-expertos">
        Selecciona un Profesional para {servicio?.name}
      </h2>

      <div className="experts-container">
        {expertos
.filter((expert) => {
  const nombresRestringidos = ["Soft gel N1/2/3", "Soft gel XXL N4/5/6"];
  const ocultarExpert4 = nombresRestringidos.includes(servicio?.name) && expert.id === 4;
  const coincideCategoria = expert.specialty === servicio?.category;
  return coincideCategoria && !ocultarExpert4;
})

          .map((expert) => (
            <div key={expert.id} className="expert-card">
              <img
                src={expert.imageUrl}
                alt={expert.name}
                className="img-experto"
              />
              <h2>{expert.name}</h2>
              <p className="text-especialidad">{expert.specialty}</p>
              <button
                onClick={() => handleSelectExpert(expert)}
                className="select-button"
              >
                Seleccionar
              </button>
            </div>
          ))}
      </div>

      <div className="container-option">
        <h2>¿No sabés a quién elegir?</h2>
        <p className="text-option">
          Podés simplemente saltear este paso y te asignaremos un profesional
          nosotros mismos
        </p>
        <button className="button-option">Omitir Elección</button>
      </div>
    </div>
  );
};

export default Expertos;
