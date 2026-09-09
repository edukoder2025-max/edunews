'use strict';
'use client';

import React, { useState } from 'react';
import { Mail, Check, AlertCircle, Loader2, Sparkles } from 'lucide-react';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    if (!agreed) {
      setStatus('error');
      setMessage('Debes aceptar las políticas de privacidad.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setMessage(data.message || '¡Gracias por suscribirte!');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Ocurrió un error al procesar tu solicitud.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Error de conexión. Inténtalo más tarde.');
    }
  };

  return (
    <div className="w-full relative group">
      {/* Background glow effects */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl blur-md opacity-25 group-hover:opacity-40 transition duration-700"></div>
      
      {/* Main card */}
      <div className="relative bg-slate-950/80 border border-white/10 hover:border-white/20 rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-2xl transition-all duration-300">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 bg-primary/10 border border-primary/20 text-primary rounded-lg">
              <Mail size={14} className="animate-pulse" />
            </span>
            <h3 className="text-xs font-black uppercase tracking-wider text-white">
              Suscripción al Boletín
            </h3>
          </div>
          
          <h4 className="text-xl md:text-2xl font-black font-serif text-white leading-tight">
            Recibí noticias neutras en tu email
          </h4>
          
          <p className="text-xs text-slate-400 leading-relaxed font-sans max-w-lg">
            Unite a nuestra comunidad y recibí diariamente un resumen objetivo, analizado y neutralizado por nuestra Inteligencia Artificial. Sin sesgo, sin clickbaits.
          </p>

          <form onSubmit={handleSubmit} className="mt-2 space-y-4">
            <div className="flex flex-col sm:flex-row gap-2 relative">
              <div className="relative flex-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Tu correo electrónico..."
                  required
                  disabled={status === 'loading' || status === 'success'}
                  className="w-full h-11 px-4 pl-10 bg-slate-900/60 border border-white/10 hover:border-white/20 focus:border-primary/50 text-slate-100 placeholder-slate-500 rounded-xl text-sm focus:outline-none transition-all duration-350 focus:ring-1 focus:ring-primary/20 disabled:opacity-50"
                />
                <Mail className="absolute left-3.5 top-3.5 text-slate-500" size={15} />
              </div>
              
              <button
                type="submit"
                disabled={status === 'loading' || status === 'success'}
                className="h-11 px-6 bg-primary hover:bg-primary/90 disabled:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 flex-shrink-0 disabled:opacity-50"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Procesando...
                  </>
                ) : status === 'success' ? (
                  <>
                    <Check size={14} />
                    Suscrito
                  </>
                ) : (
                  <>
                    Suscribirse
                    <Sparkles size={12} className="text-secondary" />
                  </>
                )}
              </button>
            </div>

            {/* Checkbox agreed */}
            <div className="flex items-start gap-2 pt-1 select-none">
              <input
                id="privacy-agreement"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                disabled={status === 'loading' || status === 'success'}
                className="mt-0.5 rounded border-white/10 bg-slate-900 text-primary focus:ring-0 cursor-pointer"
              />
              <label htmlFor="privacy-agreement" className="text-[10px] text-slate-400 hover:text-slate-300 transition-colors leading-tight cursor-pointer">
                Acepto la <a href="/privacidad" className="text-primary hover:underline">Política de Privacidad</a> y consiento el envío del boletín diario de El Irónico.
              </label>
            </div>
          </form>

          {/* Feedback Messages */}
          {status === 'success' && (
            <div className="flex items-center gap-2 text-xs font-bold text-secondary bg-secondary/10 border border-secondary/20 p-3 rounded-xl animate-fadeIn">
              <Check size={14} className="flex-shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-center gap-2 text-xs font-bold text-primary bg-primary/10 border border-primary/20 p-3 rounded-xl animate-fadeIn">
              <AlertCircle size={14} className="flex-shrink-0" />
              <span>{message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
