export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatarPercentual(valor: number): string {
  return `${valor.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;
}

export function apenasDataIso(valor: string): string {
  return valor.slice(0, 10);
}

export function formatarData(valor?: string): string {
  if (!valor) {
    return '-';
  }
  const iso = apenasDataIso(valor);
  const partes = iso.split('-');
  if (partes.length !== 3) {
    return valor;
  }
  const [ano, mes, dia] = partes;
  return `${dia}/${mes}/${ano}`;
}

export function noitesEntre(checkIn: string, checkOut: string): number {
  const entrada = new Date(`${apenasDataIso(checkIn)}T00:00:00`);
  const saida = new Date(`${apenasDataIso(checkOut)}T00:00:00`);
  return Math.round((saida.getTime() - entrada.getTime()) / 86_400_000);
}

export function datasEstadaValidas(checkIn: string, checkOut: string): boolean {
  return Boolean(checkIn && checkOut && noitesEntre(checkIn, checkOut) >= 1);
}

export function hojeIso(): string {
  const agora = new Date();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  return `${agora.getFullYear()}-${mes}-${dia}`;
}

export function textoComparavel(valor: string): string {
  // joao precisa achar João: o recepcionista quase nunca digita acento na busca
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function emailPareceValido(email: string): boolean {
  if (!email.trim()) {
    return true;
  }
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
