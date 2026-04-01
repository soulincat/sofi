"use client";

import { useState } from "react";

export function EditLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/edit/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(json.error || "Login failed");
        return;
      }
      window.location.reload();
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto mb-8 max-w-md rounded border border-neutral-200 bg-neutral-50 p-4 text-left">
      <p className="mb-3 text-xs uppercase tracking-[0.16em] text-neutral-500">Edit mode</p>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter edit password"
          className="w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm"
        />
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-neutral-900 px-3 py-2 text-xs uppercase tracking-[0.14em] text-white disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Unlock editor"}
        </button>
      </form>
    </section>
  );
}
