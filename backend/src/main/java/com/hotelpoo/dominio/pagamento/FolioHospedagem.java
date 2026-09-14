package com.hotelpoo.dominio.pagamento;

import java.math.BigDecimal;
import java.math.RoundingMode;

public record FolioHospedagem(BigDecimal valorReserva, BigDecimal totalPago, BigDecimal saldo) {

    public static FolioHospedagem de(BigDecimal valorReserva, BigDecimal totalPago) {
        BigDecimal reserva = valorReserva.setScale(2, RoundingMode.HALF_UP);
        BigDecimal pago = totalPago.setScale(2, RoundingMode.HALF_UP);
        return new FolioHospedagem(reserva, pago, reserva.subtract(pago).setScale(2, RoundingMode.HALF_UP));
    }

    public boolean quitado() {
        return saldo.compareTo(BigDecimal.ZERO) <= 0;
    }
}
