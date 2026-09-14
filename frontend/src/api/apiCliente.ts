const CHAVE_TOKEN = 'hotelpoo.token';
const CHAVE_USUARIO = 'hotelpoo.usuario';

export class ErroApi extends Error {
  status: number;
  campo?: string;

  constructor(mensagem: string, status: number, campo?: string) {
    super(mensagem);
    this.name = 'ErroApi';
    this.status = status;
    this.campo = campo;
  }
}

export function obterToken(): string | null {
  return localStorage.getItem(CHAVE_TOKEN);
}

export function gravarToken(token: string): void {
  localStorage.setItem(CHAVE_TOKEN, token);
}

export function limparToken(): void {
  localStorage.removeItem(CHAVE_TOKEN);
  localStorage.removeItem(CHAVE_USUARIO);
}

export function gravarUsuarioLocal(jsonUsuario: string): void {
  localStorage.setItem(CHAVE_USUARIO, jsonUsuario);
}

export function obterUsuarioLocal(): string | null {
  return localStorage.getItem(CHAVE_USUARIO);
}

let redirecionarParaLogin: (() => void) | null = null;

export function registrarRedirecionamento401(callback: () => void): void {
  redirecionarParaLogin = callback;
}

async function montarErro(resposta: Response): Promise<ErroApi> {
  try {
    const corpo = (await resposta.json()) as { mensagem?: string; campo?: string };
    const mensagem = corpo.mensagem?.trim()
      ? corpo.mensagem
      : 'O servidor recusou esta operação.';
    return new ErroApi(mensagem, resposta.status, corpo.campo);
  } catch {
    return new ErroApi('O servidor recusou esta operação.', resposta.status);
  }
}

async function requisitar<T>(caminho: string, init?: RequestInit): Promise<T> {
  const cabecalhos = new Headers(init?.headers);
  const temCorpo = init?.body !== undefined && init.body !== null;

  if (temCorpo && !cabecalhos.has('Content-Type')) {
    cabecalhos.set('Content-Type', 'application/json');
  }

  const token = obterToken();
  if (token) {
    cabecalhos.set('Authorization', `Bearer ${token}`);
  }

  let resposta: Response;
  try {
    resposta = await fetch(caminho, { ...init, headers: cabecalhos });
  } catch {
    throw new ErroApi(
      'Não foi possível conectar à API. Confirme se o servidor está em http://localhost:8080.',
      0,
    );
  }

  const ehLogin = caminho.includes('/api/auth/login');
  if (resposta.status === 401 && !ehLogin) {
    limparToken();
    redirecionarParaLogin?.();
    throw new ErroApi('Sessão expirada. Entre novamente.', 401);
  }

  if (!resposta.ok) {
    throw await montarErro(resposta);
  }

  if (resposta.status === 204) {
    return undefined as T;
  }

  const texto = await resposta.text();
  if (!texto) {
    return undefined as T;
  }

  return JSON.parse(texto) as T;
}

export function mensagemDeErro(erro: unknown): string {
  if (erro instanceof ErroApi) {
    return erro.message;
  }
  if (erro instanceof Error && erro.message) {
    return erro.message;
  }
  return 'Algo saiu diferente do esperado. Tente de novo.';
}

export const apiCliente = {
  get<T>(caminho: string): Promise<T> {
    return requisitar<T>(caminho, { method: 'GET' });
  },
  post<T>(caminho: string, corpo?: unknown): Promise<T> {
    return requisitar<T>(caminho, {
      method: 'POST',
      body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
    });
  },
  put<T>(caminho: string, corpo?: unknown): Promise<T> {
    return requisitar<T>(caminho, {
      method: 'PUT',
      body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
    });
  },
  patch<T>(caminho: string, corpo?: unknown): Promise<T> {
    return requisitar<T>(caminho, {
      method: 'PATCH',
      body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
    });
  },
  delete<T>(caminho: string): Promise<T> {
    return requisitar<T>(caminho, { method: 'DELETE' });
  },
};
