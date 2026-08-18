import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="text-center py-24">
      <h1 className="text-4xl font-bold text-navy mb-2">404</h1>
      <p className="text-gray-500 mb-6">We couldn't find the page you're looking for.</p>
      <Link to="/" className="btn-primary">
        Back to home
      </Link>
    </div>
  );
}
