// src/components/RutaProtegida.jsx
import { Navigate } from "react-router-dom";

const RutaProtegida = ({ children }) => {
  const userId = localStorage.getItem("userId");


if (userId !== "3" && userId !== "1") {
  return <Navigate to="/" replace />;
}


  return children;
};

export default RutaProtegida;
