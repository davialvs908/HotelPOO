export type PapelUsuario = 'GERENTE' | 'RECEPCIONISTA' | 'CAMAREIRA';

export type TipoQuarto = 'SIMPLES' | 'LUXO' | 'SUITE';

export type StatusQuarto = 'LIVRE' | 'OCUPADO' | 'SUJO' | 'MANUTENCAO';

export type FormaPagamento = 'DINHEIRO' | 'CARTAO' | 'PIX';

export type UsuarioSessao = {
  id?: number;
  login?: string;
  nome: string;
  papel: PapelUsuario;
};

export type RespostaLogin = {
  token: string;
  nome: string;
  papel: PapelUsuario;
};

export type ClienteHotel = {
  id: number;
  nome: string;
  documento: string;
  telefone?: string;
  email?: string;
};

export type QuartoHotel = {
  id: number;
  numero: string;
  tipo: TipoQuarto;
  precoBasePorNoite: number;
  status?: StatusQuarto;
  disponivel?: boolean;
};

export type HospedeAcompanhante = {
  id?: number;
  nome: string;
  documento: string;
};

export type LancamentoPagamento = {
  id?: number;
  valor: number;
  forma: FormaPagamento;
  registradoEm?: string;
  criadoEm?: string;
};

export type FolioHospedagem = {
  valorReserva: number;
  totalPago: number;
  saldo: number;
};

export type ReservaHospedagem = {
  id: number;
  status?: string;
  checkIn: string;
  checkOut: string;
  valorTotal?: number;
  valorReserva?: number;
  cliente?: ClienteHotel;
  clienteId?: number;
  quarto?: QuartoHotel;
  quartoId?: number;
  hospedes?: HospedeAcompanhante[];
  acompanhantes?: HospedeAcompanhante[];
  pagamentos?: LancamentoPagamento[];
};

export type PainelIndicadores = {
  ocupacaoPercentual: number;
  checkInsHoje: number;
  checkOutsHoje: number;
  receitaDoMes: number;
  quartosSujos: number;
  reservasAtivas: number;
};

export type FeedbackHospede = {
  id: number;
  nomeHospede?: string;
  autor?: string;
  hospedeNome?: string;
  mensagem?: string;
  comentario?: string;
  texto?: string;
  nota?: number;
  criadoEm?: string;
};

export type UsuarioHotel = {
  id: number;
  login: string;
  nome: string;
  papel: PapelUsuario;
};

export type DestinoMenu = {
  para: string;
  rotulo: string;
  papeis: PapelUsuario[];
};
