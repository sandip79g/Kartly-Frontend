import React, { useEffect, useState } from "react";
import api from "../api/axios.js";
import { formatPound } from "../utils/currency.js";

const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/orders");
      setOrders(data.orders);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load orders.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    setError("");
    try {
      await api.put(`/orders/${id}/status`, { status });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update order status.");
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const search = query.trim().toLowerCase();
    if (!search) return matchesStatus;

    const haystack = [
      order.id,
      order.username,
      order.email,
      order.address,
      order.status,
      ...(order.items || []).map((item) => item.title),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return matchesStatus && haystack.includes(search);
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <h2 className="font-semibold">Orders ({filteredOrders.length})</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input-field sm:w-72"
            placeholder="Search order, customer, item..."
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field sm:w-44">
            <option value="all">All statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && <div className="text-gray-500">Loading orders…</div>}
      {error && <div className="bg-red-50 text-red-700 text-sm rounded-md px-3 py-2 mb-4">{error}</div>}

      {!loading && !error && filteredOrders.length === 0 && (
        <div className="card p-6 text-center text-gray-500">No orders match your filters.</div>
      )}

      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div key={order.id} className="card p-5">
            <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
              <div>
                <p className="text-sm font-medium">
                  Order #{order.id} — {order.username} ({order.email})
                </p>
                <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Payment: {order.payment_method || "-"} · {order.payment_status || "-"} · Ref {order.payment_reference || "-"}
                </p>
                {order.address && <p className="text-xs text-gray-500 mt-1">Ship to: {order.address}</p>}
                <p className="text-xs text-gray-500 mt-1">
                  {order.items.length} item{order.items.length === 1 ? "" : "s"} · {formatPound(order.total)}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                  className="input-field w-44 text-sm"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <div className="flex flex-wrap gap-2 text-xs">
                  {statuses
                    .filter((status) => status !== order.status)
                    .map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => updateStatus(order.id, status)}
                        className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
                      >
                        Mark {status}
                      </button>
                    ))}
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-gray-500 border-b">
                  <tr>
                    <th className="py-2 pr-3">Item</th>
                    <th className="py-2 pr-3">Qty</th>
                    <th className="py-2 pr-3">Unit price</th>
                    <th className="py-2 pr-3">Line total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2 pr-3">{item.title}</td>
                      <td className="py-2 pr-3">{item.quantity}</td>
                      <td className="py-2 pr-3">{formatPound(item.price)}</td>
                      <td className="py-2 pr-3">{formatPound(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between font-semibold mt-3 pt-3 border-t">
              <span>Total</span>
              <span>{formatPound(order.total)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
