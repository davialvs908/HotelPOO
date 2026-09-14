import { FormEvent, useEffect, useState } from 'react';
import { apiCliente, mensagemDeErro } from '../api/apiCliente';
import { useAuth } from '../autenticacao/ProvedorAuth';
import Alerta from '../componentes/Alerta';
import BotaoAcao from '../componentes/BotaoAcao';
import CampoFormulario from '../componentes/CampoFormulario';
import CartaoQuarto from '../componentes/CartaoQuarto';
import IndicadorCarregamento from '../componentes/IndicadorCarregamento';
import { useToast } from '../componentes/ProvedorToast';
import type { QuartoHotel, TipoQuarto } from '../tipos/dominio';
import { datasEstadaValidas, noitesEntre } from '../util/formatacao';
import { podeCriarQuarto } from '../util/permissoes';
import { rotuloTipoQuarto } from '../util/rotulos';

const TIPOS: TipoQuarto[] = ['SIMPLES', 'LUXO', 'SUITE'];

export default function MapaQuartos() {
  const { usuario } = useAuth();
  const { avisar, avisarErro } = useToast();
  const gerentePodeCadastrar = usuario ? podeCriarQuarto(usuario.papel) : false;

  const [quartos, setQuartos] = useState<QuartoHotel[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mensagemErro, setMensagemErro] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [consultandoDisponibilidade, setConsultandoDisponibilidade] = useState(false);
  const [modoDisponibilidade, setModoDisponibilidade] = useState(false);

  const [numeroNovo, setNumeroNovo] = useState('');
  const [tipoNovo, setTipoNovo] = useState<TipoQuarto>('SIMPLES');
  const [precoBaseNovo, setPrecoBaseNovo] = useState('100');
  const [salvandoQuarto, setSalvandoQuarto] = useState(false);

  const [quartoEmEdicao, setQuartoEmEdicao] = useState<QuartoHotel | null>(null);
  const [numeroEditado, setNumeroEditado] = useState('');
  const [tipoEditado, setTipoEditado] = useState<TipoQuarto>('SIMPLES');
  const [precoEditado, setPrecoEditado] = useState('');

  async function carregarMapa() {
    setCarregando(true);
    setMensagemErro('');
    setModoDisponibilidade(false);
    try {
      const lista = await apiCliente.get<QuartoHotel[]>('/api/quartos');
      setQuartos(Array.isArray(lista) ? lista : []);
    } catch (erro) {
      setMensagemErro(mensagemDeErro(erro));
      setQuartos([]);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregarMapa();
  }, []);

  const datasOk = datasEstadaValidas(checkIn, checkOut);
  const datasPreenchidas = Boolean(checkIn && checkOut);
  const datasInvertidas = datasPreenchidas && !datasOk;

  async function consultarDisponibilidade() {
    if (!datasOk) {
      return;
    }
    setConsultandoDisponibilidade(true);
    setMensagemErro('');
    try {
      const lista = await apiCliente.get<QuartoHotel[]>(
        `/api/quartos/disponiveis?checkIn=${checkIn}&checkOut=${checkOut}`,
      );
      setQuartos(Array.isArray(lista) ? lista : []);
      setModoDisponibilidade(true);
    } catch (erro) {
      setMensagemErro(mensagemDeErro(erro));
    } finally {
      setConsultandoDisponibilidade(false);
    }
  }

  async function aoCadastrarQuarto(evento: FormEvent) {
    evento.preventDefault();
    const preco = Number(precoBaseNovo.replace(',', '.'));
    if (!numeroNovo.trim() || !(preco > 0) || salvandoQuarto) {
      return;
    }
    setSalvandoQuarto(true);
    try {
      await apiCliente.post('/api/quartos', {
        numero: numeroNovo.trim(),
        tipo: tipoNovo,
        precoBasePorNoite: preco,
      });
      avisar('Quarto cadastrado no mapa.');
      setNumeroNovo('');
      setPrecoBaseNovo('100');
      await carregarMapa();
    } catch (erro) {
      avisarErro(mensagemDeErro(erro));
    } finally {
      setSalvandoQuarto(false);
    }
  }

  function abrirEdicao(quarto: QuartoHotel) {
    setQuartoEmEdicao(quarto);
    setNumeroEditado(quarto.numero);
    setTipoEditado(quarto.tipo);
    setPrecoEditado(String(quarto.precoBasePorNoite));
  }

  async function aoSalvarEdicao(evento: FormEvent) {
    evento.preventDefault();
    if (!quartoEmEdicao) {
      return;
    }
    const preco = Number(precoEditado.replace(',', '.'));
    if (!numeroEditado.trim() || !(preco > 0)) {
      return;
    }
    try {
      await apiCliente.put(`/api/quartos/${quartoEmEdicao.id}`, {
        numero: numeroEditado.trim(),
        tipo: tipoEditado,
        precoBasePorNoite: preco,
      });
      avisar('Quarto atualizado.');
      setQuartoEmEdicao(null);
      await carregarMapa();
    } catch (erro) {
      avisarErro(mensagemDeErro(erro));
    }
  }

  const visiveis = quartos.filter((quarto) => {
    const statusAtual = (quarto.status ?? (quarto.disponivel === false ? 'OCUPADO' : 'LIVRE')).toUpperCase();
    const passaStatus = filtroStatus === 'TODOS' || statusAtual === filtroStatus;
    const passaTipo = filtroTipo === 'TODOS' || quarto.tipo === filtroTipo;
    return passaStatus && passaTipo;
  });

  const cadastroValido = numeroNovo.trim().length > 0 && Number(precoBaseNovo.replace(',', '.')) > 0;
  const edicaoValida =
    numeroEditado.trim().length > 0 && Number(precoEditado.replace(',', '.')) > 0;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="titulo-pagina">Quartos</h1>
        <p className="subtitulo-pagina">
          A casa em fotos. Consulte datas para ver só o que está livre naquele intervalo.
        </p>
      </header>

      <section className="flex justify-center">
        <div className="flex w-full max-w-3xl flex-col overflow-hidden rounded-full border border-[#DDDDDD] bg-white shadow-pill md:flex-row md:items-center">
          <label className="min-w-0 flex-1 px-6 py-3">
            <span className="block text-xs font-semibold">Check-in</span>
            <input
              type="date"
              className="w-full bg-transparent text-sm text-[#717171] outline-none"
              value={checkIn}
              onChange={(evento) => setCheckIn(evento.target.value)}
            />
          </label>
          <label className="min-w-0 flex-1 border-t border-[#DDDDDD] px-6 py-3 md:border-l md:border-t-0">
            <span className="block text-xs font-semibold">Check-out</span>
            <input
              type="date"
              className="w-full bg-transparent text-sm text-[#717171] outline-none"
              value={checkOut}
              onChange={(evento) => setCheckOut(evento.target.value)}
            />
          </label>
          <div className="flex items-center justify-end gap-2 border-t border-[#DDDDDD] p-2 md:border-l md:border-t-0">
            <button
              type="button"
              className="rounded-full px-4 py-2 text-sm font-medium text-[#222222] hover:bg-[#F7F7F7]"
              onClick={() => void carregarMapa()}
            >
              Mapa
            </button>
            <button
              type="button"
              disabled={!datasOk || consultandoDisponibilidade}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FF385C] text-white hover:bg-[#E00B41] disabled:opacity-40"
              onClick={() => void consultarDisponibilidade()}
              aria-label="Buscar disponíveis"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {datasInvertidas ? (
        <Alerta mensagem="A saída precisa ser depois da entrada: a estadia cobra pelo menos uma noite." />
      ) : null}

      {modoDisponibilidade && datasOk ? (
        <Alerta
          variante="ok"
          mensagem={`Quartos livres de ${checkIn} a ${checkOut} (${noitesEntre(checkIn, checkOut)} noite(s)).`}
        />
      ) : null}

      <div className="flex flex-wrap gap-3">
        <label className="text-sm">
          Status
          <select
            className="entrada mt-1 w-44"
            value={filtroStatus}
            onChange={(evento) => setFiltroStatus(evento.target.value)}
          >
            <option value="TODOS">Todos</option>
            <option value="LIVRE">Livre</option>
            <option value="OCUPADO">Ocupado</option>
            <option value="SUJO">Sujo</option>
            <option value="MANUTENCAO">Manutenção</option>
          </select>
        </label>
        <label className="text-sm">
          Tipo
          <select
            className="entrada mt-1 w-44"
            value={filtroTipo}
            onChange={(evento) => setFiltroTipo(evento.target.value)}
          >
            <option value="TODOS">Todos</option>
            {TIPOS.map((tipo) => (
              <option key={tipo} value={tipo}>
                {rotuloTipoQuarto(tipo)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <Alerta mensagem={mensagemErro} />
      {carregando ? <IndicadorCarregamento rotulo="Montando o mapa..." /> : null}

      {!carregando && visiveis.length === 0 ? (
        <p className="text-sm text-[#717171]">Nenhum quarto neste filtro.</p>
      ) : null}

      <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 xl:grid-cols-4">
        {visiveis.map((quarto) => (
          <CartaoQuarto
            key={quarto.id}
            quarto={quarto}
            acao={
              gerentePodeCadastrar ? (
                <BotaoAcao variante="silencioso" className="px-0" onClick={() => abrirEdicao(quarto)}>
                  Editar tarifário
                </BotaoAcao>
              ) : null
            }
          />
        ))}
      </div>

      {gerentePodeCadastrar && quartoEmEdicao ? (
        <form onSubmit={aoSalvarEdicao} className="cartao space-y-4 p-6">
          <h2 className="text-xl font-semibold">Editar quarto {quartoEmEdicao.numero}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <CampoFormulario rotulo="Número" valor={numeroEditado} aoAlterar={setNumeroEditado} />
            <label className="block">
              <span className="rotulo-campo">Tipo</span>
              <select
                className="entrada"
                value={tipoEditado}
                onChange={(evento) => setTipoEditado(evento.target.value as TipoQuarto)}
              >
                {TIPOS.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {rotuloTipoQuarto(tipo)}
                  </option>
                ))}
              </select>
            </label>
            <CampoFormulario
              rotulo="Preço base por noite"
              valor={precoEditado}
              aoAlterar={setPrecoEditado}
              type="number"
              min="1"
              step="0.01"
            />
          </div>
          <div className="flex gap-2">
            <BotaoAcao type="submit" disabled={!edicaoValida}>
              Salvar quarto
            </BotaoAcao>
            <BotaoAcao variante="secundario" onClick={() => setQuartoEmEdicao(null)}>
              Fechar
            </BotaoAcao>
          </div>
        </form>
      ) : null}

      {gerentePodeCadastrar ? (
        <form onSubmit={aoCadastrarQuarto} className="cartao space-y-4 p-6">
          <h2 className="text-xl font-semibold">Cadastrar quarto</h2>
          <p className="text-sm text-[#717171]">
            Referência de seed: 101 e 102 Simples a R$ 100, 201 e 202 Luxo a R$ 150, 301 e 302 Suíte a
            R$ 200.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            <CampoFormulario
              rotulo="Número"
              valor={numeroNovo}
              aoAlterar={setNumeroNovo}
              placeholder="103"
            />
            <label className="block">
              <span className="rotulo-campo">Tipo</span>
              <select
                className="entrada"
                value={tipoNovo}
                onChange={(evento) => setTipoNovo(evento.target.value as TipoQuarto)}
              >
                {TIPOS.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {rotuloTipoQuarto(tipo)}
                  </option>
                ))}
              </select>
            </label>
            <CampoFormulario
              rotulo="Preço base por noite"
              valor={precoBaseNovo}
              aoAlterar={setPrecoBaseNovo}
              type="number"
              min="1"
              step="0.01"
            />
          </div>
          <BotaoAcao type="submit" disabled={!cadastroValido || salvandoQuarto}>
            {salvandoQuarto ? 'Cadastrando...' : 'Incluir no mapa'}
          </BotaoAcao>
        </form>
      ) : null}
    </div>
  );
}
