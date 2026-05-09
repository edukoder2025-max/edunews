"use client";

import { useState, useEffect } from "react";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Solo mostrar el banner si no ha sido aceptado antes
    const hasAccepted = localStorage.getItem("cookie_consent");
    if (!hasAccepted) {
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookie_consent", "true");
    setIsVisible(false);
  };

  const rejectCookies = () => {
    localStorage.setItem("cookie_consent", "rejected");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 p-4 z-50 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-slate-300">
          Utilizamos cookies propias y de terceros para personalizar el contenido, adaptar los anuncios y analizar nuestro tráfico (requerido por Google AdSense). Al continuar navegando, aceptas nuestra <a href="/cookies" className="text-primary hover:underline">Política de Cookies</a> y <a href="/privacidad" className="text-primary hover:underline">Política de Privacidad</a>.
        </div>
        <div className="flex gap-2 whitespace-nowrap">
          <button 
            onClick={rejectCookies}
            className="px-4 py-2 text-sm font-medium text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            Rechazar opcionales
          </button>
          <button 
            onClick={acceptCookies}
            className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
          >
            Aceptar todas
          </button>
        </div>
      </div>
    </div>
  );
}
