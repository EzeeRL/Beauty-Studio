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

  const handleOmitirEleccion = () => {
    const nombresRestringidos = ["Soft gel N1/2/3", "Soft gel XXL N4/5/6"];

    // Filtrar los expertos válidos como ya hacés en el .filter()
    const expertosDisponibles = expertos.filter((expert) => {
      const ocultarExpert4 =
        nombresRestringidos.includes(servicio?.name) && expert.id === 4;
      const coincideCategoria = expert.specialty === servicio?.category;
      return coincideCategoria && !ocultarExpert4;
    });

    if (expertosDisponibles.length > 0) {
      const aleatorio = Math.floor(Math.random() * expertosDisponibles.length);
      const expertoSeleccionado = expertosDisponibles[aleatorio];

      setExperto(expertoSeleccionado);
      navigate(`/fecha/${expertoSeleccionado.id}`);
    } else {
      alert("No hay profesionales disponibles para este servicio.");
    }
  };

  return (
    <div className="container-general-expertos">
      <h2 className="title-pagina-expertos">
        Selecciona un Profesional para {servicio?.name}
      </h2>

      <div className="experts-container">
        {expertos
          .filter((expert) => {
            const nombresRestringidos = [
              "Soft gel N1/2/3",
              "Soft gel XXL N4/5/6",
            ];
            const ocultarExpert4 =
              nombresRestringidos.includes(servicio?.name) && expert.id === 4;
            const coincideCategoria = expert.specialty === servicio?.category;
            return coincideCategoria && !ocultarExpert4;
          })

          .map((expert) => (
            <div key={expert.id} className="expert-card">
              {expert.imageUrl ? (
                <img
                  src={expert.imageUrl}
                  alt={expert.name}
                  className="img-experto"
                />
              ) : (
                <div className="img-placeholder">
                  {expert.name.charAt(0).toUpperCase()}
                </div>
              )}

              <h2>{expert.name}</h2>
              <p className="text-especialidad">{expert.specialty}</p>
              <p className="text-especialidad">{expert.description}</p>
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
        <button className="button-option" onClick={handleOmitirEleccion}>
          Omitir Elección
        </button>
      </div>
    </div>
  );
};

export default Expertos;
