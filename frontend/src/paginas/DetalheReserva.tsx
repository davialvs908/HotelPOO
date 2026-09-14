import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiCliente, mensagemDeErro } from '../api/apiCliente';
import Alerta from '../componentes/Alerta';
import BotaoAcao from '../componentes/BotaoAcao';
import CampoFormulario from '../componentes/CampoFormulario';
import FotoQuarto from '../componentes/FotoQuarto';
import IndicadorCarregamento from '../componentes/IndicadorCarregamento';
import { useToast } from '../componentes/ProvedorToast';
import type {
  FolioHospedagem,
  FormaPagamento,
  HospedeAcompanhante,
  QuartoHotel,
  ReservaHospedagem,
} from '../tipos/dominio';
import {
  apenasDataIso,
  datasEstadaValidas,
  formatarData,
  formatarMoeda,
  noitesEntre,
} from '../util/formatacao';
import {
  reservaPermiteAlterarEstada,
  reservaPermiteCancelar,
  reservaPermiteCheckIn,
  reservaPermiteCheckOut,
} from '../util/permissoes';
import { rotuloFormaPagamento, rotuloStatusReserva, rotuloTipoQuarto } from '../util/rotulos';

const FORMAS: FormaPagamento[] = ['DINHEIRO', 'CARTAO', 'PIX'];

export default function DetalheReserva() {
  const { idReserva } = useParams();
  const { avisar, avisarErro } = useToast();

  const [reserva, setReserva] = useState<ReservaHospedagem | null>(null);
  const [folio, setFolio] = useState<FolioHospedagem | null>(null);
  const [folioCarregado, setFolioCarregado] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [mensagemErro, setMensagemErro] = useState('');
  const [ocupado, setOcupado] = useState(false);

  const [valorPagamento, setValorPagamento] = useState('');
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('PIX');
  const [nomeHospede, setNomeHospede] = useState('');
  const [documentoHospede, setDocumentoHospede] = useState('');
  const [novaSaida, setNovaSaida] = useState('');
  const [quartosParaTransferir, setQuartosParaTransferir] = useState<QuartoHotel[]>([]);
  const [novoQuartoId, setNovoQuartoId] = useState('');

  const recarregar = useCallback(async () => {
    if (!idReserva) {
      return;
    }
    setMensagemErro('');
    const detalhe = await apiCliente.get<ReservaHospedagem>(`/api/reservas/${idReserva}`);
    setReserva(detalhe);
    try {
      const conta = await apiCliente.get<FolioHospedagem>(`/api/reservas/${idReserva}/folio`);
      setFolio(conta);
      setFolioCarregado(true);
    } catch {
      setFolio(null);
      setFolioCarregado(false);
    }
  }, [idReserva]);

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        await recarregar();
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
  }, [recarregar]);

  useEffect(() => {
    if (!reserva || !reservaPermiteAlterarEstada(reserva)) {
      return;
    }
    const entrada = apenasDataIso(reserva.checkIn);
    const saida = apenasDataIso(reserva.checkOut);
    let ativo = true;
    (async () => {
      try {
        const livres = await apiCliente.get<QuartoHotel[]>(
          `/api/quartos/disponiveis?checkIn=${entrada}&checkOut=${saida}`,
        );
        if (ativo) {
          setQuartosParaTransferir(
            (Array.isArray(livres) ? livres : []).filter((quarto) => quarto.id !== reserva.quarto?.id),
          );
        }
      } catch {
        if (ativo) {
          setQuartosParaTransferir([]);
        }
      }
    })();
    return () => {
      ativo = false;
    };
  }, [reserva]);

  async function executarAcao(acao: () => Promise<void>, sucesso: string) {
    setOcupado(true);
    setMensagemErro('');
    try {
      await acao();
      avisar(sucesso);
      await recarregar();
    } catch (erro) {
      const texto = mensagemDeErro(erro);
      setMensagemErro(texto);
      avisarErro(texto);
    } finally {
      setOcupado(false);
    }
  }

  if (carregando) {
    return <IndicadorCarregamento rotulo="Abrindo a reserva..." />;
  }

  if (!reserva) {
    return (
      <div className="space-y-4">
        <Alerta mensagem={mensagemErro || 'Reserva não encontrada.'} />
        <Link to="/reservas" className="text-sm underline">
          Voltar às reservas
        </Link>
      </div>
    );
  }

  const acompanhantes: HospedeAcompanhante[] = reserva.hospedes ?? reserva.acompanhantes ?? [];
  const saldoAberto = (folio?.saldo ?? 0) > 0.009;
  // Check-out só fecha com folio zerado para não encerrar hospedagem com conta em aberto.
  const checkOutLiberado =
    reservaPermiteCheckOut(reserva) && folioCarregado && folio !== null && !saldoAberto;
  const valorNumero = Number(valorPagamento.replace(',', '.'));
  const pagamentoValido = valorNumero > 0 && Number.isFinite(valorNumero);
  const hospedeValido = nomeHospede.trim().length > 1 && documentoHospede.trim().length >= 5;
  const saidaAtual = apenasDataIso(reserva.checkOut);
  const renovacaoValida = Boolean(novaSaida) && novaSaida > saidaAtual;
  const transferenciaValida = Boolean(novoQuartoId);

  async function aoPagar(evento: FormEvent) {
    evento.preventDefault();
    if (!pagamentoValido || !idReserva) {
      return;
    }
    await executarAcao(
      () =>
        apiCliente.post(`/api/reservas/${idReserva}/pagamentos`, {
          valor: valorNumero,
          forma: formaPagamento,
        }),
      'Pagamento lançado no folio.',
    );
    setValorPagamento('');
  }

  async function aoIncluirHospede(evento: FormEvent) {
    evento.preventDefault();
    if (!hospedeValido || !idReserva) {
      return;
    }
    await executarAcao(
      () =>
        apiCliente.post(`/api/reservas/${idReserva}/hospedes`, {
          nome: nomeHospede.trim(),
          documento: documentoHospede.trim(),
        }),
      'Acompanhante incluído.',
    );
    setNomeHospede('');
    setDocumentoHospede('');
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[#717171]">Reserva #{reserva.id}</p>
          <h1 className="titulo-pagina">{reserva.cliente?.nome ?? 'Hóspede'}</h1>
          <p className="subtitulo-pagina">
            Quarto {reserva.quarto?.numero ?? '-'}
            {reserva.quarto ? ` · ${rotuloTipoQuarto(reserva.quarto.tipo)}` : ''} ·{' '}
            {rotuloStatusReserva(reserva.status)}
          </p>
        </div>
        <Link to="/reservas">
          <BotaoAcao variante="secundario">Lista de reservas</BotaoAcao>
        </Link>
      </header>

      <Alerta mensagem={mensagemErro} />

      {reserva.quarto ? (
        <FotoQuarto
          tipo={reserva.quarto.tipo}
          numero={reserva.quarto.numero}
          className="aspect-[3/2] max-h-[360px] w-full rounded-2xl"
        />
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <article className="cartao p-5">
          <p className="text-sm text-mar-700/80">Estadia</p>
          <p className="mt-1 font-medium">
            {formatarData(reserva.checkIn)} a {formatarData(reserva.checkOut)}
          </p>
          <p className="mt-1 text-sm">{noitesEntre(reserva.checkIn, reserva.checkOut)} noite(s)</p>
        </article>
        <article className="cartao p-5">
          <p className="text-sm text-mar-700/80">Valor da reserva</p>
          <p className="mt-1 text-2xl font-semibold">
            {formatarMoeda(reserva.valorTotal ?? reserva.valorReserva ?? folio?.valorReserva ?? 0)}
          </p>
        </article>
        <article className="cartao p-5">
          <p className="text-sm text-mar-700/80">Documento do titular</p>
          <p className="mt-1 font-medium">{reserva.cliente?.documento ?? '-'}</p>
        </article>
      </section>

      <section className="cartao flex flex-wrap gap-3 p-5">
        <BotaoAcao
          disabled={!reservaPermiteCheckIn(reserva) || ocupado}
          onClick={() =>
            void executarAcao(
              () => apiCliente.post(`/api/reservas/${idReserva}/check-in`),
              'Check-in registrado.',
            )
          }
        >
          Check-in
        </BotaoAcao>
        <BotaoAcao
          disabled={!checkOutLiberado || ocupado}
          onClick={() =>
            void executarAcao(
              () => apiCliente.post(`/api/reservas/${idReserva}/check-out`),
              'Check-out encerrado.',
            )
          }
        >
          Check-out
        </BotaoAcao>
        <BotaoAcao
          variante="perigo"
          disabled={!reservaPermiteCancelar(reserva) || ocupado}
          onClick={() => {
            if (!window.confirm('Cancelar esta reserva e liberar o quarto?')) {
              return;
            }
            void executarAcao(
              () => apiCliente.post(`/api/reservas/${idReserva}/cancelar`),
              'Reserva cancelada.',
            );
          }}
        >
          Cancelar reserva
        </BotaoAcao>
        {reservaPermiteCheckOut(reserva) && saldoAberto ? (
          <p className="w-full text-sm text-amber-800">
            O check-out fica bloqueado enquanto o folio tiver saldo. Quite a conta antes de encerrar a
            hospedagem.
          </p>
        ) : null}
        {reservaPermiteCheckOut(reserva) && !folioCarregado ? (
          <p className="w-full text-sm text-amber-800">
            Não foi possível ler o folio. O check-out permanece bloqueado até a conta carregar.
          </p>
        ) : null}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="cartao space-y-4 p-5">
          <h2 className="text-xl font-semibold">Folio</h2>
          {folio ? (
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt className="text-mar-700">Valor da reserva</dt>
              <dd className="text-right font-medium">{formatarMoeda(folio.valorReserva)}</dd>
              <dt className="text-mar-700">Total pago</dt>
              <dd className="text-right font-medium">{formatarMoeda(folio.totalPago)}</dd>
              <dt className="text-mar-700">Saldo</dt>
              <dd className="text-right text-lg font-semibold">{formatarMoeda(folio.saldo)}</dd>
            </dl>
          ) : (
            <p className="text-sm text-mar-700">Folio ainda não disponível.</p>
          )}

          {reserva.pagamentos && reserva.pagamentos.length > 0 ? (
            <ul className="space-y-1 text-sm">
              {reserva.pagamentos.map((lancamento, indice) => (
                <li key={lancamento.id ?? `pag-${indice}`} className="flex justify-between">
                  <span>{rotuloFormaPagamento(lancamento.forma)}</span>
                  <span>{formatarMoeda(lancamento.valor)}</span>
                </li>
              ))}
            </ul>
          ) : null}

          <form onSubmit={aoPagar} className="space-y-3 border-t border-areia-100 pt-4">
            <CampoFormulario
              rotulo="Valor do pagamento"
              valor={valorPagamento}
              aoAlterar={setValorPagamento}
              type="number"
              min="0.01"
              step="0.01"
            />
            <label className="block">
              <span className="rotulo-campo">Forma</span>
              <select
                className="entrada"
                value={formaPagamento}
                onChange={(evento) => setFormaPagamento(evento.target.value as FormaPagamento)}
              >
                {FORMAS.map((forma) => (
                  <option key={forma} value={forma}>
                    {rotuloFormaPagamento(forma)}
                  </option>
                ))}
              </select>
            </label>
            <BotaoAcao type="submit" disabled={!pagamentoValido || ocupado}>
              Lançar pagamento
            </BotaoAcao>
          </form>
        </div>

        <div className="cartao space-y-4 p-5">
          <h2 className="text-xl font-semibold">Acompanhantes</h2>
          {acompanhantes.length === 0 ? (
            <p className="text-sm text-mar-700">Nenhum acompanhante nesta reserva.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {acompanhantes.map((hospede, indice) => (
                <li key={hospede.id ?? `hosp-${indice}`}>
                  {hospede.nome} · {hospede.documento}
                </li>
              ))}
            </ul>
          )}
          <form onSubmit={aoIncluirHospede} className="space-y-3 border-t border-areia-100 pt-4">
            <CampoFormulario rotulo="Nome" valor={nomeHospede} aoAlterar={setNomeHospede} />
            <CampoFormulario
              rotulo="Documento"
              valor={documentoHospede}
              aoAlterar={setDocumentoHospede}
            />
            <BotaoAcao type="submit" disabled={!hospedeValido || ocupado}>
              Incluir acompanhante
            </BotaoAcao>
          </form>
        </div>
      </section>

      {reservaPermiteAlterarEstada(reserva) ? (
        <section className="grid gap-6 lg:grid-cols-2">
          <form
            className="cartao space-y-4 p-5"
            onSubmit={(evento) => {
              evento.preventDefault();
              if (!transferenciaValida || !idReserva) {
                return;
              }
              void executarAcao(
                () =>
                  apiCliente.post(`/api/reservas/${idReserva}/transferir`, {
                    novoQuartoId: Number(novoQuartoId),
                  }),
                'Hóspede transferido de quarto.',
              );
            }}
          >
            <h2 className="text-xl font-semibold">Transferir quarto</h2>
            <label className="block">
              <span className="rotulo-campo">Novo quarto livre nas mesmas datas</span>
              <select
                className="entrada"
                value={novoQuartoId}
                onChange={(evento) => setNovoQuartoId(evento.target.value)}
              >
                <option value="">Selecione</option>
                {quartosParaTransferir.map((quarto) => (
                  <option key={quarto.id} value={quarto.id}>
                    {quarto.numero} · {rotuloTipoQuarto(quarto.tipo)}
                  </option>
                ))}
              </select>
            </label>
            <BotaoAcao type="submit" disabled={!transferenciaValida || ocupado}>
              Transferir
            </BotaoAcao>
          </form>

          <form
            className="cartao space-y-4 p-5"
            onSubmit={(evento) => {
              evento.preventDefault();
              if (!renovacaoValida || !idReserva) {
                return;
              }
              void executarAcao(
                () =>
                  apiCliente.post(`/api/reservas/${idReserva}/renovar`, {
                    novaDataCheckOut: novaSaida,
                  }),
                'Estadia renovada.',
              );
            }}
          >
            <h2 className="text-xl font-semibold">Renovar estadia</h2>
            <CampoFormulario
              rotulo="Nova data de check-out"
              valor={novaSaida}
              aoAlterar={setNovaSaida}
              type="date"
              mensagemErro={
                novaSaida && !renovacaoValida
                  ? 'A renovação só avança a saída, para não encurtar uma estadia já tarifada neste fluxo.'
                  : undefined
              }
            />
            {renovacaoValida && datasEstadaValidas(apenasDataIso(reserva.checkIn), novaSaida) ? (
              <p className="text-sm text-mar-700">
                Passa a {noitesEntre(reserva.checkIn, novaSaida)} noite(s) no total.
              </p>
            ) : null}
            <BotaoAcao type="submit" disabled={!renovacaoValida || ocupado}>
              Renovar
            </BotaoAcao>
          </form>
        </section>
      ) : null}
    </div>
  );
}
