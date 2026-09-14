package com.hotelpoo.servico;

import com.hotelpoo.api.dto.FolioResposta;
import com.hotelpoo.api.dto.HospedeRequisicao;
import com.hotelpoo.api.dto.HospedeResposta;
import com.hotelpoo.api.dto.MontadorRespostas;
import com.hotelpoo.api.dto.PagamentoRequisicao;
import com.hotelpoo.api.dto.PagamentoResposta;
import com.hotelpoo.api.dto.ReservaRequisicao;
import com.hotelpoo.api.dto.ReservaResposta;
import com.hotelpoo.dominio.cliente.Cliente;
import com.hotelpoo.dominio.pagamento.FolioHospedagem;
import com.hotelpoo.dominio.pagamento.Pagamento;
import com.hotelpoo.dominio.quarto.Quarto;
import com.hotelpoo.dominio.reserva.CalendarioHospedagem;
import com.hotelpoo.dominio.reserva.HospedeReserva;
import com.hotelpoo.dominio.reserva.Reserva;
import com.hotelpoo.dominio.reserva.StatusReserva;
import com.hotelpoo.excecao.ConflitoNegocioException;
import com.hotelpoo.excecao.RecursoNaoEncontradoException;
import com.hotelpoo.repositorio.ReservaRepositorio;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReservaServico {

    private final ReservaRepositorio reservaRepositorio;
    private final ClienteServico clienteServico;
    private final QuartoServico quartoServico;

    public ReservaServico(
            ReservaRepositorio reservaRepositorio,
            ClienteServico clienteServico,
            QuartoServico quartoServico) {
        this.reservaRepositorio = reservaRepositorio;
        this.clienteServico = clienteServico;
        this.quartoServico = quartoServico;
    }

    @Transactional(readOnly = true)
    public List<ReservaResposta> listar(StatusReserva status) {
        List<Reserva> reservas = status == null
                ? reservaRepositorio.listarComClienteEQuarto()
                : reservaRepositorio.listarPorStatus(status);
        return reservas.stream().map(MontadorRespostas::reserva).toList();
    }

    @Transactional(readOnly = true)
    public ReservaResposta buscarPorId(Long id) {
        return MontadorRespostas.reserva(carregar(id));
    }

    @Transactional
    public ReservaResposta criar(ReservaRequisicao requisicao) {
        CalendarioHospedagem.validarIntervalo(requisicao.checkIn(), requisicao.checkOut());
        Cliente cliente = clienteServico.carregar(requisicao.clienteId());
        Quarto quarto = quartoServico.carregar(requisicao.quartoId());
        garantirDisponibilidade(quarto, requisicao.checkIn(), requisicao.checkOut(), null);
        Reserva reserva = Reserva.criar(cliente, quarto, requisicao.checkIn(), requisicao.checkOut());
        if (requisicao.hospedes() != null) {
            requisicao.hospedes().forEach(hospede -> reserva.adicionarHospede(hospede.nome(), hospede.documento()));
        }
        return MontadorRespostas.reserva(reservaRepositorio.save(reserva));
    }

    @Transactional
    public ReservaResposta cancelar(Long id) {
        Reserva reserva = carregar(id);
        reserva.cancelar();
        return MontadorRespostas.reserva(reserva);
    }

    @Transactional
    public ReservaResposta renovar(Long id, LocalDate novaDataCheckOut) {
        Reserva reserva = carregar(id);
        garantirDisponibilidade(reserva.getQuarto(), reserva.getCheckIn(), novaDataCheckOut, reserva.getId());
        reserva.renovarAte(novaDataCheckOut);
        return MontadorRespostas.reserva(reserva);
    }

    @Transactional
    public ReservaResposta transferir(Long id, Long novoQuartoId) {
        Reserva reserva = carregar(id);
        Quarto novoQuarto = quartoServico.carregar(novoQuartoId);
        garantirDisponibilidade(novoQuarto, reserva.getCheckIn(), reserva.getCheckOut(), reserva.getId());
        reserva.transferirPara(novoQuarto);
        return MontadorRespostas.reserva(reserva);
    }

    @Transactional
    public ReservaResposta realizarCheckIn(Long id) {
        Reserva reserva = carregar(id);
        reserva.realizarCheckIn(LocalDate.now());
        return MontadorRespostas.reserva(reserva);
    }

    @Transactional
    public ReservaResposta realizarCheckOut(Long id) {
        Reserva reserva = carregar(id);
        FolioHospedagem folio = reserva.calcularFolio();
        reserva.realizarCheckOut(folio.saldo());
        return MontadorRespostas.reserva(reserva);
    }

    @Transactional
    public HospedeResposta adicionarHospede(Long id, HospedeRequisicao requisicao) {
        Reserva reserva = carregar(id);
        HospedeReserva hospede = reserva.adicionarHospede(requisicao.nome(), requisicao.documento());
        reservaRepositorio.save(reserva);
        return MontadorRespostas.hospede(hospede);
    }

    @Transactional
    public PagamentoResposta registrarPagamento(Long id, PagamentoRequisicao requisicao) {
        Reserva reserva = carregar(id);
        Pagamento pagamento = reserva.registrarPagamento(requisicao.valor(), requisicao.forma());
        reservaRepositorio.save(reserva);
        return MontadorRespostas.pagamento(pagamento);
    }

    @Transactional(readOnly = true)
    public FolioResposta consultarFolio(Long id) {
        Reserva reserva = carregar(id);
        return MontadorRespostas.folio(reserva.calcularFolio());
    }

    private void garantirDisponibilidade(Quarto quarto, LocalDate checkIn, LocalDate checkOut, Long reservaIgnoradaId) {
        if (quarto.emManutencao()) {
            throw new ConflitoNegocioException("Quarto em manutencao nao pode receber reserva.", "quartoId");
        }
        if (!quartoServico.estaLivreNoPeriodo(quarto, checkIn, checkOut, reservaIgnoradaId)) {
            throw new ConflitoNegocioException(
                    "Quarto indisponivel no periodo informado: ha sobreposicao com outra reserva.",
                    "quartoId");
        }
    }

    private Reserva carregar(Long id) {
        return reservaRepositorio.buscarComClienteEQuarto(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Reserva nao encontrada."));
    }
}
