import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { formatPound } from "../utils/currency.js";

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const discountedPrice = Number(product.discounted_price ?? product.price);
  const hasDiscount = Number(product.discount_percent || 0) > 0;

  return (
    <div className="card flex flex-col overflow-hidden">
      <Link to={`/product/${product.id}`} className="block bg-white p-4">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-44 object-cover rounded-md"
          loading="lazy"
        />
      </Link>
      <div className="p-4 pt-0 flex flex-col flex-1">
        <Link to={`/product/${product.id}`} className="font-medium text-sm line-clamp-2 hover:text-teal">
          {product.title}
        </Link>
        <div className="flex items-center gap-1 text-amber text-xs mt-1">
          {"★".repeat(Math.round(product.rating))}
          <span className="text-gray-400">({product.rating.toFixed?.(1) ?? product.rating})</span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <div className="text-lg font-semibold text-navy">{formatPound(discountedPrice)}</div>
          {hasDiscount && <div className="text-xs text-gray-400 line-through">{formatPound(product.price)}</div>}
        </div>
        {hasDiscount && (
          <div className="text-xs text-teal font-medium mt-0.5">Save {Number(product.discount_percent).toFixed(0)}%</div>
        )}
        {product.stock <= 5 && product.stock > 0 && (
          <div className="text-xs text-red-500 mt-0.5">Only {product.stock} left</div>
        )}
        {product.stock === 0 && <div className="text-xs text-red-500 mt-0.5">Out of stock</div>}
        <button
          onClick={() => addItem(product, 1)}
          disabled={product.stock === 0}
          className="btn-primary mt-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Add to cart
        </button>
      </div>
    </div>
  );
}
