import type { TipoQuarto } from '../tipos/dominio';

export function precoDiaria(tipo: TipoQuarto, precoBasePorNoite: number): number {
  if (tipo === 'LUXO') {
    return precoBasePorNoite * 1.5;
  }
  if (tipo === 'SUITE') {
    // A suíte cobra o dobro da base e mais 50 por dia de serviço, regra comercial do tarifário.
    return precoBasePorNoite * 2 + 50;
  }
  return precoBasePorNoite;
}

export function totalEstada(
  tipo: TipoQuarto,
  precoBasePorNoite: number,
  noites: number,
): number {
  if (noites < 1) {
    return 0;
  }
  return precoDiaria(tipo, precoBasePorNoite) * noites;
}

export function descricaoTarifa(tipo: TipoQuarto): string {
  if (tipo === 'LUXO') {
    return 'base x 1,5';
  }
  if (tipo === 'SUITE') {
    return 'base x 2,0 + R$ 50 / dia';
  }
  return 'preço base';
}
