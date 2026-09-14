import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variante = 'principal' | 'secundario' | 'perigo' | 'silencioso';

type Propriedades = {
  children: ReactNode;
  variante?: Variante;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const ESTILOS: Record<Variante, string> = {
  principal: 'bg-[#FF385C] text-white hover:bg-[#E00B41] disabled:bg-[#FF385C]/40 disabled:text-white/80',
  secundario:
    'border border-[#DDDDDD] bg-white text-[#222222] hover:bg-[#F7F7F7] disabled:opacity-50',
  perigo:
    'border border-[#DDDDDD] bg-white text-[#C13515] hover:bg-[#FFF8F6] disabled:opacity-50',
  silencioso: 'text-[#222222] underline-offset-4 hover:underline disabled:opacity-50',
};

export default function BotaoAcao({
  children,
  variante = 'principal',
  className = '',
  type = 'button',
  ...resto
}: Propriedades) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed ${ESTILOS[variante]} ${className}`}
      {...resto}
    >
      {children}
    </button>
  );
}
