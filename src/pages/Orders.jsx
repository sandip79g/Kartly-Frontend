import React, { useEffect, useState } from "react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { formatPound } from "../utils/currency.js";
import { avatarUrlFor } from "../utils/avatar.js";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const avatarUrl = avatarUrlFor(user);

  useEffect(() => {
    api.get("/orders/mine").then(({ data }) => setOrders(data.orders)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-500">Loading orders…</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="card p-5 mb-6 flex items-center gap-4">
        <img src={avatarUrl} alt={user?.username || "Customer"} className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-sm" />
        <div>
          <h1 className="text-xl font-bold">My orders</h1>
          <p className="text-sm text-gray-500">
            {user?.full_name || user?.username} · {user?.email}
          </p>
        </div>
      </div>
      {orders.length === 0 ? (
        <p className="text-gray-500">You haven't placed any orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-sm text-gray-500">Order #{order.id}</p>
                  <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Payment: {order.payment_method || "-"} · {order.payment_status || "-"}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[order.status]}`}>
                  {order.status}
                </span>
              </div>
              <ul className="text-sm divide-y">
                {order.items.map((item) => (
                  <li key={item.id} className="py-2 flex justify-between">
                    <span>
                      {item.title} × {item.quantity}
                    </span>
                    <span>{formatPound(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between font-semibold mt-3 pt-3 border-t">
                <span>Total</span>
                <span>{formatPound(order.total)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
