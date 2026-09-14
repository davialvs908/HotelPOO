package com.hotelpoo.api.dto;

import java.math.BigDecimal;
import java.util.List;

public record RelatorioCompletoResposta(
        long totalQuartos,
        long quartosLivres,
        long quartosOcupados,
        long quartosSujos,
        long quartosManutencao,
        long totalClientes,
        long reservasReservadas,
        long reservasCheckedIn,
        long reservasCheckedOut,
        long reservasCanceladas,
        BigDecimal receitaTotalPaga,
        List<ReservaResposta> reservasAtivas,
        List<QuartoResposta> quartos) {
}
