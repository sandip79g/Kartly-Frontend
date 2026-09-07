import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { formatPound } from "../utils/currency.js";
import { avatarUrlFor } from "../utils/avatar.js";
import ChatBot from "../components/ChatBot.jsx";

export default function Cart() {
  const { items, updateQuantity, removeItem, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const avatarUrl = avatarUrlFor(user);

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-2xl mb-2">🛒</p>
        <h1 className="text-xl font-semibold mb-2">Your cart is empty</h1>
        <Link to="/" className="text-teal font-semibold hover:underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  const goToCheckout = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    navigate("/checkout");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-4">
        <div className="card p-5 flex items-center gap-4">
          <img src={avatarUrl} alt={user?.username || "Customer"} className="w-14 h-14 rounded-full object-cover border-4 border-white shadow-sm" />
          <div>
            <h1 className="text-xl font-bold">Shopping cart</h1>
            <p className="text-sm text-gray-500">
              {user?.full_name || user?.username || "Guest shopper"}
              {user?.email ? ` · ${user.email}` : ""}
            </p>
          </div>
        </div>
        {items.map((item) => (
          <div key={item.id} className="card p-4 flex gap-4 items-center">
            <img src={item.image} alt={item.title} className="w-20 h-20 object-cover rounded-md" />
            <div className="flex-1">
              <Link to={`/product/${item.id}`} className="font-medium hover:text-teal">
                {item.title}
              </Link>
              <div className="text-navy font-semibold mt-1">{formatPound(item.price)}</div>
            </div>
            <select
              value={item.quantity}
              onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
              className="input-field w-20"
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <button onClick={() => removeItem(item.id)} className="text-red-500 text-sm hover:underline">
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="card p-6 h-fit">
        <div className="flex justify-between text-sm mb-2">
          <span>Subtotal</span>
          <span>{formatPound(total)}</span>
        </div>
        <div className="flex justify-between text-sm mb-4 text-gray-500">
          <span>Shipping</span>
          <span>Free</span>
        </div>
        <div className="flex justify-between font-bold text-lg border-t pt-3 mb-4">
          <span>Total</span>
          <span>{formatPound(total)}</span>
        </div>
        <button onClick={goToCheckout} className="btn-primary w-full">
          Proceed to checkout
        </button>
      </div>

      <div className="fixed bottom-4 right-4 z-50">
        <ChatBot />
      </div>
    </div>
  );
} 