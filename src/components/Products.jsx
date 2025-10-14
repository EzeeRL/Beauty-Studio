import React, { useState, useEffect } from "react";
import "./AddProductForm.css";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    imageUrl: "",
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetch("https://eve-back.vercel.app/products")
      .then((res) => res.json())
      .then(setProducts)
      .catch(console.error);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `https://eve-back.vercel.app/products/${editingId}`
      : "https://eve-back.vercel.app/products";

    const res = await fetch(url, {
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
    await fetch(`https://eve-back.vercel.app/products/${id}`, {
      method: "DELETE",
    });
    setProducts(products.filter((p) => p.id !== id));
  };

  return (
    <div className="admin-product-container">
      <h2 className="admin-product-title">Gestión de Productos</h2>

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
    </div>
  );
};

export default AdminProducts;
