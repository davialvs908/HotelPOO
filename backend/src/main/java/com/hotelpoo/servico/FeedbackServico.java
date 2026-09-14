package com.hotelpoo.servico;

import com.hotelpoo.api.dto.FeedbackRequisicao;
import com.hotelpoo.api.dto.FeedbackResposta;
import com.hotelpoo.api.dto.MontadorRespostas;
import com.hotelpoo.dominio.cliente.Cliente;
import com.hotelpoo.dominio.feedback.FeedbackHospede;
import com.hotelpoo.dominio.reserva.Reserva;
import com.hotelpoo.excecao.RecursoNaoEncontradoException;
import com.hotelpoo.excecao.RequisicaoInvalidaException;
import com.hotelpoo.repositorio.FeedbackRepositorio;
import com.hotelpoo.repositorio.ReservaRepositorio;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FeedbackServico {

    private final FeedbackRepositorio feedbackRepositorio;
    private final ClienteServico clienteServico;
    private final ReservaRepositorio reservaRepositorio;

    public FeedbackServico(
            FeedbackRepositorio feedbackRepositorio,
            ClienteServico clienteServico,
            ReservaRepositorio reservaRepositorio) {
        this.feedbackRepositorio = feedbackRepositorio;
        this.clienteServico = clienteServico;
        this.reservaRepositorio = reservaRepositorio;
    }

    @Transactional(readOnly = true)
    public List<FeedbackResposta> listar() {
        return feedbackRepositorio.listarComClienteEReserva().stream()
                .map(MontadorRespostas::feedback)
                .toList();
    }

    @Transactional(readOnly = true)
    public FeedbackResposta buscarPorId(Long id) {
        return MontadorRespostas.feedback(carregar(id));
    }

    @Transactional
    public FeedbackResposta cadastrar(FeedbackRequisicao requisicao) {
        Cliente cliente = clienteServico.carregar(requisicao.clienteId());
        Reserva reserva = carregarReservaOpcional(requisicao.reservaId());
        garantirReservaDoCliente(reserva, cliente);
        FeedbackHospede feedback = new FeedbackHospede(requisicao.texto(), cliente, reserva);
        return MontadorRespostas.feedback(feedbackRepositorio.save(feedback));
    }

    @Transactional
    public FeedbackResposta atualizar(Long id, FeedbackRequisicao requisicao) {
        FeedbackHospede feedback = carregar(id);
        Cliente cliente = clienteServico.carregar(requisicao.clienteId());
        Reserva reserva = carregarReservaOpcional(requisicao.reservaId());
        garantirReservaDoCliente(reserva, cliente);
        feedback.atualizar(requisicao.texto(), cliente, reserva);
        return MontadorRespostas.feedback(feedback);
    }

    @Transactional
    public void remover(Long id) {
        FeedbackHospede feedback = carregar(id);
        feedbackRepositorio.delete(feedback);
    }

    private Reserva carregarReservaOpcional(Long reservaId) {
        if (reservaId == null) {
            return null;
        }
        return reservaRepositorio.buscarComClienteEQuarto(reservaId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Reserva do feedback nao encontrada."));
    }

    private void garantirReservaDoCliente(Reserva reserva, Cliente cliente) {
        if (reserva != null && !reserva.getCliente().getId().equals(cliente.getId())) {
            throw new RequisicaoInvalidaException(
                    "A reserva informada nao pertence a este cliente.",
                    "reservaId");
        }
    }

    private FeedbackHospede carregar(Long id) {
        return feedbackRepositorio.buscarComClienteEReserva(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Feedback nao encontrado."));
    }
}
