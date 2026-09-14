package com.hotelpoo.servico;

import com.hotelpoo.api.dto.MontadorRespostas;
import com.hotelpoo.api.dto.RelatorioCompletoResposta;
import com.hotelpoo.api.dto.RelatorioResumidoResposta;
import com.hotelpoo.api.dto.ReservaResposta;
import com.hotelpoo.dominio.quarto.StatusQuarto;
import com.hotelpoo.dominio.reserva.StatusReserva;
import com.hotelpoo.repositorio.ClienteRepositorio;
import com.hotelpoo.repositorio.PagamentoRepositorio;
import com.hotelpoo.repositorio.QuartoRepositorio;
import com.hotelpoo.repositorio.ReservaRepositorio;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RelatorioServico {

    private static final List<StatusReserva> ATIVAS =
            List.of(StatusReserva.RESERVADA, StatusReserva.CHECKED_IN);

    private final QuartoRepositorio quartoRepositorio;
    private final ClienteRepositorio clienteRepositorio;
    private final ReservaRepositorio reservaRepositorio;
    private final PagamentoRepositorio pagamentoRepositorio;

    public RelatorioServico(
            QuartoRepositorio quartoRepositorio,
            ClienteRepositorio clienteRepositorio,
            ReservaRepositorio reservaRepositorio,
            PagamentoRepositorio pagamentoRepositorio) {
        this.quartoRepositorio = quartoRepositorio;
        this.clienteRepositorio = clienteRepositorio;
        this.reservaRepositorio = reservaRepositorio;
        this.pagamentoRepositorio = pagamentoRepositorio;
    }

    @Transactional(readOnly = true)
    public RelatorioResumidoResposta resumido() {
        long totalQuartos = quartoRepositorio.count();
        long livres = quartoRepositorio.countByStatus(StatusQuarto.LIVRE);
        return new RelatorioResumidoResposta(
                livres,
                totalQuartos,
                clienteRepositorio.count(),
                reservaRepositorio.countByStatusIn(ATIVAS));
    }

    @Transactional(readOnly = true)
    public RelatorioCompletoResposta completo() {
        List<ReservaResposta> reservasAtivas = reservaRepositorio.listarComClienteEQuarto().stream()
                .filter(reserva -> reserva.estaAtiva())
                .map(MontadorRespostas::reserva)
                .toList();
        BigDecimal receitaTotal = pagamentoRepositorio.somarNoPeriodo(Instant.EPOCH, Instant.now().plusSeconds(1));
        return new RelatorioCompletoResposta(
                quartoRepositorio.count(),
                quartoRepositorio.countByStatus(StatusQuarto.LIVRE),
                quartoRepositorio.countByStatus(StatusQuarto.OCUPADO),
                quartoRepositorio.countByStatus(StatusQuarto.SUJO),
                quartoRepositorio.countByStatus(StatusQuarto.MANUTENCAO),
                clienteRepositorio.count(),
                reservaRepositorio.countByStatusIn(List.of(StatusReserva.RESERVADA)),
                reservaRepositorio.countByStatusIn(List.of(StatusReserva.CHECKED_IN)),
                reservaRepositorio.countByStatusIn(List.of(StatusReserva.CHECKED_OUT)),
                reservaRepositorio.countByStatusIn(List.of(StatusReserva.CANCELADA)),
                receitaTotal,
                reservasAtivas,
                quartoRepositorio.findAllByOrderByNumeroAsc().stream().map(MontadorRespostas::quarto).toList());
    }
}
