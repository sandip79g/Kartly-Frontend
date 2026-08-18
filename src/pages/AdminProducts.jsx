import React, { useEffect, useState } from "react";
import api from "../api/axios.js";
import { formatPound } from "../utils/currency.js";

const emptyForm = {
  id: null,
  title: "",
  description: "",
  price: "",
  image: "",
  images: "",
  category_id: "",
  stock: "",
  rating: 4.5,
  discount_percent: 0,
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    api.get("/products").then(({ data }) => setProducts(data.products));
    api.get("/products/categories").then(({ data }) => setCategories(data.categories));
  };

  useEffect(load, []);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const updateImage = (e) => {
    const image = e.target.value;
    setForm((current) => {
      const primaryImages = String(current.images || "")
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter(Boolean);
      const shouldSyncImages = primaryImages.length === 0 || primaryImages[0] === current.image;
      return {
        ...current,
        image,
        images: shouldSyncImages ? image : current.images,
      };
    });
  };

  const startEdit = (p) => {
    setForm({
      id: p.id,
      title: p.title,
      description: p.description || "",
      price: p.price,
      image: p.image || "",
      images: Array.isArray(p.images) ? p.images.join("\n") : p.images || p.image || "",
      category_id: p.category_id || "",
      stock: p.stock,
      rating: p.rating,
      discount_percent: p.discount_percent || 0,
    });
    setShowForm(true);
  };

  const startCreate = () => {
    setForm(emptyForm);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const payload = {
      title: form.title,
      description: form.description,
      price: parseFloat(form.price),
      image: form.image,
      images: form.images,
      category_id: form.category_id ? Number(form.category_id) : null,
      stock: parseInt(form.stock, 10) || 0,
      rating: parseFloat(form.rating) || 4.5,
      discount_percent: parseFloat(form.discount_percent) || 0,
    };
    try {
      if (form.id) {
        await api.put(`/products/${form.id}`, payload);
      } else {
        await api.post("/products", payload);
      }
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save product.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    await api.delete(`/products/${id}`);
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold">Products ({products.length})</h2>
        <button onClick={startCreate} className="btn-primary text-sm">
          + Add product
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-5 mb-6 space-y-3">
          {error && <div className="bg-red-50 text-red-700 text-sm rounded-md px-3 py-2">{error}</div>}
          <div className="grid md:grid-cols-2 gap-3">
            <input required placeholder="Title" value={form.title} onChange={update("title")} className="input-field" />
            <input
              required
              type="number"
              step="0.01"
              placeholder="Price"
              value={form.price}
              onChange={update("price")}
              className="input-field"
            />
            <select required value={form.category_id} onChange={update("category_id")} className="input-field">
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              required
              type="number"
              placeholder="Stock"
              value={form.stock}
              onChange={update("stock")}
              className="input-field"
            />
            <input required placeholder="Image URL" value={form.image} onChange={updateImage} className="input-field md:col-span-2" />
            <textarea
              placeholder="Additional image URLs, one per line or comma-separated"
              value={form.images}
              onChange={update("images")}
              className="input-field md:col-span-2"
              rows={3}
            />
            <input
              required
              type="number"
              min="0"
              max="100"
              step="0.01"
              placeholder="Discount percentage"
              value={form.discount_percent}
              onChange={update("discount_percent")}
              className="input-field"
            />
            <textarea
              required
              placeholder="Description"
              value={form.description}
              onChange={update("description")}
              className="input-field md:col-span-2"
              rows={3}
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary text-sm">
              {form.id ? "Save changes" : "Create product"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-sm text-gray-500 hover:underline">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Discount</th>
              <th className="p-3">Stock</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="p-3 flex items-center gap-2">
                  <img src={p.image} alt="" className="w-10 h-10 object-cover rounded" />
                  <span className="line-clamp-1">{p.title}</span>
                </td>
                <td className="p-3 text-gray-500">{p.category || "—"}</td>
                <td className="p-3">
                  <div className="font-medium">{formatPound(p.discounted_price || p.price)}</div>
                  {Number(p.discount_percent || 0) > 0 && (
                    <div className="text-xs text-gray-500 line-through">{formatPound(p.price)}</div>
                  )}
                </td>
                <td className="p-3 text-gray-500">{Number(p.discount_percent || 0).toFixed(0)}%</td>
                <td className="p-3">{p.stock}</td>
                <td className="p-3 text-right space-x-3">
                  <button onClick={() => startEdit(p)} className="text-teal hover:underline">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
