import type { DestinoMenu, PapelUsuario, ReservaHospedagem } from '../tipos/dominio';

export const DESTINOS_MENU: DestinoMenu[] = [
  { para: '/dashboard', rotulo: 'Dashboard', papeis: ['GERENTE', 'RECEPCIONISTA'] },
  { para: '/quartos', rotulo: 'Quartos', papeis: ['GERENTE', 'RECEPCIONISTA', 'CAMAREIRA'] },
  { para: '/reservas', rotulo: 'Reservas', papeis: ['GERENTE', 'RECEPCIONISTA'] },
  { para: '/clientes', rotulo: 'Clientes', papeis: ['GERENTE', 'RECEPCIONISTA'] },
  { para: '/governanca', rotulo: 'Governança', papeis: ['GERENTE', 'CAMAREIRA'] },
  { para: '/relatorios', rotulo: 'Relatórios', papeis: ['GERENTE'] },
  { para: '/feedbacks', rotulo: 'Feedbacks', papeis: ['GERENTE', 'RECEPCIONISTA'] },
  { para: '/usuarios', rotulo: 'Usuários', papeis: ['GERENTE'] },
];

export function rotaInicial(papel: PapelUsuario): string {
  return papel === 'CAMAREIRA' ? '/quartos' : '/dashboard';
}

export function podeCriarQuarto(papel: PapelUsuario): boolean {
  return papel === 'GERENTE';
}

export function statusReservaNormalizado(reserva: ReservaHospedagem): string {
  return (reserva.status ?? '').toUpperCase();
}

export function reservaCancelada(reserva: ReservaHospedagem): boolean {
  return statusReservaNormalizado(reserva) === 'CANCELADA';
}

export function reservaFinalizada(reserva: ReservaHospedagem): boolean {
  const status = statusReservaNormalizado(reserva);
  return ['FINALIZADA', 'CHECK_OUT', 'CHECKOUT', 'CHECKED_OUT'].includes(status);
}

export function reservaComHospedeNoQuarto(reserva: ReservaHospedagem): boolean {
  const status = statusReservaNormalizado(reserva);
  return ['HOSPEDADA', 'CHECK_IN', 'CHECKIN', 'CHECKED_IN', 'ATIVA'].includes(status);
}

export function reservaPermiteCheckIn(reserva: ReservaHospedagem): boolean {
  if (reservaCancelada(reserva) || reservaFinalizada(reserva) || reservaComHospedeNoQuarto(reserva)) {
    return false;
  }
  return true;
}

export function reservaPermiteCheckOut(reserva: ReservaHospedagem): boolean {
  return reservaComHospedeNoQuarto(reserva);
}

export function reservaPermiteCancelar(reserva: ReservaHospedagem): boolean {
  return reservaPermiteCheckIn(reserva);
}

export function reservaPermiteAlterarEstada(reserva: ReservaHospedagem): boolean {
  return !reservaCancelada(reserva) && !reservaFinalizada(reserva);
}
