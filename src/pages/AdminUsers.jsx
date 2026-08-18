import React, { useEffect, useState } from "react";
import api from "../api/axios.js";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  const load = () => {
    api.get("/admin/users").then(({ data }) => setUsers(data.users));
  };

  useEffect(() => {
    load();
  }, []);

  const updateRole = async (user, role) => {
    setError("");
    try {
      await api.patch(`/admin/users/${user.id}/role`, { role });
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update user role.");
    }
  };

  const deleteUser = async (user) => {
    if (!confirm(`Delete ${user.username}?`)) return;
    setError("");
    try {
      await api.delete(`/admin/users/${user.id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete user.");
    }
  };

  return (
    <div>
      <h2 className="font-semibold mb-4">Customers ({users.length})</h2>
      {error && <div className="bg-red-50 text-red-700 text-sm rounded-md px-3 py-2 mb-4">{error}</div>}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="p-3">Username</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Joined</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="p-3">{u.username}</td>
                <td className="p-3 text-gray-500">{u.email}</td>
                <td className="p-3">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      u.role === "admin" ? "bg-navy text-white" : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="p-3 text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="p-3 text-right space-x-3">
                  <button
                    onClick={() => updateRole(u, u.role === "admin" ? "user" : "admin")}
                    className="text-teal hover:underline"
                    disabled={u.username === "admin"}
                  >
                    {u.role === "admin" ? "Remove admin" : "Make admin"}
                  </button>
                  <button
                    onClick={() => deleteUser(u)}
                    className="text-red-500 hover:underline"
                    disabled={u.username === "admin"}
                  >
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
