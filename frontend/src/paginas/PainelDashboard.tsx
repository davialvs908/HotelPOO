import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiCliente, mensagemDeErro } from '../api/apiCliente';
import Alerta from '../componentes/Alerta';
import BotaoAcao from '../componentes/BotaoAcao';
import CartaoQuarto from '../componentes/CartaoQuarto';
import IndicadorCarregamento from '../componentes/IndicadorCarregamento';
import type { PainelIndicadores, QuartoHotel, ReservaHospedagem } from '../tipos/dominio';
import { formatarMoeda, formatarPercentual, hojeIso, apenasDataIso } from '../util/formatacao';
import { reservaCancelada, reservaFinalizada } from '../util/permissoes';

function dataPorExtenso(): string {
  const texto = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export default function PainelDashboard() {
  const [indicadores, setIndicadores] = useState<PainelIndicadores | null>(null);
  const [quartos, setQuartos] = useState<QuartoHotel[]>([]);
  const [reservas, setReservas] = useState<ReservaHospedagem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mensagemErro, setMensagemErro] = useState('');

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const [painel, listaQuartos, listaReservas] = await Promise.all([
          apiCliente.get<PainelIndicadores>('/api/dashboard'),
          apiCliente.get<QuartoHotel[]>('/api/quartos'),
          apiCliente.get<ReservaHospedagem[]>('/api/reservas'),
        ]);
        if (!ativo) {
          return;
        }
        setIndicadores(painel);
        setQuartos(Array.isArray(listaQuartos) ? listaQuartos : []);
        setReservas(Array.isArray(listaReservas) ? listaReservas : []);
      } catch (erro) {
        if (ativo) {
          setMensagemErro(mensagemDeErro(erro));
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    })();
    return () => {
      ativo = false;
    };
  }, []);

  const hoje = hojeIso();
  const checkInsHoje = reservas.filter(
    (reserva) =>
      apenasDataIso(reserva.checkIn) === hoje && !reservaCancelada(reserva) && !reservaFinalizada(reserva),
  );
  const sujos = quartos.filter((quarto) => (quarto.status ?? '').toUpperCase() === 'SUJO');
  const ocupados = quartos.filter((quarto) => (quarto.status ?? '').toUpperCase() === 'OCUPADO');

  return (
    <div className="space-y-10">
      <header className="max-w-3xl">
        <p className="text-sm font-medium text-[#717171]">{dataPorExtenso()}</p>
        <h1 className="titulo-pagina mt-1">O que tem pra hoje</h1>
        <p className="subtitulo-pagina">
          Movimento da casa em acomodações, não em caixas de indicador. Check-ins, quartos sujos e
          quem já está hospedado.
        </p>
      </header>

      <Alerta mensagem={mensagemErro} />
      {carregando ? <IndicadorCarregamento rotulo="Buscando o painel..." /> : null}

      {indicadores ? (
        <div className="flex justify-center">
          <div className="flex w-full max-w-3xl flex-col overflow-hidden rounded-full border border-[#DDDDDD] bg-white shadow-pill sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1 px-6 py-3.5">
              <p className="text-xs font-semibold text-[#222222]">Ocupação</p>
              <p className="truncate text-sm text-[#717171]">
                {formatarPercentual(indicadores.ocupacaoPercentual)} da casa
              </p>
            </div>
            <div className="min-w-0 flex-1 border-t border-[#DDDDDD] px-6 py-3.5 sm:border-l sm:border-t-0">
              <p className="text-xs font-semibold text-[#222222]">Check-ins</p>
              <p className="truncate text-sm text-[#717171]">{indicadores.checkInsHoje} para hoje</p>
            </div>
            <div className="min-w-0 flex-1 border-t border-[#DDDDDD] px-6 py-3.5 sm:border-l sm:border-t-0">
              <p className="text-xs font-semibold text-[#222222]">Governança</p>
              <p className="truncate text-sm text-[#717171]">{indicadores.quartosSujos} sujos na fila</p>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-[#DDDDDD] px-3 py-2 sm:border-l sm:border-t-0">
              <div className="hidden min-w-0 px-2 lg:block">
                <p className="text-xs font-semibold text-[#222222]">Receita do mês</p>
                <p className="truncate text-sm text-[#717171]">{formatarMoeda(indicadores.receitaDoMes)}</p>
              </div>
              <Link
                to="/quartos"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FF385C] text-white hover:bg-[#E00B41]"
                aria-label="Abrir quartos"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Check-ins de hoje</h2>
            <p className="text-sm text-[#717171]">Quem chega e o quarto que espera.</p>
          </div>
          <Link to="/reservas/nova">
            <BotaoAcao>Nova reserva</BotaoAcao>
          </Link>
        </div>
        {!carregando && checkInsHoje.length === 0 ? (
          <p className="text-sm text-[#717171]">Nenhum check-in marcado para hoje.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {checkInsHoje.map((reserva) =>
              reserva.quarto ? (
                <Link key={reserva.id} to={`/reservas/${reserva.id}`} className="block">
                  <CartaoQuarto
                    quarto={reserva.quarto}
                    detalhe={reserva.cliente?.nome ?? `Reserva #${reserva.id}`}
                  />
                </Link>
              ) : null,
            )}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold tracking-tight">Quartos sujos</h2>
          <p className="text-sm text-[#717171]">Fila da governança, no mesmo recorte visual da casa.</p>
        </div>
        {!carregando && sujos.length === 0 ? (
          <p className="text-sm text-[#717171]">Nenhum quarto sujo no momento.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {sujos.map((quarto) => (
              <Link key={quarto.id} to="/governanca" className="block">
                <CartaoQuarto quarto={quarto} />
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold tracking-tight">Na casa agora</h2>
          <p className="text-sm text-[#717171]">Quartos ocupados neste turno.</p>
        </div>
        {!carregando && ocupados.length === 0 ? (
          <p className="text-sm text-[#717171]">Nenhum quarto ocupado agora.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {ocupados.map((quarto) => (
              <Link key={quarto.id} to="/quartos" className="block">
                <CartaoQuarto quarto={quarto} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
