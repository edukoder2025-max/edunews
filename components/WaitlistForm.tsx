"use client";

import React, { useState } from "react";
import { Mail, Loader2, Check, AlertCircle } from "lucide-react";

export default function WaitlistForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [planInterest, setPlanInterest] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    setMessage("");

    try {
      // Reuse existing newsletter subscribe API; include optional meta data
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, planInterest }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus("success");
        setMessage(data.message || "¡Gracias! Te avisaremos cuando esté listo.");
        setEmail("");
        setName("");
        setPlanInterest("");
      } else {
        setStatus("error");
        setMessage(data.error || "Ocurrió un error.");
      }
    } catch (err) {
      setStatus("error");
      setMessage("Error de conexión. Intentá más tarde.");
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
      <h4 className="text-lg font-black text-white mb-2">Sumate a la lista de espera</h4>
      <p className="text-sm text-slate-400 mb-4">Dejanos tu correo y te avisamos cuando el plan que te interesa esté activo.</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre (opcional)"
          className="w-full px-3 py-2 rounded-md bg-slate-800 border border-white/6 text-slate-200"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Tu mejor email"
          required
          className="w-full px-3 py-2 rounded-md bg-slate-800 border border-white/6 text-slate-200"
        />
        <select value={planInterest} onChange={(e) => setPlanInterest(e.target.value)} className="w-full px-3 py-2 rounded-md bg-slate-800 border border-white/6 text-slate-200">
          <option value="">Me interesa cualquiera</option>
          <option value="SWGPD.6475-3335-7339-51942">Mensual - Pro (ARS 12.000)</option>
          <option value="SWGPD.5733-3925-7955-85083">Mensual - Básico (ARS 2.000)</option>
          <option value="SWGPD.8127-6310-7908-87558">Mensual - Plus (ARS 8.000)</option>
          <option value="SWGPD.6766-5588-5806-80332">Pago Único - Lifetime (ARS 15.000)</option>
          <option value="SWGPD.4052-8733-6638-17843">Pago Único - Lifetime (ARS 10.000)</option>
          <option value="SWGPD.3524-7125-9967-63960">Pago Único - Lifetime (ARS 5.000)</option>
        </select>

        <div className="flex items-center gap-2">
          <button type="submit" disabled={status === 'loading' || status === 'success'} className="px-4 py-2 bg-primary rounded-md font-black uppercase text-sm">
            {status === 'loading' ? (
              <>
                <Loader2 className="animate-spin" size={16} /> Enviando...
              </>
            ) : status === 'success' ? (
              <>
                <Check size={14} /> Enviado
              </>
            ) : (
              "Unirme a la lista"
            )}
          </button>
          {status === 'error' && <div className="text-sm text-primary">{message}</div>}
        </div>
      </form>

      {status === 'success' && <div className="mt-3 text-sm text-secondary">{message}</div>}
    </div>
  );
}
