import { useEffect, useState } from 'react';
import { apiCliente, mensagemDeErro } from '../api/apiCliente';
import Alerta from '../componentes/Alerta';
import BotaoAcao from '../componentes/BotaoAcao';
import CartaoQuarto from '../componentes/CartaoQuarto';
import IndicadorCarregamento from '../componentes/IndicadorCarregamento';
import { useToast } from '../componentes/ProvedorToast';
import type { QuartoHotel, StatusQuarto } from '../tipos/dominio';

export default function FilaGovernanca() {
  const { avisar, avisarErro } = useToast();
  const [quartos, setQuartos] = useState<QuartoHotel[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mensagemErro, setMensagemErro] = useState('');
  const [atualizandoId, setAtualizandoId] = useState<number | null>(null);

  async function carregarFila() {
    setCarregando(true);
    setMensagemErro('');
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
    void carregarFila();
  }, []);

  async function alterarStatus(quarto: QuartoHotel, status: StatusQuarto) {
    setAtualizandoId(quarto.id);
    try {
      await apiCliente.patch(`/api/quartos/${quarto.id}/status`, { status });
      avisar(
        status === 'LIVRE'
          ? `Quarto ${quarto.numero} marcado como limpo.`
          : `Quarto ${quarto.numero} enviado para manutenção.`,
      );
      await carregarFila();
    } catch (erro) {
      avisarErro(mensagemDeErro(erro));
    } finally {
      setAtualizandoId(null);
    }
  }

  const sujos = quartos.filter((quarto) => (quarto.status ?? '').toUpperCase() === 'SUJO');
  const manutencao = quartos.filter((quarto) => (quarto.status ?? '').toUpperCase() === 'MANUTENCAO');

  return (
    <div className="space-y-10">
      <header>
        <h1 className="titulo-pagina">Governança</h1>
        <p className="subtitulo-pagina">
          Fila do que saiu do check-out sujo e o que está parado em manutenção.
        </p>
      </header>

      <Alerta mensagem={mensagemErro} />
      {carregando ? <IndicadorCarregamento rotulo="Carregando a fila..." /> : null}

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Quartos sujos</h2>
        {sujos.length === 0 && !carregando ? (
          <p className="text-sm text-[#717171]">Nenhum quarto sujo no momento.</p>
        ) : null}
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {sujos.map((quarto) => (
            <CartaoQuarto
              key={quarto.id}
              quarto={quarto}
              acao={
                <div className="flex flex-wrap gap-2">
                  <BotaoAcao
                    disabled={atualizandoId === quarto.id}
                    onClick={() => void alterarStatus(quarto, 'LIVRE')}
                  >
                    Marcar limpo
                  </BotaoAcao>
                  <BotaoAcao
                    variante="secundario"
                    disabled={atualizandoId === quarto.id}
                    onClick={() => void alterarStatus(quarto, 'MANUTENCAO')}
                  >
                    Manutenção
                  </BotaoAcao>
                </div>
              }
            />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Em manutenção</h2>
        {manutencao.length === 0 && !carregando ? (
          <p className="text-sm text-[#717171]">Nenhum quarto em manutenção.</p>
        ) : null}
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {manutencao.map((quarto) => (
            <CartaoQuarto
              key={quarto.id}
              quarto={quarto}
              acao={
                <BotaoAcao
                  disabled={atualizandoId === quarto.id}
                  onClick={() => void alterarStatus(quarto, 'LIVRE')}
                >
                  Marcar limpo
                </BotaoAcao>
              }
            />
          ))}
        </div>
      </section>
    </div>
  );
}
