import React, { useEffect, useState } from "react";
import { NavLink, Routes, Route } from "react-router-dom";
import api from "../api/axios.js";
import AdminProducts from "./AdminProducts.jsx";
import AdminOrders from "./AdminOrders.jsx";
import AdminUsers from "./AdminUsers.jsx";
import AdminReviews from "./AdminReviews.jsx";
import AdminSales from "./AdminSales.jsx";
import AccountSettings from "./AccountSettings.jsx";
import { formatPound } from "../utils/currency.js";

function StatCard({ label, value, icon }) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <span className="text-3xl">{icon}</span>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-navy">{value}</p>
      </div>
    </div>
  );
}

function Overview() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/admin/stats").then(({ data }) => setStats(data));
  }, []);

  if (!stats) return <div className="text-gray-500">Loading stats…</div>;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Customers" value={stats.userCount} icon="👤" />
      <StatCard label="Products" value={stats.productCount} icon="📦" />
      <StatCard label="Orders" value={stats.orderCount} icon="🧾" />
      <StatCard label="Revenue" value={formatPound(stats.revenue)} icon="💰" />
    </div>
  );
}

const tabClass = ({ isActive }) =>
  `block px-4 py-2 rounded-md text-sm font-medium ${
    isActive ? "bg-navy text-white" : "text-gray-700 hover:bg-gray-100"
  }`;

export default function AdminDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid md:grid-cols-4 gap-6">
      <aside className="md:col-span-1">
        <div className="card p-3 space-y-1">
          <NavLink to="/admin" end className={tabClass}>
            Overview
          </NavLink>
          <NavLink to="/admin/products" className={tabClass}>
            Products
          </NavLink>
          <NavLink to="/admin/orders" className={tabClass}>
            Orders
          </NavLink>
          <NavLink to="/admin/sales" className={tabClass}>
            Sales
          </NavLink>
          <NavLink to="/admin/users" className={tabClass}>
            Customers
          </NavLink>
          <NavLink to="/admin/reviews" className={tabClass}>
            Reviews
          </NavLink>
          <NavLink to="/admin/account" className={tabClass}>
            Account
          </NavLink>
        </div>
      </aside>
      <main className="md:col-span-3 space-y-6">
        <h1 className="text-xl font-bold">Admin dashboard</h1>
        <Routes>
          <Route index element={<Overview />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="sales" element={<AdminSales />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="account" element={<AccountSettings />} />
        </Routes>
      </main>
    </div>
  );
}
