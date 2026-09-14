package com.hotelpoo.api.dto;

import java.math.BigDecimal;

public record FolioResposta(BigDecimal valorReserva, BigDecimal totalPago, BigDecimal saldo) {
}
