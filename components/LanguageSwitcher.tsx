"use client";

import { useEffect, useState } from "react";

const LANGUAGES = [
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
];

export default function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState("es");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // 1. Inicializar la función de Google Translate
    window.googleTranslateElementInit = () => {
      if (typeof window !== "undefined" && (window as any).google?.translate?.TranslateElement) {
        new (window as any).google.translate.TranslateElement(
          {
            pageLanguage: "es",
            includedLanguages: "en,es,pt,fr,it,de",
            autoDisplay: false,
          },
          "google_translate_element_hidden" // Se renderiza de manera oculta
        );
      }
    };

    // 2. Cargar el script si no existe
    const scriptId = "google-translate-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    } else if (window.googleTranslateElementInit) {
      window.googleTranslateElementInit();
    }

    // 3. Detectar si ya hay una traducción activa en las cookies
    const checkCookieInterval = setInterval(() => {
      const match = document.cookie.match(/googtrans=\/es\/([^;]+)/);
      if (match && match[1]) {
        setCurrentLang(match[1]);
      } else {
        setCurrentLang("es");
      }
    }, 1000);

    return () => clearInterval(checkCookieInterval);
  }, []);

  // Función para forzar el cambio en el selector de Google Translate oculto
  const changeLanguage = (langCode: string) => {
    setCurrentLang(langCode);
    setIsOpen(false);

    try {
      const googleSelect = document.querySelector(
        "#google_translate_element_hidden select"
      ) as HTMLSelectElement | null;

      if (googleSelect) {
        googleSelect.value = langCode;
        // Lanzamos el evento change para que el script de Google reaccione
        googleSelect.dispatchEvent(new Event("change"));
      } else {
        // Fallback alternativo: escribir directamente la cookie y recargar si no se encuentra
        document.cookie = `googtrans=/es/${langCode}; path=/; domain=.${window.location.hostname.replace("www.", "")}`;
        document.cookie = `googtrans=/es/${langCode}; path=/`;
        window.location.reload();
      }
    } catch (error) {
      console.error("Error al cambiar idioma:", error);
    }
  };

  const activeLangObj = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  return (
    <div className="relative inline-block text-left z-50">
      {/* Botón premium visible */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-slate-900/80 hover:bg-slate-800 border border-white/10 hover:border-primary/40 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider text-slate-300 hover:text-white transition-all shadow-md active:scale-95"
      >
        <span className="text-base leading-none">{activeLangObj.flag}</span>
        <span>{activeLangObj.label}</span>
        <svg
          className={`w-3 h-3 transition-transform duration-300 ${isOpen ? "rotate-180 text-primary" : "text-slate-500"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Menú desplegable animado */}
      {isOpen && (
        <>
          {/* Overlay para cerrar al hacer clic afuera */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          
          <div className="absolute left-0 mt-2 w-40 rounded-xl bg-slate-950/95 border border-white/10 shadow-2xl backdrop-blur-md z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="py-1">
              <div className="px-3 py-1 text-[9px] font-black tracking-widest text-slate-500 uppercase border-b border-white/5 mb-1">
                Seleccionar idioma
              </div>
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-bold transition-all text-left ${
                    currentLang === lang.code
                      ? "bg-primary/10 text-primary border-l-2 border-primary"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="text-base leading-none">{lang.flag}</span>
                  <span className="flex-1">{lang.label}</span>
                  {currentLang === lang.code && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Selector de Google Translate original, completamente oculto en el DOM */}
      <div id="google_translate_element_hidden" className="hidden" style={{ display: "none" }} />
    </div>
  );
}
