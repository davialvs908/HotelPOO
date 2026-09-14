import type {
  FormaPagamento,
  PapelUsuario,
  StatusQuarto,
  TipoQuarto,
} from '../tipos/dominio';

export const NOME_HOTEL = 'Hotel É o Que Tem Pra Hoje';

export function rotuloPapel(papel: PapelUsuario): string {
  if (papel === 'GERENTE') {
    return 'Gerente';
  }
  if (papel === 'RECEPCIONISTA') {
    return 'Recepcionista';
  }
  return 'Camareira';
}

export function rotuloTipoQuarto(tipo: TipoQuarto): string {
  if (tipo === 'LUXO') {
    return 'Luxo';
  }
  if (tipo === 'SUITE') {
    return 'Suíte';
  }
  return 'Simples';
}

export function rotuloStatusQuarto(status?: StatusQuarto | string): string {
  const chave = (status ?? 'LIVRE').toUpperCase();
  if (chave === 'OCUPADO') {
    return 'Ocupado';
  }
  if (chave === 'SUJO') {
    return 'Sujo';
  }
  if (chave === 'MANUTENCAO') {
    return 'Manutenção';
  }
  if (chave === 'LIVRE') {
    return 'Livre';
  }
  return status ?? 'Livre';
}

export function rotuloFormaPagamento(forma: FormaPagamento): string {
  if (forma === 'CARTAO') {
    return 'Cartão';
  }
  if (forma === 'PIX') {
    return 'Pix';
  }
  return 'Dinheiro';
}

export function rotuloStatusReserva(status?: string): string {
  const chave = (status ?? '').toUpperCase();
  const mapa: Record<string, string> = {
    CONFIRMADA: 'Confirmada',
    PENDENTE: 'Pendente',
    RESERVADA: 'Reservada',
    ATIVA: 'Ativa',
    HOSPEDADA: 'Hospedada',
    CHECK_IN: 'Check-in feito',
    CHECKIN: 'Check-in feito',
    CHECKED_IN: 'Check-in feito',
    FINALIZADA: 'Finalizada',
    CHECK_OUT: 'Check-out feito',
    CHECKOUT: 'Check-out feito',
    CHECKED_OUT: 'Check-out feito',
    CANCELADA: 'Cancelada',
  };
  return mapa[chave] ?? (status || 'Em aberto');
}

export function chaveParaRotulo(chave: string): string {
  const mapa: Record<string, string> = {
    ocupacaoPercentual: 'Ocupação',
    checkInsHoje: 'Check-ins hoje',
    checkOutsHoje: 'Check-outs hoje',
    receitaDoMes: 'Receita do mês',
    quartosSujos: 'Quartos sujos',
    reservasAtivas: 'Reservas ativas',
    valorReserva: 'Valor da reserva',
    totalPago: 'Total pago',
    saldo: 'Saldo',
    receita: 'Receita',
    total: 'Total',
  };
  if (mapa[chave]) {
    return mapa[chave];
  }
  const comEspaco = chave.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ');
  return comEspaco.charAt(0).toUpperCase() + comEspaco.slice(1);
}
