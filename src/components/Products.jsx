import React, { useState, useEffect } from "react";
import "./AddProductForm.css";
import { adminFetch } from "../utils/adminApi";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [ventas, setVentas] = useState([]); // 👈 nuevo estado para las ventas
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    imageUrl: "",
  });
  const [editingId, setEditingId] = useState(null);

  // Cargar productos
  useEffect(() => {
    adminFetch("https://eve-back.vercel.app/products")
      .then((res) => res.json())
      .then(setProducts)
      .catch(console.error);
  }, []);

  // 👇 Cargar ventas
  useEffect(() => {
    adminFetch("https://eve-back.vercel.app/products/ventas")
      .then((res) => res.json())
      .then(setVentas)
      .catch(console.error);
  }, []);
  console.log(ventas);
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `https://eve-back.vercel.app/products/${editingId}`
      : "https://eve-back.vercel.app/products";

    const res = await adminFetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      const updated = await res.json();
      if (editingId) {
        setProducts(products.map((p) => (p.id === editingId ? updated : p)));
        setEditingId(null);
      } else {
        setProducts([...products, updated]);
      }
      setForm({
        name: "",
        description: "",
        price: "",
        stock: "",
        imageUrl: "",
      });
    }
  };

  const handleEdit = (product) => {
    setForm(product);
    setEditingId(product.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que querés eliminar este producto?")) return;
    await adminFetch(`https://eve-back.vercel.app/products/${id}`, {
      method: "DELETE",
    });
    setProducts(products.filter((p) => p.id !== id));
  };

  return (
    <div className="admin-product-container">
      <h2 className="admin-product-title">Gestión de Productos</h2>

      {/* Formulario */}
      <form className="admin-product-form" onSubmit={handleSubmit}>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Nombre del producto"
          required
        />
        <input
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Descripción"
        />
        <input
          name="price"
          type="number"
          step="0.01"
          value={form.price}
          onChange={handleChange}
          placeholder="Precio"
          required
        />
        <input
          name="stock"
          type="number"
          value={form.stock}
          onChange={handleChange}
          placeholder="Stock"
          required
        />
        <input
          name="imageUrl"
          value={form.imageUrl}
          onChange={handleChange}
          placeholder="URL de la imagen"
        />
        <button type="submit" className="admin-product-btn">
          {editingId ? "Guardar Cambios" : "Agregar Producto"}
        </button>
      </form>

      {/* Listado de productos */}
      <div className="admin-product-list">
        {products.map((product) => (
          <div key={product.id} className="admin-product-card">
            <img src={product.imageUrl} alt={product.name} />
            <div className="admin-product-info">
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <p>
                💰 ${product.price} — 🧮 {product.stock} unidades
              </p>
              <div className="admin-product-actions">
                <button onClick={() => handleEdit(product)}>Editar</button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="delete"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 👇 Tabla de ventas */}
      <div className="admin-sales-section">
        <h2 className="admin-sales-title">Historial de Ventas</h2>
        {ventas.length === 0 ? (
          <p>No hay ventas registradas aún.</p>
        ) : (
          <table className="admin-sales-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Producto</th>
                <th>Comprador</th>
                <th>Cantidad</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((v) => (
                <tr key={v.id}>
                  <td>{v.id}</td>
                  <td>{v.Product?.name || "—"}</td>
                  <td>{v.User?.name || "—"}</td>
                  <td>{v.quantity}</td>
                  <td>${v.totalPrice.toFixed(2)}</td>
                  <td>{v.paymentStatus}</td>
                  <td>
                    {new Date(
                      new Date(v.createdAt).getTime() - 3 * 60 * 60 * 1000
                    ).toLocaleString("es-AR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
