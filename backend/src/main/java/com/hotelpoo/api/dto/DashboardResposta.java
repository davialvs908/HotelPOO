package com.hotelpoo.api.dto;

import java.math.BigDecimal;

public record DashboardResposta(
        double ocupacaoPercentual,
        long checkInsHoje,
        long checkOutsHoje,
        BigDecimal receitaDoMes,
        long quartosSujos,
        long reservasAtivas) {
}
