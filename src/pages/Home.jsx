import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios.js";
import ProductCard from "../components/ProductCard.jsx";
import ChatBot from "../components/ChatBot.jsx";

export default function Home() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category") || "";
  const search = searchParams.get("search") || "";

  const [products, setProducts] = useState([]);
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (category) params.category = category;
    if (search) params.search = search;
    if (sort) params.sort = sort;
    api
      .get("/products", { params })
      .then(({ data }) => setProducts(data.products))
      .finally(() => setLoading(false));
  }, [category, search, sort]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {!category && !search && (
        <div className="bg-gradient-to-r from-navy to-navy-light text-white rounded-lg p-8 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Everything you need, one cart away</h1>
            <p className="text-gray-300 max-w-md">
              Browse electronics, fashion, home goods, books, and sporting gear — all in one prototype storefront.
            </p>
          </div>
          <span className="text-6xl">🛍️</span>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          {search ? `Results for "${search}"` : category || "All products"}
        </h2>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="input-field w-auto text-sm"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Top rated</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading products…</div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No products found.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      <div className="fixed bottom-4 right-4 z-50">
        <ChatBot />
      </div>
    </div>
  );
};