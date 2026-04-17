import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./CouponManager.css";

const API_URL = "https://eve-back.vercel.app";

const CouponManager = () => {
  const [coupons, setCoupons] = useState([]);
  const [services, setServices] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchCoupons();
    fetchServices();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await axios.get(`${API_URL}/coupons`);
      setCoupons(res.data);
    } catch (err) {
      console.error("Error al obtener cupones", err);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await axios.get(`${API_URL}/services`);
      setServices(res.data);
    } catch (err) {
      console.error("Error al obtener servicios", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/coupons/${editingId}`, form);
        alert("¡Cupón actualizado con éxito!");
      } else {
        await axios.post(`${API_URL}/coupons`, form);
        alert("¡Cupón creado exitosamente!");
      }
      setForm(initialFormState);
      setEditingId(null);
      fetchCoupons();
    } catch (err) {
      alert("Error al procesar el cupón");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este cupón?")) {
      try {
        await axios.delete(`${API_URL}/coupons/${id}`);
        fetchCoupons();
      } catch (err) {
        alert("Error al eliminar el cupón");
      }
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
      validFrom: coupon.validFrom ? coupon.validFrom.split("T")[0] : "",
      validUntil: coupon.validUntil ? coupon.validUntil.split("T")[0] : "",
      applicableServiceIds: coupon.applicableServiceIds || [],
      isActive: coupon.isActive,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleService = (serviceId) => {
    setForm((prev) => {
      const alreadySelected = prev.applicableServiceIds.includes(serviceId);
      if (alreadySelected) {
        return {
          ...prev,
          applicableServiceIds: prev.applicableServiceIds.filter(
            (id) => id !== serviceId,
          ),
        };
      } else {
        return {
          ...prev,
          applicableServiceIds: [...prev.applicableServiceIds, serviceId],
        };
      }
    });
  };

  return (
    <div className="coupon-manager-container">
      <div className="coupon-form-card">
        <h2 className="section-title">
          {editingId ? "Editar Cupón" : "Crear Nuevo Cupón"}
        </h2>
        <form onSubmit={handleSubmit} className="coupon-form">
          <div className="form-row">
            <div className="form-group">
              <label>Código del Cupón</label>
              <input
                type="text"
                placeholder="EJ: VERANO2024"
                value={form.code}
                onChange={(e) =>
                  setForm({ ...form, code: e.target.value.toUpperCase() })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Valor de Descuento</label>
              <input
                type="number"
                placeholder="Monto o %"
                value={form.discountValue}
                onChange={(e) =>
                  setForm({ ...form, discountValue: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Tipo de Descuento</label>
              <select
                value={form.discountType}
                onChange={(e) =>
                  setForm({ ...form, discountType: e.target.value })
                }
              >
                <option value="percentage">Porcentaje (%)</option>
                <option value="fixed">Monto Fijo ($)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Uso Máximo</label>
              <input
                type="number"
                value={form.maxUses}
                onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Válido Desde</label>
              <input
                type="date"
                value={form.validFrom}
                onChange={(e) =>
                  setForm({ ...form, validFrom: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Válido Hasta</label>
              <input
                type="date"
                value={form.validUntil}
                onChange={(e) =>
                  setForm({ ...form, validUntil: e.target.value })
                }
              />
            </div>
          </div>

          <div className="form-group">
            <label>Descripción (Opcional)</label>
            <input
              type="text"
              placeholder="Ej: Solo para masajes faciales"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          <div className="form-group" ref={dropdownRef}>
            <label>Servicios Aplicables</label>
            <div className="custom-multiselect">
              <div
                className={`multiselect-header ${isDropdownOpen ? "active" : ""}`}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span>
                  {form.applicableServiceIds.length === 0
                    ? "Todos los servicios"
                    : `${form.applicableServiceIds.length} seleccionados`}
                </span>
                <span className="arrow">{isDropdownOpen ? "▲" : "▼"}</span>
              </div>

              {isDropdownOpen && (
                <div className="multiselect-dropdown">
                  {services.map((s) => {
                    const isSelected = form.applicableServiceIds.includes(s.id);
                    return (
                      <div
                        key={s.id}
                        className={`multiselect-item ${isSelected ? "selected" : ""}`}
                        onClick={() => toggleService(s.id)}
                      >
                        <div className="checkbox-custom">
                          {isSelected && "✓"}
                        </div>
                        {s.name}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="switch-container">
            <label className="switch">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm({ ...form, isActive: e.target.checked })
                }
              />
              <span className="slider"></span>
            </label>
            <span style={{ fontSize: "0.9rem", fontWeight: "600" }}>
              {form.isActive ? "Cupón Activo" : "Cupón Inactivo"}
            </span>
          </div>

          <button type="submit" className="btn-submit">
            {editingId ? "Actualizar Cupón" : "Crear Cupón"}
          </button>
          {editingId && (
            <button
              type="button"
              className="btn-cancel"
              onClick={() => {
                setEditingId(null);
                setForm(initialFormState);
              }}
              style={{
                marginTop: "10px",
                background: "transparent",
                border: "none",
                color: "#666",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Cancelar Edición
            </button>
          )}
        </form>
      </div>

      <div className="coupon-list-container">
        <h2 className="section-title">Cupones Existentes</h2>
        <div className="coupons-grid">
          {coupons.length === 0 ? (
            <p className="empty-state">No hay cupones creados aún.</p>
          ) : (
            coupons.map((coupon) => (
              <div
                key={coupon.id}
                className={`coupon-card ${!coupon.isActive ? "is-inactive" : ""}`}
              >
                <div className="coupon-card-left">
                  <div className="discount-badge">
                    {coupon.discountType === "percentage" ? (
                      <>
                        <span>{coupon.discountValue}</span>%
                      </>
                    ) : (
                      <>
                        <span>${coupon.discountValue}</span>
                      </>
                    )}
                  </div>
                  <p>OFF</p>
                </div>

                <div className="coupon-card-right">
                  <div className="coupon-header">
                    <span className="coupon-code">{coupon.code}</span>
                    <span
                      className={`status-dot ${coupon.isActive ? "active" : "inactive"}`}
                      title={coupon.isActive ? "Activo" : "Inactivo"}
                    ></span>
                  </div>

                  <p className="coupon-description">
                    {coupon.description || "Sin descripción"}
                  </p>

                  <div className="coupon-details">
                    <div className="detail-item">
                      <span className="detail-label">Usos:</span>
                      <span className="detail-value">
                        {coupon.usedCount} / {coupon.maxUses}
                      </span>
                    </div>
                    {coupon.validUntil && (
                      <div className="detail-item">
                        <span className="detail-label">Vence:</span>
                        <span className="detail-value">
                          {new Date(coupon.validUntil).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="coupon-actions">
                    <button
                      className="action-btn edit"
                      onClick={() => handleEdit(coupon)}
                    >
                      ✏️ <span>Editar</span>
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDelete(coupon.id)}
                    >
                      🗑️ <span>Eliminar</span>
                    </button>
                  </div>
                </div>

                <div className="ticket-cut-top"></div>
                <div className="ticket-cut-bottom"></div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CouponManager;
