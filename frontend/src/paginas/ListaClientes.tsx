import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiCliente, mensagemDeErro } from '../api/apiCliente';
import Alerta from '../componentes/Alerta';
import BotaoAcao from '../componentes/BotaoAcao';
import CampoFormulario from '../componentes/CampoFormulario';
import IndicadorCarregamento from '../componentes/IndicadorCarregamento';
import { useToast } from '../componentes/ProvedorToast';
import type { ClienteHotel } from '../tipos/dominio';

export default function ListaClientes() {
  const { avisar, avisarErro } = useToast();
  const [busca, setBusca] = useState('');
  const [clientes, setClientes] = useState<ClienteHotel[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mensagemErro, setMensagemErro] = useState('');
  const [excluindoId, setExcluindoId] = useState<number | null>(null);

  useEffect(() => {
    const atraso = window.setTimeout(() => {
      void carregarClientes(busca);
    }, 280);
    return () => window.clearTimeout(atraso);
  }, [busca]);

  async function carregarClientes(termo: string) {
    setCarregando(true);
    setMensagemErro('');
    try {
      const consulta = termo.trim() ? `?busca=${encodeURIComponent(termo.trim())}` : '';
      const lista = await apiCliente.get<ClienteHotel[]>(`/api/clientes${consulta}`);
      setClientes(Array.isArray(lista) ? lista : []);
    } catch (erro) {
      setMensagemErro(mensagemDeErro(erro));
      setClientes([]);
    } finally {
      setCarregando(false);
    }
  }

  async function excluirCliente(cliente: ClienteHotel) {
    const confirmado = window.confirm(
      `Excluir ${cliente.nome} da ficha de hóspedes? Esta ação não desfaz reservas já lançadas.`,
    );
    if (!confirmado) {
      return;
    }
    setExcluindoId(cliente.id);
    try {
      await apiCliente.delete(`/api/clientes/${cliente.id}`);
      avisar('Cliente excluído.');
      await carregarClientes(busca);
    } catch (erro) {
      avisarErro(mensagemDeErro(erro));
    } finally {
      setExcluindoId(null);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="titulo-pagina">Clientes</h1>
          <p className="subtitulo-pagina">Ficha de quem se hospeda aqui: busca por nome ou documento.</p>
        </div>
        <Link to="/clientes/novo">
          <BotaoAcao>Novo cliente</BotaoAcao>
        </Link>
      </header>

      <CampoFormulario
        rotulo="Busca"
        valor={busca}
        aoAlterar={setBusca}
        placeholder="Nome, documento ou e-mail"
      />

      <Alerta mensagem={mensagemErro} />
      {carregando ? <IndicadorCarregamento rotulo="Carregando clientes..." /> : null}

      {!carregando && clientes.length === 0 ? (
        <p className="text-sm text-[#717171]">Nenhum cliente encontrado para essa busca.</p>
      ) : null}

      {clientes.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="tabela-leve min-w-[640px]">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Documento</th>
                <th>Telefone</th>
                <th>E-mail</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.id}>
                  <td className="font-medium">{cliente.nome}</td>
                  <td>{cliente.documento}</td>
                  <td>{cliente.telefone || '-'}</td>
                  <td>{cliente.email || '-'}</td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      <Link to={`/clientes/${cliente.id}/editar`} className="text-sm underline">
                        Editar
                      </Link>
                      <button
                        type="button"
                        className="text-sm text-[#C13515] underline disabled:opacity-50"
                        disabled={excluindoId === cliente.id}
                        onClick={() => void excluirCliente(cliente)}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
