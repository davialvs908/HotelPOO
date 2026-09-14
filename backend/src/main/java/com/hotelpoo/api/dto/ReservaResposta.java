package com.hotelpoo.api.dto;

import com.hotelpoo.dominio.reserva.StatusReserva;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record ReservaResposta(
        Long id,
        ClienteResposta cliente,
        QuartoResposta quarto,
        LocalDate checkIn,
        LocalDate checkOut,
        BigDecimal valorTotal,
        StatusReserva status,
        List<HospedeResposta> hospedes,
        List<PagamentoResposta> pagamentos,
        BigDecimal saldo) {
}
