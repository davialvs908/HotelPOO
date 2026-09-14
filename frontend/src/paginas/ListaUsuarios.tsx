import { FormEvent, useEffect, useState } from 'react';
import { apiCliente, mensagemDeErro } from '../api/apiCliente';
import Alerta from '../componentes/Alerta';
import BotaoAcao from '../componentes/BotaoAcao';
import CampoFormulario from '../componentes/CampoFormulario';
import IndicadorCarregamento from '../componentes/IndicadorCarregamento';
import { useToast } from '../componentes/ProvedorToast';
import type { PapelUsuario, UsuarioHotel } from '../tipos/dominio';
import { rotuloPapel } from '../util/rotulos';

const PAPEIS: PapelUsuario[] = ['GERENTE', 'RECEPCIONISTA', 'CAMAREIRA'];

export default function ListaUsuarios() {
  const { avisar, avisarErro } = useToast();
  const [usuarios, setUsuarios] = useState<UsuarioHotel[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mensagemErro, setMensagemErro] = useState('');

  const [login, setLogin] = useState('');
  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');
  const [papel, setPapel] = useState<PapelUsuario>('RECEPCIONISTA');
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function carregarUsuarios() {
    setCarregando(true);
    setMensagemErro('');
    try {
      const lista = await apiCliente.get<UsuarioHotel[]>('/api/usuarios');
      setUsuarios(Array.isArray(lista) ? lista : []);
    } catch (erro) {
      setMensagemErro(mensagemDeErro(erro));
      setUsuarios([]);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregarUsuarios();
  }, []);

  const senhaObrigatoria = editandoId === null;
  const formularioValido =
    login.trim().length > 1 &&
    nome.trim().length > 1 &&
    (!senhaObrigatoria || senha.trim().length >= 6) &&
    (senhaObrigatoria || senha.trim().length === 0 || senha.trim().length >= 6);

  function limparFormulario() {
    setLogin('');
    setNome('');
    setSenha('');
    setPapel('RECEPCIONISTA');
    setEditandoId(null);
  }

  function preencherEdicao(usuario: UsuarioHotel) {
    setEditandoId(usuario.id);
    setLogin(usuario.login);
    setNome(usuario.nome);
    setSenha('');
    setPapel(usuario.papel);
  }

  async function aoSalvar(evento: FormEvent) {
    evento.preventDefault();
    if (!formularioValido || enviando) {
      return;
    }
    setEnviando(true);
    try {
      if (editandoId) {
        const corpo: Record<string, string> = {
          login: login.trim(),
          nome: nome.trim(),
          papel,
        };
        if (senha.trim()) {
          corpo.senha = senha.trim();
        }
        await apiCliente.put(`/api/usuarios/${editandoId}`, corpo);
        avisar('Usuário atualizado.');
      } else {
        await apiCliente.post('/api/usuarios', {
          login: login.trim(),
          senha: senha.trim(),
          nome: nome.trim(),
          papel,
        });
        avisar('Usuário criado.');
      }
      limparFormulario();
      await carregarUsuarios();
    } catch (erro) {
      avisarErro(mensagemDeErro(erro));
    } finally {
      setEnviando(false);
    }
  }

  async function excluirUsuario(usuario: UsuarioHotel) {
    if (!window.confirm(`Excluir o acesso de ${usuario.nome}?`)) {
      return;
    }
    try {
      await apiCliente.delete(`/api/usuarios/${usuario.id}`);
      avisar('Usuário excluído.');
      await carregarUsuarios();
    } catch (erro) {
      avisarErro(mensagemDeErro(erro));
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="titulo-pagina">Usuários</h1>
        <p className="subtitulo-pagina">Acessos da gerência, da recepção e da governança. Só o gerente vê esta tela.</p>
      </header>

      <form onSubmit={aoSalvar} className="cartao space-y-4 p-5">
        <h2 className="text-xl font-semibold">{editandoId ? 'Editar usuário' : 'Novo usuário'}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <CampoFormulario rotulo="Login" valor={login} aoAlterar={setLogin} autoComplete="off" />
          <CampoFormulario rotulo="Nome" valor={nome} aoAlterar={setNome} />
          <CampoFormulario
            rotulo={editandoId ? 'Nova senha (opcional)' : 'Senha'}
            valor={senha}
            aoAlterar={setSenha}
            type="password"
            autoComplete="new-password"
            mensagemErro={
              senha && senha.trim().length > 0 && senha.trim().length < 6
                ? 'A senha precisa de pelo menos 6 caracteres.'
                : undefined
            }
          />
          <label className="block">
            <span className="rotulo-campo">Papel</span>
            <select
              className="entrada"
              value={papel}
              onChange={(evento) => setPapel(evento.target.value as PapelUsuario)}
            >
              {PAPEIS.map((opcao) => (
                <option key={opcao} value={opcao}>
                  {rotuloPapel(opcao)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          <BotaoAcao type="submit" disabled={!formularioValido || enviando}>
            {enviando ? 'Salvando...' : 'Salvar usuário'}
          </BotaoAcao>
          {editandoId ? (
            <BotaoAcao variante="secundario" onClick={limparFormulario}>
              Cancelar edição
            </BotaoAcao>
          ) : null}
        </div>
      </form>

      <Alerta mensagem={mensagemErro} />
      {carregando ? <IndicadorCarregamento rotulo="Carregando usuários..." /> : null}

      {usuarios.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="tabela-leve min-w-[520px]">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Login</th>
                <th>Papel</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td className="font-medium">{usuario.nome}</td>
                  <td>{usuario.login}</td>
                  <td>{rotuloPapel(usuario.papel)}</td>
                  <td>
                    <div className="flex gap-3">
                      <button type="button" className="underline" onClick={() => preencherEdicao(usuario)}>
                        Editar
                      </button>
                      <button
                        type="button"
                        className="text-[#C13515] underline"
                        onClick={() => void excluirUsuario(usuario)}
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
