import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useCart } from "../context/CartContext.jsx";
import { formatPound } from "../utils/currency.js";

const paymentMethods = [
  { value: "card", label: "Credit / Debit Card" },
  { value: "paypal", label: "PayPal" },
  { value: "apple_pay", label: "Apple Pay" },
  { value: "cod", label: "Cash on Delivery" },
];

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError("");
    setPlacing(true);
    const paymentDetails =
      paymentMethod === "card"
        ? { card_name: cardName, card_number: cardNumber, card_expiry: cardExpiry, card_cvv: cardCvv }
        : paymentMethod === "paypal"
          ? { paypal_email: paypalEmail }
          : { method: paymentMethod };
    try {
      await api.post("/orders", {
        items: items.map((i) => ({ product_id: i.id, quantity: i.quantity })),
        address,
        payment_method: paymentMethod,
        payment_details: paymentDetails,
      });
      clearCart();
      navigate("/orders");
    } catch (err) {
      setError(err.response?.data?.message || "Could not place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return <div className="text-center py-20 text-gray-500">Your cart is empty.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-6">
      <form onSubmit={handlePlaceOrder} className="md:col-span-2 card p-6 space-y-4">
        <h1 className="text-xl font-bold mb-2">Shipping details</h1>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-3 py-2">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">Delivery address</label>
          <textarea
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="input-field"
            rows={4}
            placeholder="Street, city, state, ZIP code"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Payment method</label>
          <div className="grid sm:grid-cols-2 gap-3">
            {paymentMethods.map((method) => (
              <button
                key={method.value}
                type="button"
                onClick={() => setPaymentMethod(method.value)}
                className={`border rounded-lg px-4 py-3 text-left transition ${paymentMethod === method.value ? "border-teal bg-teal/5" : "border-gray-200 hover:border-gray-300"}`}
              >
                <div className="font-medium text-sm">{method.label}</div>
                <div className="text-xs text-gray-500">Fake payment for prototype checkout</div>
              </button>
            ))}
          </div>
        </div>
        {paymentMethod === "card" && (
          <div className="grid md:grid-cols-2 gap-3">
            <input required value={cardName} onChange={(e) => setCardName(e.target.value)} className="input-field" placeholder="Name on card" />
            <input required value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} className="input-field" placeholder="Card number" />
            <input required value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} className="input-field" placeholder="MM/YY" />
            <input required value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} className="input-field" placeholder="CVV" />
          </div>
        )}
        {paymentMethod === "paypal" && (
          <div>
            <label className="block text-sm font-medium mb-1">PayPal email</label>
            <input
              required
              type="email"
              value={paypalEmail}
              onChange={(e) => setPaypalEmail(e.target.value)}
              className="input-field"
              placeholder="name@example.com"
            />
          </div>
        )}
        <p className="text-xs text-gray-500">
          This is a prototype checkout — no real payment is collected. Your payment choice is saved as a fake
          transaction for admin reporting.
        </p>
        <button type="submit" disabled={placing} className="btn-primary w-full">
          {placing ? "Placing order…" : `Place order — ${formatPound(total)}`}
        </button>
      </form>

      <div className="card p-6 h-fit">
        <h2 className="font-semibold mb-3">Order summary</h2>
        <ul className="space-y-2 text-sm mb-4">
          {items.map((i) => (
            <li key={i.id} className="flex justify-between">
              <span className="line-clamp-1 pr-2">
                {i.title} × {i.quantity}
              </span>
              <span>{formatPound(i.price * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between font-bold border-t pt-3">
          <span>Total</span>
          <span>{formatPound(total)}</span>
        </div>
      </div>
    </div>
  );
}
