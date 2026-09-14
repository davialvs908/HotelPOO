import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiCliente, mensagemDeErro } from '../api/apiCliente';
import Alerta from '../componentes/Alerta';
import BotaoAcao from '../componentes/BotaoAcao';
import IndicadorCarregamento from '../componentes/IndicadorCarregamento';
import type { ReservaHospedagem } from '../tipos/dominio';
import { formatarData, formatarMoeda } from '../util/formatacao';
import { rotuloStatusReserva } from '../util/rotulos';

export default function PaginaReservas() {
  const [statusFiltro, setStatusFiltro] = useState('');
  const [reservas, setReservas] = useState<ReservaHospedagem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mensagemErro, setMensagemErro] = useState('');

  useEffect(() => {
    let ativo = true;
    (async () => {
      setCarregando(true);
      setMensagemErro('');
      try {
        const consulta = statusFiltro ? `?status=${encodeURIComponent(statusFiltro)}` : '';
        const lista = await apiCliente.get<ReservaHospedagem[]>(`/api/reservas${consulta}`);
        if (ativo) {
          setReservas(Array.isArray(lista) ? lista : []);
        }
      } catch (erro) {
        if (ativo) {
          setMensagemErro(mensagemDeErro(erro));
          setReservas([]);
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    })();
    return () => {
      ativo = false;
    };
  }, [statusFiltro]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="titulo-pagina">Reservas</h1>
          <p className="subtitulo-pagina">Do pedido ao folio: check-in, pagamentos e encerramento da estadia.</p>
        </div>
        <Link to="/reservas/nova">
          <BotaoAcao>Nova reserva</BotaoAcao>
        </Link>
      </header>

      <label className="block max-w-xs text-sm">
        Status
        <select
          className="entrada mt-1"
          value={statusFiltro}
          onChange={(evento) => setStatusFiltro(evento.target.value)}
        >
          <option value="">Todas</option>
          <option value="RESERVADA">Reservada</option>
          <option value="CHECKED_IN">Check-in feito</option>
          <option value="CHECKED_OUT">Check-out feito</option>
          <option value="CANCELADA">Cancelada</option>
          <option value="NO_SHOW">No-show</option>
        </select>
      </label>

      <Alerta mensagem={mensagemErro} />
      {carregando ? <IndicadorCarregamento rotulo="Carregando reservas..." /> : null}

      {!carregando && reservas.length === 0 ? (
        <p className="text-sm text-[#717171]">Nenhuma reserva neste filtro.</p>
      ) : null}

      {reservas.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="tabela-leve min-w-[720px]">
            <thead>
              <tr>
                <th>Reserva</th>
                <th>Cliente</th>
                <th>Quarto</th>
                <th>Estadia</th>
                <th>Status</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              {reservas.map((reserva) => (
                <tr key={reserva.id}>
                  <td>
                    <Link className="font-medium underline" to={`/reservas/${reserva.id}`}>
                      #{reserva.id}
                    </Link>
                  </td>
                  <td>{reserva.cliente?.nome ?? '-'}</td>
                  <td>{reserva.quarto?.numero ?? '-'}</td>
                  <td>
                    {formatarData(reserva.checkIn)} a {formatarData(reserva.checkOut)}
                  </td>
                  <td>{rotuloStatusReserva(reserva.status)}</td>
                  <td>
                    {formatarMoeda(reserva.valorTotal ?? reserva.valorReserva ?? 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
