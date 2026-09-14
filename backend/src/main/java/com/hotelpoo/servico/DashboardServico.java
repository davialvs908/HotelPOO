package com.hotelpoo.servico;

import com.hotelpoo.api.dto.DashboardResposta;
import com.hotelpoo.dominio.quarto.StatusQuarto;
import com.hotelpoo.dominio.reserva.StatusReserva;
import com.hotelpoo.repositorio.PagamentoRepositorio;
import com.hotelpoo.repositorio.QuartoRepositorio;
import com.hotelpoo.repositorio.ReservaRepositorio;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardServico {

    private static final ZoneId FUSO_HOTEL = ZoneId.of("America/Sao_Paulo");
    private static final List<StatusReserva> ATIVAS =
            List.of(StatusReserva.RESERVADA, StatusReserva.CHECKED_IN);
    private static final List<StatusReserva> CHECK_IN_HOJE =
            List.of(StatusReserva.RESERVADA, StatusReserva.CHECKED_IN);
    private static final List<StatusReserva> CHECK_OUT_HOJE =
            List.of(StatusReserva.CHECKED_IN, StatusReserva.CHECKED_OUT);

    private final QuartoRepositorio quartoRepositorio;
    private final ReservaRepositorio reservaRepositorio;
    private final PagamentoRepositorio pagamentoRepositorio;

    public DashboardServico(
            QuartoRepositorio quartoRepositorio,
            ReservaRepositorio reservaRepositorio,
            PagamentoRepositorio pagamentoRepositorio) {
        this.quartoRepositorio = quartoRepositorio;
        this.reservaRepositorio = reservaRepositorio;
        this.pagamentoRepositorio = pagamentoRepositorio;
    }

    @Transactional(readOnly = true)
    public DashboardResposta montar() {
        long totalQuartos = quartoRepositorio.count();
        long ocupados = quartoRepositorio.countByStatus(StatusQuarto.OCUPADO);
        double ocupacao = totalQuartos == 0 ? 0.0 : (ocupados * 100.0) / totalQuartos;
        LocalDate hoje = LocalDate.now(FUSO_HOTEL);
        YearMonth mesAtual = YearMonth.from(hoje);
        BigDecimal receita = pagamentoRepositorio.somarNoPeriodo(
                mesAtual.atDay(1).atStartOfDay(FUSO_HOTEL).toInstant(),
                mesAtual.plusMonths(1).atDay(1).atStartOfDay(FUSO_HOTEL).toInstant());
        return new DashboardResposta(
                Math.round(ocupacao * 10.0) / 10.0,
                reservaRepositorio.countByCheckInAndStatusIn(hoje, CHECK_IN_HOJE),
                reservaRepositorio.countByCheckOutAndStatusIn(hoje, CHECK_OUT_HOJE),
                receita,
                quartoRepositorio.countByStatus(StatusQuarto.SUJO),
                reservaRepositorio.countByStatusIn(ATIVAS));
    }
}
