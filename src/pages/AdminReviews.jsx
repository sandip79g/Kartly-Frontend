import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios.js";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/admin/reviews");
      setReviews(data.reviews);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this review?")) return;
    setError("");
    try {
      await api.delete(`/admin/reviews/${id}`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete review.");
    }
  };

  const filteredReviews = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return reviews;
    return reviews.filter((review) =>
      [review.username, review.email, review.product_title, review.comment]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(needle)
    );
  }, [query, reviews]);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div>
          <h2 className="font-semibold">Reviews ({filteredReviews.length})</h2>
          <p className="text-xs text-gray-500 mt-1">Moderate product feedback from customers.</p>
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input-field md:w-80"
          placeholder="Search customer, product, review..."
        />
      </div>

      {loading && <div className="text-gray-500">Loading reviews…</div>}
      {error && <div className="bg-red-50 text-red-700 text-sm rounded-md px-3 py-2 mb-4">{error}</div>}

      {!loading && !error && filteredReviews.length === 0 && (
        <div className="card p-6 text-center text-gray-500">No reviews found.</div>
      )}

      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <div key={review.id} className="card p-5">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-3">
              <div className="flex items-start gap-3">
                <img src={review.product_image} alt="" className="w-14 h-14 rounded-md object-cover" />
                <div>
                  <p className="font-medium">{review.product_title}</p>
                  <p className="text-xs text-gray-500">
                    {review.username} · {review.email}
                  </p>
                  <p className="text-xs text-gray-400">{new Date(review.created_at).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-amber text-sm">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
                <button onClick={() => handleDelete(review.id)} className="text-red-500 text-sm hover:underline">
                  Delete
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}