import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import PasswordField from "../components/PasswordField.jsx";
import { avatarUrlFor } from "../utils/avatar.js";

export default function AccountSettings() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState({ full_name: "", email: "", avatar_url: "" });
  const [password, setPassword] = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (!user) return;
    setProfile({
      full_name: user.full_name || "",
      email: user.email || "",
      avatar_url: user.avatar_url || "",
    });
  }, [user]);

  const previewAvatar = useMemo(
    () => avatarUrlFor({ ...user, ...profile }),
    [user, profile]
  );

  const updateProfileField = (field) => (e) => setProfile((current) => ({ ...current, [field]: e.target.value }));
  const updatePasswordField = (field) => (e) => setPassword((current) => ({ ...current, [field]: e.target.value }));

  const uploadAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    setError("");
    setMessage("");
    setUploadingAvatar(true);

    try {
      const avatarDataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const image = new Image();
          image.onload = () => {
            const maxSize = 320;
            const scale = Math.min(1, maxSize / image.width, maxSize / image.height);
            const canvas = document.createElement("canvas");
            canvas.width = Math.max(1, Math.round(image.width * scale));
            canvas.height = Math.max(1, Math.round(image.height * scale));
            const context = canvas.getContext("2d");
            if (!context) {
              reject(new Error("Could not prepare the image."));
              return;
            }
            context.drawImage(image, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL("image/jpeg", 0.8));
          };
          image.onerror = () => reject(new Error("Could not process the selected image."));
          image.src = String(reader.result);
        };
        reader.onerror = () => reject(new Error("Could not read the selected image."));
        reader.readAsDataURL(file);
      });

      setProfile((current) => ({ ...current, avatar_url: String(avatarDataUrl) }));
      setMessage("Avatar selected. Save profile to upload it.");
    } catch (err) {
      setError(err.message || "Could not upload image.");
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  };

  const submitProfile = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSavingProfile(true);
    try {
      await api.put("/auth/me", profile);
      await refreshUser();
      setMessage("Profile updated.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSavingPassword(true);
    try {
      await api.put("/auth/password", password);
      setPassword({ current_password: "", new_password: "", confirm_password: "" });
      setMessage("Password updated.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not update password.");
    } finally {
      setSavingPassword(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="card p-6 flex flex-col md:flex-row md:items-center gap-5">
        <img src={previewAvatar} alt={user.username} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md" />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h1 className="text-2xl font-bold">Account settings</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 capitalize">{user.role}</span>
          </div>
          <p className="text-gray-500 text-sm">Update your profile picture, display name, email, and password from one place.</p>
          <p className="text-xs text-gray-400 mt-2">Signed in as {user.username}</p>
        </div>
      </div>

      {message && <div className="bg-green-50 text-green-700 text-sm rounded-md px-3 py-2">{message}</div>}
      {error && <div className="bg-red-50 text-red-700 text-sm rounded-md px-3 py-2">{error}</div>}

      <div className="grid lg:grid-cols-2 gap-6">
        <form onSubmit={submitProfile} className="card p-6 space-y-4">
          <h2 className="font-semibold text-lg">Profile information</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Full name</label>
            <input
              type="text"
              value={profile.full_name}
              onChange={updateProfileField("full_name")}
              className="input-field"
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              required
              type="email"
              value={profile.email}
              onChange={updateProfileField("email")}
              className="input-field"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Profile picture</label>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <input
                type="file"
                accept="image/*"
                onChange={uploadAvatar}
                className="input-field"
                disabled={uploadingAvatar}
              />
              <span className="text-xs text-gray-500 sm:w-40">
                {uploadingAvatar ? "Loading image…" : "Choose a local image file"}
              </span>
            </div>
            <div className="mt-3 grid gap-2">
              <label className="block text-xs font-medium text-gray-500">Or paste an image URL</label>
              <input
                type="url"
                value={profile.avatar_url}
                onChange={updateProfileField("avatar_url")}
                className="input-field"
                placeholder="https://..."
              />
              <p className="text-xs text-gray-500">Leave blank to use an auto-generated avatar.</p>
            </div>
          </div>
          <button type="submit" disabled={savingProfile} className="btn-primary">
            {savingProfile ? "Saving profile…" : "Save profile"}
          </button>
        </form>

        <form onSubmit={submitPassword} className="card p-6 space-y-4">
          <h2 className="font-semibold text-lg">Change password</h2>
          <PasswordField
            label="Current password"
            required
            value={password.current_password}
            onChange={updatePasswordField("current_password")}
            placeholder="Enter current password"
          />
          <PasswordField
            label="New password"
            required
            value={password.new_password}
            onChange={updatePasswordField("new_password")}
            placeholder="Enter new password"
          />
          <PasswordField
            label="Confirm new password"
            required
            value={password.confirm_password}
            onChange={updatePasswordField("confirm_password")}
            placeholder="Re-enter new password"
          />
          <button type="submit" disabled={savingPassword} className="btn-primary">
            {savingPassword ? "Updating password…" : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}