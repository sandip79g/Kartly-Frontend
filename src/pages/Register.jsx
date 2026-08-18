import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import PasswordField from "../components/PasswordField.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setSubmitting(true);
    try {
      await register(form.username, form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 mb-16 px-4">
      <div className="card p-8">
        <h1 className="text-xl font-bold mb-6">Create your account</h1>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-3 py-2 mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              required
              value={form.username}
              onChange={update("username")}
              className="input-field"
              placeholder="Choose a username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={update("email")}
              className="input-field"
              placeholder="you@example.com"
            />
          </div>
          <PasswordField
            label="Password"
            required
            value={form.password}
            onChange={update("password")}
            placeholder="At least 6 characters"
          />
          <PasswordField
            label="Confirm password"
            required
            value={form.confirm}
            onChange={update("confirm")}
            placeholder="Re-enter password"
          />
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>
        <p className="text-sm mt-6 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-teal font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
