import { useState } from 'react';
import type { TipoQuarto } from '../tipos/dominio';
import { FOTO_QUARTO_FALLBACK, urlFotoQuarto } from '../util/fotosQuarto';

type Propriedades = {
  tipo: TipoQuarto;
  numero?: string;
  className?: string;
  alt?: string;
};

export default function FotoQuarto({ tipo, numero, className = '', alt }: Propriedades) {
  const [quebrada, setQuebrada] = useState(false);
  const origem = quebrada ? FOTO_QUARTO_FALLBACK : urlFotoQuarto(tipo, numero);

  return (
    <div className={`overflow-hidden bg-[#EBEBEB] ${className}`}>
      <img
        src={origem}
        alt={alt ?? (numero ? `Quarto ${numero}` : 'Quarto do hotel')}
        className="h-full w-full object-cover"
        referrerPolicy="no-referrer"
        onError={() => setQuebrada(true)}
      />
    </div>
  );
}
