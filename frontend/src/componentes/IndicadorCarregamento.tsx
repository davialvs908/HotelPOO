export default function IndicadorCarregamento({ rotulo }: { rotulo?: string }) {
  return (
    <div className="flex items-center gap-3 text-[#717171]" role="status">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#EBEBEB] border-t-[#FF385C]" />
      <span className="text-sm">{rotulo ?? 'Carregando...'}</span>
    </div>
  );
}
