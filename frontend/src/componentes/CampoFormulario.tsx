import { useState, type InputHTMLAttributes } from 'react';

type Propriedades = {
  rotulo: string;
  valor: string;
  aoAlterar: (valor: string) => void;
  mensagemErro?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>;

export default function CampoFormulario({
  rotulo,
  valor,
  aoAlterar,
  mensagemErro,
  id,
  type,
  className,
  ...resto
}: Propriedades) {
  const identificador = id ?? rotulo.toLowerCase().replace(/\s+/g, '-');
  const campoDeSenha = type === 'password';
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const tipoDoCampo = campoDeSenha ? (senhaVisivel ? 'text' : 'password') : type;

  return (
    <label className="block" htmlFor={identificador}>
      <span className="rotulo-campo">{rotulo}</span>
      <span className="relative block">
        <input
          id={identificador}
          className={`entrada ${campoDeSenha ? 'pr-12' : ''} ${className ?? ''}`}
          value={valor}
          type={tipoDoCampo}
          onChange={(evento) => aoAlterar(evento.target.value)}
          {...resto}
        />
        {campoDeSenha ? (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#717171] transition hover:bg-[#F7F7F7] hover:text-[#222222]"
            onClick={() => setSenhaVisivel((visivel) => !visivel)}
            aria-label={senhaVisivel ? 'Ocultar senha' : 'Mostrar senha'}
            aria-pressed={senhaVisivel}
            title={senhaVisivel ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {senhaVisivel ? <IconeOlhoFechado /> : <IconeOlhoAberto />}
          </button>
        ) : null}
      </span>
      {mensagemErro ? <span className="mt-1 block text-xs text-red-700">{mensagemErro}</span> : null}
    </label>
  );
}

function IconeOlhoAberto() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function IconeOlhoFechado() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 3l18 18M10.6 10.6A3 3 0 0 0 12 15a3 3 0 0 0 2.4-4.4M6.7 6.8C4.4 8.2 2.5 12 2.5 12s3.5 7 9.5 7c1.7 0 3.2-.4 4.5-1.1M14.1 5.3C13.4 5.1 12.7 5 12 5c-6 0-9.5 7-9.5 7s.5 1 1.4 2.2M17.3 9.2C19.3 10.6 21.5 12 21.5 12s-1.4 2.6-4 4.6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
