import React, { useState, useEffect } from "react";
import axios from "axios";
// Asegúrate de que la ruta base coincida con la de tu backend
const API_URL = "https://eve-back.vercel.app";

const CouponManager = () => {
  const [coupons, setCoupons] = useState([]);
  const [services, setServices] = useState([]);

  // Estado inicial del formulario
  const initialFormState = {
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    maxUses: 1,
    validFrom: "",
    validUntil: "",
    applicableServiceIds: [],
    isActive: true,
  };

  const [form, setForm] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);

  // Cargar cupones y servicios al montar el componente
  useEffect(() => {
    fetchCoupons();
    fetchServices();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await axios.get(`${API_URL}/coupons`);
      setCoupons(res.data);
    } catch (error) {
      console.error("Error al cargar cupones:", error);
    }
  };

  const fetchServices = async () => {
    try {
      // Ajusta esta ruta si tu endpoint de servicios es diferente
      const res = await axios.get(`${API_URL}/services`);
      setServices(res.data);
    } catch (error) {
      console.error("Error al cargar servicios:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleServiceSelect = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) =>
      parseInt(option.value),
    );
    setForm({ ...form, applicableServiceIds: selectedOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Formatear los datos antes de enviar
      const payload = {
        ...form,
        discountValue: parseFloat(form.discountValue),
        maxUses: parseInt(form.maxUses),
        // Si no seleccionó ningún servicio, enviamos null para que aplique a todos
        applicableServiceIds:
          form.applicableServiceIds.length > 0
            ? form.applicableServiceIds
            : null,
      };

      if (editingId) {
        await axios.put(`${API_URL}/coupons/${editingId}`, payload);
        alert("Cupón actualizado con éxito");
      } else {
        await axios.post(`${API_URL}/coupons`, payload);
        alert("Cupón creado con éxito");
      }

      setForm(initialFormState);
      setEditingId(null);
      fetchCoupons();
    } catch (error) {
      console.error("Error al guardar el cupón:", error);
      alert(error.response?.data?.error || "Error al guardar el cupón");
    }
  };

  const handleEdit = (coupon) => {
    setEditingId(coupon.id);
    setForm({
      code: coupon.code,
      description: coupon.description || "",
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxUses: coupon.maxUses,
      validFrom: coupon.validFrom ? coupon.validFrom.slice(0, 16) : "", // Formato para datetime-local
      validUntil: coupon.validUntil ? coupon.validUntil.slice(0, 16) : "",
      applicableServiceIds: coupon.applicableServiceIds || [],
      isActive: coupon.isActive,
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este cupón?")) {
      try {
        await axios.delete(`${API_URL}/coupons/${id}`);
        alert("Cupón eliminado");
        fetchCoupons();
      } catch (error) {
        console.error("Error al eliminar cupón:", error);
      }
    }
  };

  const cancelEdit = () => {
    setForm(initialFormState);
    setEditingId(null);
  };

  return (
    <div className="coupon-manager">
      <h2>{editingId ? "Editar Cupón" : "Crear Nuevo Cupón"}</h2>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          maxWidth: "500px",
          marginBottom: "30px",
        }}
      >
        <input
          type="text"
          name="code"
          placeholder="Código (Ej: VERANO20)"
          value={form.code}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="description"
          placeholder="Descripción (Opcional)"
          value={form.description}
          onChange={handleChange}
        />

        <div style={{ display: "flex", gap: "10px" }}>
          <select
            name="discountType"
            value={form.discountType}
            onChange={handleChange}
          >
            <option value="percentage">Porcentaje (%)</option>
            <option value="fixed">Monto Fijo ($)</option>
          </select>
          <input
            type="number"
            name="discountValue"
            placeholder="Valor del descuento"
            value={form.discountValue}
            onChange={handleChange}
            required
          />
        </div>

        <input
          type="number"
          name="maxUses"
          placeholder="Límite de usos totales"
          value={form.maxUses}
          onChange={handleChange}
          required
        />

        <div style={{ display: "flex", gap: "10px" }}>
          <label>
            Válido Desde:
            <input
              type="datetime-local"
              name="validFrom"
              value={form.validFrom}
              onChange={handleChange}
            />
          </label>
          <label>
            Válido Hasta:
            <input
              type="datetime-local"
              name="validUntil"
              value={form.validUntil}
              onChange={handleChange}
            />
          </label>
        </div>

        <label>
          Aplica a servicios (Ctrl/Cmd + Click para múltiple. Vacío = Todos):
          <select
            multiple
            name="applicableServiceIds"
            value={form.applicableServiceIds}
            onChange={handleServiceSelect}
            style={{ height: "100px", width: "100%" }}
          >
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <input
            type="checkbox"
            name="isActive"
            checked={form.isActive}
            onChange={handleChange}
          />
          Cupón Activo
        </label>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="submit"
            style={{
              flex: 1,
              padding: "10px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            {editingId ? "Guardar Cambios" : "Crear Cupón"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              style={{
                flex: 1,
                padding: "10px",
                backgroundColor: "#f44336",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <h2>Lista de Cupones</h2>
      <table
        style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}
      >
        <thead>
          <tr>
            <th>Código</th>
            <th>Descuento</th>
            <th>Usos</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {coupons.length === 0 ? (
            <tr>
              <td colSpan="5">No hay cupones creados.</td>
            </tr>
          ) : (
            coupons.map((coupon) => (
              <tr
                key={coupon.id}
                style={{ borderBottom: "1px solid #ddd", textAlign: "center" }}
              >
                <td>
                  <strong>{coupon.code}</strong>
                </td>
                <td>
                  {coupon.discountValue}
                  {coupon.discountType === "percentage" ? "%" : "$"}
                </td>
                <td>
                  {coupon.usedCount} / {coupon.maxUses}
                </td>
                <td>{coupon.isActive ? "🟢 Activo" : "🔴 Inactivo"}</td>
                <td>
                  <button
                    onClick={() => handleEdit(coupon)}
                    style={{ marginRight: "10px" }}
                  >
                    ✏️
                  </button>
                  <button onClick={() => handleDelete(coupon.id)}>🗑️</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CouponManager;
