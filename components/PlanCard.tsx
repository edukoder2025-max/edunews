"use client";

import ContributionButton from "@/components/ContributionButton";

interface PlanCardProps {
  title: string;
  price: string;
  billing: string;
  bullets: string[];
  productId?: string;
}

export default function PlanCard({ title, price, billing, bullets, productId }: PlanCardProps) {
  return (
    <div className="rounded-2xl border border-white/6 bg-white/3 p-6 flex flex-col justify-between">
      <div>
        <h3 className="text-xl font-black text-white mb-2">{title}</h3>
        <div className="text-3xl font-extrabold text-white mb-4">{price}</div>
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-4">{billing}</p>
        <ul className="space-y-2 text-sm text-slate-300 mb-4">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-2">
              <span className="text-primary font-black">•</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <ContributionButton productId={productId} className="w-full" />
        {productId && (
          <p className="text-xs text-slate-500 mt-2">ID producto: {productId}</p>
        )}
        <p className="text-xs text-slate-500 mt-2">Precio tentativo — sujeto a cambios.</p>
      </div>
    </div>
  );
}
