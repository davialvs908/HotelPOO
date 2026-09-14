import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  apiCliente,
  gravarToken,
  gravarUsuarioLocal,
  limparToken,
  mensagemDeErro,
  obterToken,
  obterUsuarioLocal,
  registrarRedirecionamento401,
} from '../api/apiCliente';
import type { RespostaLogin, UsuarioSessao } from '../tipos/dominio';
import { rotaInicial } from '../util/permissoes';

type ContextoAuth = {
  usuario: UsuarioSessao | null;
  autenticado: boolean;
  carregandoSessao: boolean;
  mensagemSessao: string;
  entrar: (login: string, senha: string) => Promise<void>;
  sair: () => void;
};

const AuthContexto = createContext<ContextoAuth | null>(null);

function lerUsuarioGuardado(): UsuarioSessao | null {
  const bruto = obterUsuarioLocal();
  if (!bruto) {
    return null;
  }
  try {
    return JSON.parse(bruto) as UsuarioSessao;
  } catch {
    return null;
  }
}

export default function ProvedorAuth({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<UsuarioSessao | null>(lerUsuarioGuardado);
  const [carregandoSessao, setCarregandoSessao] = useState(Boolean(obterToken()));
  const [mensagemSessao, setMensagemSessao] = useState('');

  const limparSessao = useCallback(() => {
    limparToken();
    setUsuario(null);
  }, []);

  useEffect(() => {
    registrarRedirecionamento401(() => {
      limparSessao();
      navigate('/login', { replace: true });
    });
  }, [limparSessao, navigate]);

  useEffect(() => {
    const token = obterToken();
    if (!token) {
      setCarregandoSessao(false);
      return;
    }

    let ativo = true;
    (async () => {
      try {
        const sessao = await apiCliente.get<UsuarioSessao>('/api/auth/me');
        if (!ativo) {
          return;
        }
        setUsuario(sessao);
        gravarUsuarioLocal(JSON.stringify(sessao));
        setMensagemSessao('');
      } catch (erro) {
        if (!ativo) {
          return;
        }
        limparSessao();
        setMensagemSessao(mensagemDeErro(erro));
      } finally {
        if (ativo) {
          setCarregandoSessao(false);
        }
      }
    })();

    return () => {
      ativo = false;
    };
  }, [limparSessao]);

  const entrar = useCallback(
    async (login: string, senha: string) => {
      const resposta = await apiCliente.post<RespostaLogin>('/api/auth/login', {
        login,
        senha,
      });
      gravarToken(resposta.token);
      const sessao: UsuarioSessao = { nome: resposta.nome, papel: resposta.papel };
      setUsuario(sessao);
      gravarUsuarioLocal(JSON.stringify(sessao));
      navigate(rotaInicial(resposta.papel), { replace: true });
    },
    [navigate],
  );

  const sair = useCallback(() => {
    limparSessao();
    navigate('/login', { replace: true });
  }, [limparSessao, navigate]);

  const valor = useMemo<ContextoAuth>(
    () => ({
      usuario,
      autenticado: Boolean(usuario && obterToken()),
      carregandoSessao,
      mensagemSessao,
      entrar,
      sair,
    }),
    [carregandoSessao, entrar, mensagemSessao, sair, usuario],
  );

  return <AuthContexto.Provider value={valor}>{children}</AuthContexto.Provider>;
}

export function useAuth(): ContextoAuth {
  const contexto = useContext(AuthContexto);
  if (!contexto) {
    throw new Error('useAuth precisa estar dentro de ProvedorAuth.');
  }
  return contexto;
}
