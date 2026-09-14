import { useEffect, useMemo, useRef, useState } from 'react';
import { apiCliente, mensagemDeErro } from '../api/apiCliente';
import type { ClienteHotel } from '../tipos/dominio';
import { textoComparavel } from '../util/formatacao';

type Propriedades = {
  clienteId: string;
  aoEscolherId: (id: string) => void;
};

function rotuloCliente(cliente: ClienteHotel): string {
  return `${cliente.nome} - ${cliente.documento}`;
}

function clienteBateComTermo(cliente: ClienteHotel, termo: string): boolean {
  const alvo = textoComparavel(termo);
  if (!alvo) {
    return true;
  }
  const soDigitos = termo.replace(/\D/g, '');
  return (
    textoComparavel(cliente.nome).includes(alvo) ||
    cliente.documento.includes(soDigitos.length >= 3 ? soDigitos : alvo) ||
    textoComparavel(cliente.email ?? '').includes(alvo)
  );
}

export default function CampoBuscaCliente({ clienteId, aoEscolherId }: Propriedades) {
  const [ficha, setFicha] = useState<ClienteHotel[]>([]);
  const [termo, setTermo] = useState('');
  const [listaAberta, setListaAberta] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');
  const caixaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const lista = await apiCliente.get<ClienteHotel[]>('/api/clientes');
        if (ativo) {
          setFicha(Array.isArray(lista) ? lista : []);
        }
      } catch (erro) {
        if (ativo) {
          setMensagemErro(mensagemDeErro(erro));
        }
      }
    })();
    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    function fecharSeClicarFora(evento: MouseEvent) {
      if (!caixaRef.current?.contains(evento.target as Node)) {
        setListaAberta(false);
      }
    }
    document.addEventListener('mousedown', fecharSeClicarFora);
    return () => document.removeEventListener('mousedown', fecharSeClicarFora);
  }, []);

  const sugestoes = useMemo(() => {
    const filtrados = termo.trim() ? ficha.filter((cliente) => clienteBateComTermo(cliente, termo)) : ficha;
    return filtrados.slice(0, 8);
  }, [ficha, termo]);

  useEffect(() => {
    if (!termo.trim()) {
      if (clienteId) {
        aoEscolherId('');
      }
      return;
    }
    if (sugestoes.length === 1) {
      const unico = sugestoes[0];
      const rotulo = rotuloCliente(unico);
      if (String(unico.id) !== clienteId) {
        aoEscolherId(String(unico.id));
      }
      if (termo !== rotulo) {
        setTermo(rotulo);
        setListaAberta(false);
      }
      return;
    }
    if (clienteId && !sugestoes.some((cliente) => String(cliente.id) === clienteId)) {
      aoEscolherId('');
    }
  }, [aoEscolherId, clienteId, sugestoes, termo]);

  const clienteEscolhido = ficha.find((cliente) => String(cliente.id) === clienteId);

  function escolherCliente(cliente: ClienteHotel) {
    aoEscolherId(String(cliente.id));
    setTermo(rotuloCliente(cliente));
    setListaAberta(false);
  }

  return (
    <div ref={caixaRef} className="relative">
      <label className="block" htmlFor="busca-cliente-reserva">
        <span className="rotulo-campo">Cliente</span>
        <input
          id="busca-cliente-reserva"
          className="entrada"
          value={termo}
          autoComplete="off"
          placeholder="Digite o nome, CPF ou e-mail"
          onChange={(evento) => {
            setTermo(evento.target.value);
            setListaAberta(true);
          }}
          onFocus={() => setListaAberta(true)}
        />
      </label>

      {listaAberta ? (
        <ul className="absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-2xl border border-[#EBEBEB] bg-white py-2 shadow-[0_6px_20px_rgba(0,0,0,0.12)]">
          {sugestoes.length === 0 ? (
            <li className="px-4 py-3 text-sm text-[#717171]">Nenhum hóspede com esse nome ou documento.</li>
          ) : (
            sugestoes.map((cliente) => {
              const marcado = String(cliente.id) === clienteId;
              return (
                <li key={cliente.id}>
                  <button
                    type="button"
                    className={`flex w-full flex-col px-4 py-2.5 text-left transition hover:bg-[#F7F7F7] ${
                      marcado ? 'bg-[#FFF8F6]' : ''
                    }`}
                    onMouseDown={(evento) => evento.preventDefault()}
                    onClick={() => escolherCliente(cliente)}
                  >
                    <span className="text-sm font-medium text-[#222222]">{cliente.nome}</span>
                    <span className="text-xs text-[#717171]">
                      {cliente.documento}
                      {cliente.email ? ` - ${cliente.email}` : ''}
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      ) : null}

      {clienteEscolhido && !listaAberta ? (
        <p className="mt-2 text-sm text-[#717171]">
          Titular da reserva: {clienteEscolhido.nome} - {clienteEscolhido.documento}
        </p>
      ) : null}

      {mensagemErro ? <p className="mt-2 text-xs text-red-700">{mensagemErro}</p> : null}
    </div>
  );
}
