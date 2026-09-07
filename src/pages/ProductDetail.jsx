import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { formatPound } from "../utils/currency.js";
import ChatBot from "../components/ChatBot.jsx";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);

  const loadProduct = () => {
    api.get(`/products/${id}`).then(({ data }) => setProduct(data.product));
  };

  useEffect(() => {
    loadProduct();
    setAdded(false);
  }, [id]);

  if (!product) return <div className="text-center py-20 text-gray-500">Loading…</div>;

  const images = Array.isArray(product.images) && product.images.length ? product.images : [product.image].filter(Boolean);
  const discountedPrice = Number(product.discounted_price ?? product.price);
  const hasDiscount = Number(product.discount_percent || 0) > 0;
  const reviewCount = Number(product.review_count || 0);
  const reviewAverage = Number(product.rating || 0);
  const ownReview = user ? product.reviews?.find((review) => review.user_id === user.id) : null;

  const submitReview = async (e) => {
    e.preventDefault();
    setReviewError("");
    setReviewSuccess("");
    setSubmittingReview(true);
    try {
      await api.post(`/products/${id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewComment("");
      setReviewRating(5);
      setEditingReviewId(null);
      setReviewSuccess("Your review has been saved.");
      loadProduct();
    } catch (err) {
      setReviewError(err.response?.data?.message || "Could not save review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (value) => "★".repeat(Math.round(value || 0)) + "☆".repeat(5 - Math.round(value || 0));

  const startEditReview = (review) => {
    setEditingReviewId(review.id);
    setReviewRating(review.rating);
    setReviewComment(review.comment);
    setReviewSuccess("");
    setReviewError("");
  };

  const deleteReview = async () => {
    if (!confirm("Delete your review?")) return;
    setReviewError("");
    setReviewSuccess("");
    try {
      await api.delete(`/products/${id}/reviews`);
      setEditingReviewId(null);
      setReviewRating(5);
      setReviewComment("");
      setReviewSuccess("Your review was deleted.");
      loadProduct();
    } catch (err) {
      setReviewError(err.response?.data?.message || "Could not delete review.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="card p-6 flex items-center justify-center">
          <img src={images[0]} alt={product.title} className="max-h-96 object-cover rounded-md" />
        </div>
        <div>
          <h1 className="text-2xl font-bold mb-2">{product.title}</h1>
          <div className="flex items-center gap-1 text-amber text-sm mb-3">
            {renderStars(reviewAverage)}
            <span className="text-gray-400">({reviewAverage.toFixed(1)})</span>
            {product.category && (
              <span className="ml-3 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {product.category}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mb-3">{reviewCount} review{reviewCount === 1 ? "" : "s"}</p>
          <div className="mb-4 flex items-baseline gap-3">
            <div className="text-3xl font-bold text-navy">{formatPound(discountedPrice)}</div>
            {hasDiscount && <div className="text-base text-gray-400 line-through">{formatPound(product.price)}</div>}
          </div>
          {hasDiscount && <p className="text-teal text-sm font-medium mb-4">Discount {Number(product.discount_percent).toFixed(0)}% applied</p>}
          <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>

          {product.stock > 0 ? (
            <p className="text-teal text-sm font-medium mb-4">In stock ({product.stock} available)</p>
          ) : (
            <p className="text-red-500 text-sm font-medium mb-4">Out of stock</p>
          )}

          <div className="flex items-center gap-3 mb-6">
            <label className="text-sm font-medium">Qty</label>
            <select
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="input-field w-20"
              disabled={product.stock === 0}
            >
              {Array.from({ length: Math.min(product.stock, 10) || 1 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-3 mb-6">
              {images.slice(0, 4).map((src, index) => (
                <img key={`${src}-${index}`} src={src} alt={`${product.title} ${index + 1}`} className="w-full h-20 object-cover rounded-md border" />
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => {
                addItem(product, quantity);
                setAdded(true);
              }}
              disabled={product.stock === 0}
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Add to cart
            </button>
            <button
              onClick={() => {
                addItem(product, quantity);
                navigate("/cart");
              }}
              disabled={product.stock === 0}
              className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Buy now
            </button>
          </div>
          {added && <p className="text-sm text-teal mt-3">Added to cart ✓</p>}
        </div>
      </div>

      <div className="fixed bottom-4 right-4 z-50">
        <ChatBot />
      </div>

      <div className="mt-10 grid lg:grid-cols-2 gap-6">
        <section className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Customer reviews</h2>
          {product.reviews && product.reviews.length > 0 ? (
            <div className="space-y-4">
              {product.reviews.map((review) => (
                <article
                  key={review.id}
                  className={`border rounded-lg p-4 ${review.user_id === user?.id ? "ring-2 ring-teal/40 bg-teal/5" : ""}`}
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div>
                      <p className="font-medium text-sm">{review.username}</p>
                      <p className="text-xs text-gray-400">{new Date(review.created_at).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-amber text-sm">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</div>
                      {review.user_id === user?.id && (
                        <div className="flex items-center gap-3 text-xs font-medium">
                          <button
                            type="button"
                            onClick={() => startEditReview(review)}
                            className="text-teal hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={deleteReview}
                            className="text-red-500 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No reviews yet. Be the first to review this product.</p>
          )}
        </section>

        <section className="card p-6">
          <h2 className="text-lg font-semibold mb-4">{editingReviewId ? "Edit your review" : "Leave a review"}</h2>
          {!user ? (
            <p className="text-sm text-gray-500">Please sign in to leave a review.</p>
          ) : (
            <form onSubmit={submitReview} className="space-y-4">
              {reviewError && <div className="bg-red-50 text-red-700 text-sm rounded-md px-3 py-2">{reviewError}</div>}
              {reviewSuccess && <div className="bg-green-50 text-green-700 text-sm rounded-md px-3 py-2">{reviewSuccess}</div>}
              <div>
                <label className="block text-sm font-medium mb-2">Your rating</label>
                <div className="flex gap-2 text-2xl">
                  {Array.from({ length: 5 }, (_, index) => index + 1).map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className={`transition ${star <= reviewRating ? "text-amber" : "text-gray-300"}`}
                      aria-label={`Rate ${star} star${star === 1 ? "" : "s"}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Comment</label>
                <textarea
                  required
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="input-field"
                  placeholder="Share your thoughts about this product"
                />
              </div>
              <button type="submit" disabled={submittingReview} className="btn-primary">
                {submittingReview ? "Saving…" : editingReviewId ? "Update review" : "Submit review"}
              </button>
              {editingReviewId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingReviewId(null);
                    setReviewRating(5);
                    setReviewComment("");
                    setReviewError("");
                    setReviewSuccess("");
                  }}
                  className="btn-secondary ml-3"
                >
                  Cancel edit
                </button>
              )}
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
