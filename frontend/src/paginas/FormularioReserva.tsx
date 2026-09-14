import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiCliente, mensagemDeErro } from '../api/apiCliente';
import Alerta from '../componentes/Alerta';
import BotaoAcao from '../componentes/BotaoAcao';
import CampoBuscaCliente from '../componentes/CampoBuscaCliente';
import CampoFormulario from '../componentes/CampoFormulario';
import CartaoQuarto from '../componentes/CartaoQuarto';
import { useToast } from '../componentes/ProvedorToast';
import type { HospedeAcompanhante, QuartoHotel, ReservaHospedagem } from '../tipos/dominio';
import { datasEstadaValidas, formatarMoeda, noitesEntre } from '../util/formatacao';
import { descricaoTarifa, precoDiaria, totalEstada } from '../util/precos';
import { rotuloTipoQuarto } from '../util/rotulos';

type LinhaAcompanhante = { nome: string; documento: string };

export default function FormularioReserva() {
  const navigate = useNavigate();
  const { avisar, avisarErro } = useToast();

  const [clienteId, setClienteId] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [quartosLivres, setQuartosLivres] = useState<QuartoHotel[]>([]);
  const [quartoId, setQuartoId] = useState('');
  const [acompanhantes, setAcompanhantes] = useState<LinhaAcompanhante[]>([]);
  const [carregandoQuartos, setCarregandoQuartos] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');

  const datasOk = datasEstadaValidas(checkIn, checkOut);
  const datasPreenchidas = Boolean(checkIn && checkOut);
  const datasInvertidas = datasPreenchidas && !datasOk;

  useEffect(() => {
    if (!datasOk) {
      setQuartosLivres([]);
      setQuartoId('');
      return;
    }
    let ativo = true;
    setCarregandoQuartos(true);
    (async () => {
      try {
        const lista = await apiCliente.get<QuartoHotel[]>(
          `/api/quartos/disponiveis?checkIn=${checkIn}&checkOut=${checkOut}`,
        );
        if (ativo) {
          setQuartosLivres(Array.isArray(lista) ? lista : []);
        }
      } catch (erro) {
        if (ativo) {
          setMensagemErro(mensagemDeErro(erro));
          setQuartosLivres([]);
        }
      } finally {
        if (ativo) {
          setCarregandoQuartos(false);
        }
      }
    })();
    return () => {
      ativo = false;
    };
  }, [checkIn, checkOut, datasOk]);

  const quartoEscolhido = quartosLivres.find((quarto) => String(quarto.id) === quartoId);
  const noites = datasOk ? noitesEntre(checkIn, checkOut) : 0;
  const resumoTarifa = useMemo(() => {
    if (!quartoEscolhido || noites < 1) {
      return null;
    }
    const diaria = precoDiaria(quartoEscolhido.tipo, quartoEscolhido.precoBasePorNoite);
    const total = totalEstada(quartoEscolhido.tipo, quartoEscolhido.precoBasePorNoite, noites);
    return { diaria, total };
  }, [noites, quartoEscolhido]);

  const formularioValido = Boolean(clienteId && quartoId && datasOk);

  function incluirAcompanhante() {
    setAcompanhantes((lista) => [...lista, { nome: '', documento: '' }]);
  }

  function alterarAcompanhante(indice: number, campo: keyof LinhaAcompanhante, valor: string) {
    setAcompanhantes((lista) =>
      lista.map((linha, posicao) => (posicao === indice ? { ...linha, [campo]: valor } : linha)),
    );
  }

  function removerAcompanhante(indice: number) {
    setAcompanhantes((lista) => lista.filter((_, posicao) => posicao !== indice));
  }

  async function aoCriarReserva(evento: FormEvent) {
    evento.preventDefault();
    if (!formularioValido || enviando) {
      return;
    }
    const hospedes: HospedeAcompanhante[] = acompanhantes
      .filter((linha) => linha.nome.trim() && linha.documento.trim())
      .map((linha) => ({ nome: linha.nome.trim(), documento: linha.documento.trim() }));

    setEnviando(true);
    setMensagemErro('');
    try {
      const criada = await apiCliente.post<ReservaHospedagem>('/api/reservas', {
        clienteId: Number(clienteId),
        quartoId: Number(quartoId),
        checkIn,
        checkOut,
        hospedes: hospedes.length > 0 ? hospedes : undefined,
      });
      avisar('Reserva confirmada.');
      navigate(`/reservas/${criada.id}`);
    } catch (erro) {
      const texto = mensagemDeErro(erro);
      setMensagemErro(texto);
      avisarErro(texto);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="titulo-pagina">Nova reserva</h1>
        <p className="subtitulo-pagina">
          O quarto só entra na lista depois que as datas fecham um intervalo com pelo menos uma noite.
        </p>
      </header>

      <form onSubmit={aoCriarReserva} className="cartao space-y-5 p-6">
        <CampoBuscaCliente clienteId={clienteId} aoEscolherId={setClienteId} />

        <div className="grid gap-4 md:grid-cols-2">
          <CampoFormulario rotulo="Check-in" valor={checkIn} aoAlterar={setCheckIn} type="date" />
          <CampoFormulario
            rotulo="Check-out"
            valor={checkOut}
            aoAlterar={setCheckOut}
            type="date"
            mensagemErro={
              datasInvertidas
                ? 'A saída precisa ser depois da entrada: a diária conta noites, não o mesmo dia.'
                : undefined
            }
          />
        </div>

        <label className="block">
          <span className="rotulo-campo">Quarto disponível no intervalo</span>
          {!datasOk ? (
            <p className="text-sm text-[#717171]">Informe as datas primeiro.</p>
          ) : carregandoQuartos ? (
            <p className="text-sm text-[#717171]">Buscando quartos...</p>
          ) : quartosLivres.length === 0 ? (
            <p className="text-sm text-[#717171]">Nenhum quarto livre nesse intervalo.</p>
          ) : (
            <div className="mt-3 grid gap-6 sm:grid-cols-2">
              {quartosLivres.map((quarto) => (
                <CartaoQuarto
                  key={quarto.id}
                  quarto={quarto}
                  selecionado={String(quarto.id) === quartoId}
                  onClick={() => setQuartoId(String(quarto.id))}
                />
              ))}
            </div>
          )}
        </label>

        {resumoTarifa && quartoEscolhido ? (
          <div className="rounded-xl bg-[#F7F7F7] p-4 text-sm text-[#222222]">
            <p className="font-medium text-mar-900">
              Quarto {quartoEscolhido.numero} · {rotuloTipoQuarto(quartoEscolhido.tipo)}
            </p>
            <p className="mt-1">Tarifa: {descricaoTarifa(quartoEscolhido.tipo)}</p>
            <p>Base {formatarMoeda(quartoEscolhido.precoBasePorNoite)}</p>
            <p>
              {noites} noite(s) × {formatarMoeda(resumoTarifa.diaria)} ={' '}
              <strong>{formatarMoeda(resumoTarifa.total)}</strong>
            </p>
          </div>
        ) : null}

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-medium text-mar-900">Acompanhantes</h2>
            <BotaoAcao variante="secundario" onClick={incluirAcompanhante}>
              Incluir acompanhante
            </BotaoAcao>
          </div>
          {acompanhantes.length === 0 ? (
            <p className="text-sm text-mar-700/80">Opcional. Só enviamos quem tiver nome e documento.</p>
          ) : null}
          <div className="space-y-3">
            {acompanhantes.map((linha, indice) => (
              <div key={`acomp-${indice}`} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                <CampoFormulario
                  rotulo="Nome"
                  valor={linha.nome}
                  aoAlterar={(valor) => alterarAcompanhante(indice, 'nome', valor)}
                />
                <CampoFormulario
                  rotulo="Documento"
                  valor={linha.documento}
                  aoAlterar={(valor) => alterarAcompanhante(indice, 'documento', valor)}
                />
                <div className="flex items-end">
                  <BotaoAcao variante="silencioso" onClick={() => removerAcompanhante(indice)}>
                    Remover
                  </BotaoAcao>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Alerta mensagem={mensagemErro} />

        <div className="flex flex-wrap gap-3">
          <BotaoAcao type="submit" disabled={!formularioValido || enviando}>
            {enviando ? 'Confirmando...' : 'Confirmar reserva'}
          </BotaoAcao>
          <Link to="/reservas">
            <BotaoAcao variante="secundario">Voltar</BotaoAcao>
          </Link>
        </div>
      </form>
    </div>
  );
}
