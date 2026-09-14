package com.hotelpoo.servico;

import com.hotelpoo.api.dto.MontadorRespostas;
import com.hotelpoo.api.dto.QuartoRequisicao;
import com.hotelpoo.api.dto.QuartoResposta;
import com.hotelpoo.dominio.quarto.FabricaQuarto;
import com.hotelpoo.dominio.quarto.Quarto;
import com.hotelpoo.dominio.quarto.StatusQuarto;
import com.hotelpoo.dominio.reserva.CalendarioHospedagem;
import com.hotelpoo.dominio.reserva.StatusReserva;
import com.hotelpoo.excecao.ConflitoNegocioException;
import com.hotelpoo.excecao.RecursoNaoEncontradoException;
import com.hotelpoo.excecao.RequisicaoInvalidaException;
import com.hotelpoo.repositorio.QuartoRepositorio;
import com.hotelpoo.repositorio.ReservaRepositorio;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class QuartoServico {

    private static final List<StatusReserva> STATUS_BLOQUEANTES =
            List.of(StatusReserva.RESERVADA, StatusReserva.CHECKED_IN);

    private final QuartoRepositorio quartoRepositorio;
    private final ReservaRepositorio reservaRepositorio;

    public QuartoServico(QuartoRepositorio quartoRepositorio, ReservaRepositorio reservaRepositorio) {
        this.quartoRepositorio = quartoRepositorio;
        this.reservaRepositorio = reservaRepositorio;
    }

    @Transactional(readOnly = true)
    public List<QuartoResposta> listar() {
        return quartoRepositorio.findAllByOrderByNumeroAsc().stream()
                .map(MontadorRespostas::quarto)
                .toList();
    }

    @Transactional(readOnly = true)
    public QuartoResposta buscarPorId(Long id) {
        return MontadorRespostas.quarto(carregar(id));
    }

    @Transactional(readOnly = true)
    public List<QuartoResposta> listarDisponiveis(LocalDate checkIn, LocalDate checkOut) {
        CalendarioHospedagem.validarIntervalo(checkIn, checkOut);
        return quartoRepositorio.findAllByOrderByNumeroAsc().stream()
                .filter(quarto -> estaLivreNoPeriodo(quarto, checkIn, checkOut, null))
                .map(MontadorRespostas::quarto)
                .toList();
    }

    @Transactional
    public QuartoResposta cadastrar(QuartoRequisicao requisicao) {
        garantirNumeroLivre(requisicao.numero().trim(), null);
        Quarto quarto = FabricaQuarto.criar(
                requisicao.tipo(),
                requisicao.numero(),
                requisicao.precoBasePorNoite());
        return MontadorRespostas.quarto(quartoRepositorio.save(quarto));
    }

    @Transactional
    public QuartoResposta atualizar(Long id, QuartoRequisicao requisicao) {
        Quarto quarto = carregar(id);
        if (quarto.getTipo() != requisicao.tipo()) {
            throw new RequisicaoInvalidaException("O tipo do quarto nao pode ser alterado apos o cadastro.", "tipo");
        }
        garantirNumeroLivre(requisicao.numero().trim(), id);
        quarto.atualizarCadastro(requisicao.numero(), requisicao.precoBasePorNoite());
        return MontadorRespostas.quarto(quarto);
    }

    @Transactional
    public QuartoResposta alterarStatus(Long id, StatusQuarto novoStatus) {
        Quarto quarto = carregar(id);
        if (novoStatus == StatusQuarto.LIVRE
                && reservaRepositorio.existsByQuartoIdAndStatus(id, StatusReserva.CHECKED_IN)) {
            throw new ConflitoNegocioException(
                    "Nao e possivel marcar o quarto como LIVRE enquanto houver hospede com check-in.",
                    "status");
        }
        quarto.aplicarStatusGovernanca(novoStatus);
        return MontadorRespostas.quarto(quarto);
    }

    public boolean estaLivreNoPeriodo(Quarto quarto, LocalDate checkIn, LocalDate checkOut, Long reservaIgnoradaId) {
        if (quarto.emManutencao()) {
            return false;
        }
        return !reservaRepositorio.existeSobreposicao(
                quarto.getId(),
                checkIn,
                checkOut,
                reservaIgnoradaId,
                STATUS_BLOQUEANTES);
    }

    public Quarto carregar(Long id) {
        return quartoRepositorio.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Quarto nao encontrado."));
    }

    private void garantirNumeroLivre(String numero, Long idAtual) {
        boolean duplicado = idAtual == null
                ? quartoRepositorio.existsByNumero(numero)
                : quartoRepositorio.existsByNumeroAndIdNot(numero, idAtual);
        if (duplicado) {
            throw new ConflitoNegocioException("Ja existe quarto com este numero.", "numero");
        }
    }
}
