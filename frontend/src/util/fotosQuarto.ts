import type { TipoQuarto } from '../tipos/dominio';

// IDs estáveis do Unsplash; o índice muda com o número para a grade não repetir a mesma cama.
const FOTOS_POR_TIPO: Record<TipoQuarto, string[]> = {
  SIMPLES: [
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&h=800&q=80',
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&h=800&q=80',
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&h=800&q=80',
  ],
  LUXO: [
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&h=800&q=80',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&h=800&q=80',
    'https://images.unsplash.com/photo-1596394516093-50137fbda142?auto=format&fit=crop&w=1200&h=800&q=80',
  ],
  SUITE: [
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&h=800&q=80',
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&h=800&q=80',
    'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&h=800&q=80',
  ],
};

export const FOTO_HOTEL_EDITORIAL =
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1800&q=80';

export const FOTO_QUARTO_FALLBACK =
  'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&h=800&q=80';

function indiceEstavel(chave: string, tamanho: number): number {
  let soma = 0;
  for (let i = 0; i < chave.length; i += 1) {
    soma += chave.charCodeAt(i);
  }
  return soma % tamanho;
}

export function urlFotoQuarto(tipo: TipoQuarto, numero?: string): string {
  const lista = FOTOS_POR_TIPO[tipo] ?? FOTOS_POR_TIPO.SIMPLES;
  return lista[indiceEstavel(`${tipo}-${numero ?? ''}`, lista.length)];
}
