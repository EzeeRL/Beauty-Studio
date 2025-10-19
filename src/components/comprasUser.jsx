import React, { useEffect, useState } from "react";
import axios from "axios";
import "./UserCompra.css";

const UserCompras = ({ userId: propUserId }) => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = propUserId || localStorage.getItem("userId");

  useEffect(() => {
    const fetchPurchases = async () => {
      if (!userId) {
        setError("No se encontró el ID del usuario.");
        setLoading(false);
        return;
      }

      try {
        const { data } = await axios.get(
          `https://eve-back.vercel.app/products/purchases/${userId}`
        );
        setPurchases(data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Error al obtener las compras."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, [userId]);

  if (loading)
    return <p className="user-purchases-loading">Cargando tus compras...</p>;
  if (error) return <p className="user-purchases-error">⚠️ {error}</p>;

  return (
    <div className="user-purchases-container">
      <h2>🛍️ Mis Compras</h2>

      {purchases.length === 0 ? (
        <p className="user-purchases-empty">
          No tenés compras registradas todavía.
        </p>
      ) : (
        <table className="user-purchases-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Imagen</th>
              <th>Cantidad</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((purchase) => (
              <tr key={purchase.id}>
                <td>{purchase.Product?.name || "Producto eliminado"}</td>
                <td>
                  {purchase.Product?.imageUrl ? (
                    <img
                      src={purchase.Product.imageUrl}
                      alt={purchase.Product.name}
                      className="user-purchase-img"
                    />
                  ) : (
                    "Sin imagen"
                  )}
                </td>
                <td>{purchase.quantity}</td>
                <td>${purchase.totalPrice?.toFixed(2)}</td>
                <td
                  className={`user-purchase-status ${
                    purchase.paymentStatus === "approved"
                      ? "approved"
                      : "pending"
                  }`}
                >
                  {purchase.paymentStatus}
                </td>
                <td>{new Date(purchase.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserCompras;
