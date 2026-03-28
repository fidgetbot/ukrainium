"use client";

import { useState } from "react";
import { login } from "../actions";

export function LoginForm() {
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          name="email"
          type="email"
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0057B7] focus:border-transparent outline-none transition-all"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          name="password"
          type="password"
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0057B7] focus:border-transparent outline-none transition-all"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        className="w-full py-3 bg-[#0057B7] text-white rounded-xl font-semibold hover:bg-[#004494] transition-colors shadow-md"
      >
        Login
      </button>
    </form>
  );
}
