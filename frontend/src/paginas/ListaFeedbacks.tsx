import { FormEvent, useEffect, useState } from 'react';
import { apiCliente, mensagemDeErro } from '../api/apiCliente';
import Alerta from '../componentes/Alerta';
import BotaoAcao from '../componentes/BotaoAcao';
import CampoFormulario from '../componentes/CampoFormulario';
import IndicadorCarregamento from '../componentes/IndicadorCarregamento';
import { useToast } from '../componentes/ProvedorToast';
import type { FeedbackHospede } from '../tipos/dominio';
import { formatarData } from '../util/formatacao';

function textoFeedback(feedback: FeedbackHospede): string {
  return feedback.mensagem ?? feedback.comentario ?? feedback.texto ?? '';
}

function nomeAutor(feedback: FeedbackHospede): string {
  return feedback.nomeHospede ?? feedback.hospedeNome ?? feedback.autor ?? 'Hóspede';
}

export default function ListaFeedbacks() {
  const { avisar, avisarErro } = useToast();
  const [feedbacks, setFeedbacks] = useState<FeedbackHospede[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mensagemErro, setMensagemErro] = useState('');

  const [nomeHospede, setNomeHospede] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [nota, setNota] = useState('5');
  const [enviando, setEnviando] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);

  async function carregarFeedbacks() {
    setCarregando(true);
    setMensagemErro('');
    try {
      const lista = await apiCliente.get<FeedbackHospede[]>('/api/feedbacks');
      setFeedbacks(Array.isArray(lista) ? lista : []);
    } catch (erro) {
      setMensagemErro(mensagemDeErro(erro));
      setFeedbacks([]);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregarFeedbacks();
  }, []);

  const notaNumero = Number(nota);
  const formularioValido =
    nomeHospede.trim().length > 1 &&
    mensagem.trim().length > 2 &&
    notaNumero >= 1 &&
    notaNumero <= 5;

  function limparFormulario() {
    setNomeHospede('');
    setMensagem('');
    setNota('5');
    setEditandoId(null);
  }

  function preencherEdicao(feedback: FeedbackHospede) {
    setEditandoId(feedback.id);
    setNomeHospede(nomeAutor(feedback));
    setMensagem(textoFeedback(feedback));
    setNota(String(feedback.nota ?? 5));
  }

  async function aoSalvar(evento: FormEvent) {
    evento.preventDefault();
    if (!formularioValido || enviando) {
      return;
    }
    setEnviando(true);
    const corpo = {
      nomeHospede: nomeHospede.trim(),
      mensagem: mensagem.trim(),
      nota: notaNumero,
    };
    try {
      if (editandoId) {
        await apiCliente.put(`/api/feedbacks/${editandoId}`, corpo);
        avisar('Feedback atualizado.');
      } else {
        await apiCliente.post('/api/feedbacks', corpo);
        avisar('Feedback registrado.');
      }
      limparFormulario();
      await carregarFeedbacks();
    } catch (erro) {
      avisarErro(mensagemDeErro(erro));
    } finally {
      setEnviando(false);
    }
  }

  async function excluirFeedback(feedback: FeedbackHospede) {
    if (!window.confirm('Excluir este feedback?')) {
      return;
    }
    try {
      await apiCliente.delete(`/api/feedbacks/${feedback.id}`);
      avisar('Feedback excluído.');
      await carregarFeedbacks();
    } catch (erro) {
      avisarErro(mensagemDeErro(erro));
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="titulo-pagina">Feedbacks</h1>
        <p className="subtitulo-pagina">O que o hóspede levou da estadia: nota de 1 a 5 e o recado.</p>
      </header>

      <form onSubmit={aoSalvar} className="cartao space-y-4 p-5">
        <h2 className="text-xl font-semibold">{editandoId ? 'Editar feedback' : 'Novo feedback'}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <CampoFormulario
            rotulo="Nome do hóspede"
            valor={nomeHospede}
            aoAlterar={setNomeHospede}
          />
          <CampoFormulario
            rotulo="Nota (1 a 5)"
            valor={nota}
            aoAlterar={setNota}
            type="number"
            min="1"
            max="5"
            step="1"
          />
        </div>
        <label className="block">
          <span className="rotulo-campo">Mensagem</span>
          <textarea
            className="entrada min-h-[96px]"
            value={mensagem}
            onChange={(evento) => setMensagem(evento.target.value)}
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <BotaoAcao type="submit" disabled={!formularioValido || enviando}>
            {enviando ? 'Salvando...' : 'Salvar feedback'}
          </BotaoAcao>
          {editandoId ? (
            <BotaoAcao variante="secundario" onClick={limparFormulario}>
              Cancelar edição
            </BotaoAcao>
          ) : null}
        </div>
      </form>

      <Alerta mensagem={mensagemErro} />
      {carregando ? <IndicadorCarregamento rotulo="Carregando feedbacks..." /> : null}

      {!carregando && feedbacks.length === 0 ? (
        <p className="text-sm text-[#717171]">Ainda não há feedbacks registrados.</p>
      ) : null}

      <div className="space-y-3">
        {feedbacks.map((feedback) => (
          <article key={feedback.id} className="cartao p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium text-[#222222]">{nomeAutor(feedback)}</p>
                <p className="text-sm text-[#717171]">
                  Nota {feedback.nota ?? '-'}
                  {feedback.criadoEm ? ` · ${formatarData(feedback.criadoEm)}` : ''}
                </p>
              </div>
              <div className="flex gap-3 text-sm">
                <button type="button" className="underline" onClick={() => preencherEdicao(feedback)}>
                  Editar
                </button>
                <button
                  type="button"
                  className="text-red-700 underline"
                  onClick={() => void excluirFeedback(feedback)}
                >
                  Excluir
                </button>
              </div>
            </div>
            <p className="mt-3 text-sm text-[#222222]">{textoFeedback(feedback) || 'Sem mensagem.'}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
