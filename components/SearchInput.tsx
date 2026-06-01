'use client';

import { useState, useRef, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';

export default function SearchInput() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleOpen = () => {
    setIsOpen(true);
    // Small delay to let the CSS transition render before focusing
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleClose = () => {
    setIsOpen(false);
    setQuery('');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    handleClose();
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="relative flex items-center">
      {/* Expanded search form */}
      <form
        onSubmit={handleSubmit}
        className={`
          flex items-center overflow-hidden transition-all duration-300 ease-in-out
          rounded-full border bg-slate-900/80 backdrop-blur-sm shadow-lg shadow-black/20
          ${isOpen
            ? 'w-48 sm:w-64 border-primary/40 opacity-100'
            : 'w-0 border-transparent opacity-0 pointer-events-none'
          }
        `}
        aria-hidden={!isOpen}
      >
        <Search className="ml-3 h-3.5 w-3.5 flex-shrink-0 text-primary" />
        <input
          ref={inputRef}
          type="search"
          id="site-search-input"
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar noticias..."
          className="
            flex-1 bg-transparent px-2 py-1.5 text-[11px] font-bold text-white
            placeholder:text-slate-500 outline-none min-w-0
          "
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="mr-1 p-1 rounded-full text-slate-500 hover:text-white transition-colors"
            aria-label="Limpiar búsqueda"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </form>

      {/* Toggle button */}
      <button
        type="button"
        id="site-search-toggle"
        onClick={isOpen ? handleClose : handleOpen}
        aria-label={isOpen ? 'Cerrar buscador' : 'Abrir buscador'}
        className={`
          ml-2 p-2 rounded-full transition-all duration-200
          ${isOpen
            ? 'text-primary bg-primary/10 border border-primary/40'
            : 'text-primary hover:text-white hover:bg-primary/20 border border-primary/30 hover:border-primary/60'
          }
        `}
      >
        {isOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
      </button>
    </div>
  );
}
