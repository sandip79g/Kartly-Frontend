import React, { useState } from "react";

export default function PasswordField({ label, value, onChange, placeholder, required = false }) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          required={required}
          value={value}
          onChange={onChange}
          className="input-field pr-12"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-gray-500 hover:text-gray-700"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          <span aria-hidden="true">{visible ? "🙈" : "👁️"}</span>
        </button>
      </div>
    </div>
  );
}