import type { ReactNode } from 'react';
import type { QuartoHotel, StatusQuarto } from '../tipos/dominio';
import { formatarMoeda } from '../util/formatacao';
import { precoDiaria } from '../util/precos';
import { rotuloStatusQuarto, rotuloTipoQuarto } from '../util/rotulos';
import FotoQuarto from './FotoQuarto';

type Propriedades = {
  quarto: QuartoHotel;
  detalhe?: string;
  acao?: ReactNode;
  selecionado?: boolean;
  onClick?: () => void;
};

function statusDoQuarto(quarto: QuartoHotel): StatusQuarto {
  return (quarto.status ?? (quarto.disponivel === false ? 'OCUPADO' : 'LIVRE')) as StatusQuarto;
}

export default function CartaoQuarto({
  quarto,
  detalhe,
  acao,
  selecionado = false,
  onClick,
}: Propriedades) {
  const status = statusDoQuarto(quarto);
  const diaria = precoDiaria(quarto.tipo, quarto.precoBasePorNoite);
  const classeSelecao = selecionado ? 'ring-2 ring-[#FF385C] ring-offset-2' : '';

  const corpo = (
    <>
      <div className={`relative ${classeSelecao} rounded-2xl`}>
        <FotoQuarto
          tipo={quarto.tipo}
          numero={quarto.numero}
          className="aspect-[3/2] rounded-2xl"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-medium text-[#222222] shadow-sm">
          {rotuloStatusQuarto(status)}
        </span>
      </div>
      <div className="mt-2 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-semibold text-[#222222]">Quarto {quarto.numero}</h3>
          <p className="text-sm text-[#717171]">{rotuloTipoQuarto(quarto.tipo)}</p>
          {detalhe ? <p className="text-sm text-[#717171]">{detalhe}</p> : null}
        </div>
        <p className="shrink-0 text-[15px] text-[#222222]">
          <span className="font-semibold">{formatarMoeda(diaria)}</span>
          <span className="font-normal text-[#717171]"> noite</span>
        </p>
      </div>
      {acao ? <div className="mt-2">{acao}</div> : null}
    </>
  );

  if (onClick) {
    return (
      <button type="button" className="w-full text-left" onClick={onClick}>
        {corpo}
      </button>
    );
  }

  return <article>{corpo}</article>;
}
