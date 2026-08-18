import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { avatarUrlFor } from "../utils/avatar.js";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const avatarUrl = avatarUrlFor(user);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(query ? `/?search=${encodeURIComponent(query)}` : "/");
  };

  return (
    <header className="bg-navy text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-1 shrink-0">
          <span className="text-2xl font-display font-bold tracking-tight">Kart<span className="text-amber">ly</span></span>
        </Link>

        <form onSubmit={handleSearch} className="flex-1 hidden md:flex">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, brands, and categories"
            className="w-full rounded-l-md px-3 py-2 text-gray-900 text-sm focus:outline-none"
          />
          <button
            type="submit"
            className="bg-amber hover:bg-amber-dark px-4 rounded-r-md flex items-center justify-center"
            aria-label="Search"
          >
            🔍
          </button>
        </form>

        <nav className="flex items-center gap-4 text-sm ml-auto">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex flex-col items-start leading-tight hover:text-amber"
              >
                <span className="flex items-center gap-2 text-left">
                  <img src={avatarUrl} alt={user.username} className="w-8 h-8 rounded-full object-cover border border-white/20" />
                  <span>
                    <span className="block text-xs text-gray-300">Hello, {user.username}</span>
                    <span className="font-semibold">Account ▾</span>
                  </span>
                </span>
              </button>
              {menuOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-md shadow-lg py-2 z-50"
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <Link to="/account" className="block px-4 py-2 hover:bg-gray-100" onClick={() => setMenuOpen(false)}>
                    Account settings
                  </Link>
                  {user.role === "admin" ? (
                    <Link to="/admin" className="block px-4 py-2 hover:bg-gray-100" onClick={() => setMenuOpen(false)}>
                      Admin dashboard
                    </Link>
                  ) : (
                    <Link to="/orders" className="block px-4 py-2 hover:bg-gray-100" onClick={() => setMenuOpen(false)}>
                      My orders
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                      navigate("/");
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="flex flex-col items-start leading-tight hover:text-amber">
              <span className="text-xs text-gray-300">Hello, sign in</span>
              <span className="font-semibold">Account</span>
            </Link>
          )}

          {user?.role !== "admin" && (
            <Link to="/cart" className="relative flex items-center gap-1 hover:text-amber">
              <span className="text-xl">🛒</span>
              {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber text-navy-dark text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {count}
                </span>
              )}
              <span className="hidden lg:inline font-semibold">Cart</span>
            </Link>
          )}
        </nav>
      </div>

      <form onSubmit={handleSearch} className="flex md:hidden px-4 pb-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Kartly"
          className="w-full rounded-l-md px-3 py-2 text-gray-900 text-sm focus:outline-none"
        />
        <button type="submit" className="bg-amber px-4 rounded-r-md">🔍</button>
      </form>

      <div className="bg-navy-light px-4 py-1.5 text-xs md:text-sm flex gap-4 overflow-x-auto">
        <Link to="/" className="hover:text-amber whitespace-nowrap">All products</Link>
        {["Electronics", "Fashion", "Home & Kitchen", "Books", "Sports & Outdoors"].map((c) => (
          <Link key={c} to={`/?category=${encodeURIComponent(c)}`} className="hover:text-amber whitespace-nowrap">
            {c}
          </Link>
        ))}
      </div>
    </header>
  );
}
