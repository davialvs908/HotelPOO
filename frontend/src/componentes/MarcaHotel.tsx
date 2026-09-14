type Propriedades = {
  variante?: 'escuro' | 'claro';
  compacta?: boolean;
};

export default function MarcaHotel({ variante = 'escuro', compacta = false }: Propriedades) {
  const texto = variante === 'claro' ? 'text-white' : 'text-[#222222]';
  const apoio = variante === 'claro' ? 'text-white/80' : 'text-[#717171]';

  return (
    <div className={`flex items-center gap-2.5 ${texto}`}>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#FF385C]">
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white" aria-hidden="true">
          <path d="M12 4.5 21 13h-2.2v7.5h-4.6V15H9.8v5.5H5.2V13H3L12 4.5z" />
        </svg>
      </span>
      {compacta ? (
        <span className="text-[15px] font-semibold tracking-tight">É o Que Tem Pra Hoje</span>
      ) : (
        <div className="leading-tight">
          <p className="text-[15px] font-semibold tracking-tight">É o Que Tem Pra Hoje</p>
          <p className={`text-[11px] font-medium ${apoio}`}>Hotel · recepção</p>
        </div>
      )}
    </div>
  );
}
