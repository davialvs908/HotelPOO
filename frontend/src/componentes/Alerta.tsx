type Propriedades = {
  mensagem?: string;
  variante?: 'erro' | 'aviso' | 'ok';
};

export default function Alerta({ mensagem, variante = 'erro' }: Propriedades) {
  if (!mensagem) {
    return null;
  }

  const cores =
    variante === 'ok'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
      : variante === 'aviso'
        ? 'border-amber-200 bg-amber-50 text-amber-950'
        : 'border-red-200 bg-red-50 text-red-800';

  return (
    <p className={`rounded-xl border px-3 py-2 text-sm ${cores}`} role="alert">
      {mensagem}
    </p>
  );
}
