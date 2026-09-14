import { useState } from 'react';
import { apiCliente, mensagemDeErro } from '../api/apiCliente';
import Alerta from '../componentes/Alerta';
import BotaoAcao from '../componentes/BotaoAcao';
import IndicadorCarregamento from '../componentes/IndicadorCarregamento';
import { formatarMoeda, formatarPercentual } from '../util/formatacao';
import { chaveParaRotulo } from '../util/rotulos';

type TipoRelatorio = 'resumido' | 'completo';

export default function PaginaRelatorios() {
  const [tipo, setTipo] = useState<TipoRelatorio>('resumido');
  const [conteudo, setConteudo] = useState<unknown>(null);
  const [carregando, setCarregando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');
  const [carregou, setCarregou] = useState(false);

  async function carregar(tipoPedido: TipoRelatorio) {
    setTipo(tipoPedido);
    setCarregando(true);
    setMensagemErro('');
    try {
      const caminho =
        tipoPedido === 'completo' ? '/api/relatorios/completo' : '/api/relatorios/resumido';
      const relatorio = await apiCliente.get<unknown>(caminho);
      setConteudo(relatorio);
      setCarregou(true);
    } catch (erro) {
      setMensagemErro(mensagemDeErro(erro));
      setConteudo(null);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="titulo-pagina">Relatórios</h1>
        <p className="subtitulo-pagina">
          Visão resumida do movimento ou o relatório completo da operação.
        </p>
      </header>

      <div className="flex flex-wrap gap-3">
        <BotaoAcao
          variante={tipo === 'resumido' && carregou ? 'principal' : 'secundario'}
          disabled={carregando}
          onClick={() => void carregar('resumido')}
        >
          Relatório resumido
        </BotaoAcao>
        <BotaoAcao
          variante={tipo === 'completo' && carregou ? 'principal' : 'secundario'}
          disabled={carregando}
          onClick={() => void carregar('completo')}
        >
          Relatório completo
        </BotaoAcao>
      </div>

      <Alerta mensagem={mensagemErro} />
      {carregando ? <IndicadorCarregamento rotulo="Montando o relatório..." /> : null}

      {!carregando && carregou && conteudo !== null ? (
        <section className="cartao p-6">
          <h2 className="mb-4 text-xl font-semibold">
            {tipo === 'completo' ? 'Completo' : 'Resumido'}
          </h2>
          <BlocoRelatorio valor={conteudo} />
        </section>
      ) : null}

      {!carregando && !carregou ? (
        <p className="text-sm text-[#717171]">
          Escolha o tipo de relatório para consultar a API.
        </p>
      ) : null}
    </div>
  );
}

function ehRegistro(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

function formatarCelula(chave: string, valor: unknown): string {
  if (typeof valor === 'number') {
    const minuscula = chave.toLowerCase();
    if (minuscula.includes('percent')) {
      return formatarPercentual(valor);
    }
    if (
      minuscula.includes('receita') ||
      minuscula.includes('valor') ||
      minuscula.includes('saldo') ||
      minuscula.includes('total') ||
      minuscula.includes('preco')
    ) {
      return formatarMoeda(valor);
    }
    return valor.toLocaleString('pt-BR');
  }
  if (typeof valor === 'boolean') {
    return valor ? 'Sim' : 'Não';
  }
  if (valor === null || valor === undefined) {
    return '-';
  }
  return String(valor);
}

function BlocoRelatorio({ valor, nivel = 0 }: { valor: unknown; nivel?: number }) {
  if (Array.isArray(valor)) {
    if (valor.length === 0) {
      return <p className="text-sm text-mar-700">Sem registros neste bloco.</p>;
    }
    if (valor.every(ehRegistro)) {
      const colunas = Array.from(
        valor.reduce((acc, linha) => {
          Object.keys(linha).forEach((chave) => acc.add(chave));
          return acc;
        }, new Set<string>()),
      );
      return (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="border-b border-areia-200 text-mar-700">
              <tr>
                {colunas.map((coluna) => (
                  <th key={coluna} className="px-2 py-2 font-medium">
                    {chaveParaRotulo(coluna)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {valor.map((linha, indice) => (
                <tr key={`lin-${indice}`} className="border-b border-areia-100">
                  {colunas.map((coluna) => (
                    <td key={coluna} className="px-2 py-2">
                      {ehRegistro(linha[coluna]) || Array.isArray(linha[coluna])
                        ? JSON.stringify(linha[coluna])
                        : formatarCelula(coluna, linha[coluna])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    return (
      <ul className="list-disc space-y-1 pl-5 text-sm">
        {valor.map((entrada, indice) => (
          <li key={`v-${indice}`}>
            {ehRegistro(entrada) || Array.isArray(entrada) ? (
              <BlocoRelatorio valor={entrada} nivel={nivel + 1} />
            ) : (
              String(entrada)
            )}
          </li>
        ))}
      </ul>
    );
  }

  if (ehRegistro(valor)) {
    return (
      <div className={nivel === 0 ? 'space-y-4' : 'space-y-2 rounded-xl bg-[#F7F7F7] p-4'}>
        {Object.entries(valor).map(([chave, entrada]) => (
          <div key={chave}>
            <p className="text-sm font-medium text-mar-800">{chaveParaRotulo(chave)}</p>
            {ehRegistro(entrada) || Array.isArray(entrada) ? (
              <div className="mt-2">
                <BlocoRelatorio valor={entrada} nivel={nivel + 1} />
              </div>
            ) : (
              <p className="text-lg text-mar-900">{formatarCelula(chave, entrada)}</p>
            )}
          </div>
        ))}
      </div>
    );
  }

  return <p className="text-mar-900">{String(valor)}</p>;
}
