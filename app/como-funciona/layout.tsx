import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/seoUtils';

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: 'Cómo funciona El Irónico | Método y transparencia',
  description: 'Conocé cómo El Irónico compara fuentes, neutraliza el lenguaje y separa hechos, contexto y conclusiones no demostradas.',
  keywords: 'cómo funciona El Irónico, noticias sin sesgo, periodismo IA, auditoría de sesgos, transparencia editorial',
  alternates: {
    canonical: `${siteUrl}/como-funciona`,
  },
  openGraph: {
    title: 'Cómo funciona El Irónico | Método y transparencia',
    description: 'Conocé el método de lectura neutralizada, comparación de fuentes y trazabilidad de El Irónico.',
    url: `${siteUrl}/como-funciona`,
    siteName: 'El Irónico',
    type: 'article',
  },
};

export default function ComoFuncionaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
