"use client";

import { useState } from "react";

export function PayButton({ label = "Assinar Premium" }: { label?: string }) {
  const [loading, setLoading] = useState(false);

  function onClick() {
    setLoading(true);
    // navega para o endpoint (GET) e ele redireciona para o checkout
    window.location.href = "/api/pay/owner/start";
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      style={{
        padding: 12,
        borderRadius: 10,
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.7 : 1,
      }}
    >
      {loading ? "Abrindo checkout..." : label}
    </button>
  );
}
