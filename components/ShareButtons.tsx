'use client';

import { Share2, Twitter, Facebook, Link2 } from 'lucide-react';
import { useState } from 'react';

export default function ShareButtons({ url, title }: { url: string, title: string }) {
  const [copied, setCopied] = useState(false);

  const shareOnTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-4 py-6 border-y border-white/5 my-8">
      <span className="text-xs font-black uppercase tracking-widest text-slate-500 mr-2 flex items-center gap-2">
        <Share2 size={14} /> Compartir:
      </span>
      <button 
        onClick={shareOnTwitter}
        className="p-2 rounded-full bg-white/5 hover:bg-primary hover:text-white transition-all text-slate-400"
        title="Compartir en X (Twitter)"
      >
        <Twitter size={18} />
      </button>
      <button 
        onClick={shareOnFacebook}
        className="p-2 rounded-full bg-white/5 hover:bg-blue-600 hover:text-white transition-all text-slate-400"
        title="Compartir en Facebook"
      >
        <Facebook size={18} />
      </button>
      <button 
        onClick={copyToClipboard}
        className="p-2 rounded-full bg-white/5 hover:bg-slate-700 hover:text-white transition-all text-slate-400 relative"
        title="Copiar enlace"
      >
        <Link2 size={18} />
        {copied && (
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] px-2 py-1 rounded-md font-bold whitespace-nowrap animate-bounce">
            ¡Copiado!
          </span>
        )}
      </button>
    </div>
  );
}
