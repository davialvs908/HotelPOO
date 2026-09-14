import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type VarianteToast = 'ok' | 'erro';

type ToastVisivel = {
  mensagem: string;
  variante: VarianteToast;
};

type ContextoToast = {
  avisar: (mensagem: string) => void;
  avisarErro: (mensagem: string) => void;
};

const ToastContexto = createContext<ContextoToast | null>(null);

export default function ProvedorToast({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastVisivel | null>(null);

  const mostrar = useCallback((mensagem: string, variante: VarianteToast) => {
    setToast({ mensagem, variante });
    window.setTimeout(() => setToast(null), 4200);
  }, []);

  const avisar = useCallback((mensagem: string) => mostrar(mensagem, 'ok'), [mostrar]);
  const avisarErro = useCallback((mensagem: string) => mostrar(mensagem, 'erro'), [mostrar]);

  const valor = useMemo(() => ({ avisar, avisarErro }), [avisar, avisarErro]);

  return (
    <ToastContexto.Provider value={valor}>
      {children}
      {toast ? (
        <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
          <p
            className={`pointer-events-auto max-w-lg rounded-full px-5 py-3 text-sm shadow-pill ${
              toast.variante === 'ok' ? 'bg-[#222222] text-white' : 'bg-[#C13515] text-white'
            }`}
            role="status"
          >
            {toast.mensagem}
          </p>
        </div>
      ) : null}
    </ToastContexto.Provider>
  );
}

export function useToast(): ContextoToast {
  const contexto = useContext(ToastContexto);
  if (!contexto) {
    throw new Error('useToast precisa estar dentro de ProvedorToast.');
  }
  return contexto;
}
