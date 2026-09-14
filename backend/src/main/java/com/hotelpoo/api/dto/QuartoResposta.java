package com.hotelpoo.api.dto;

import com.hotelpoo.dominio.quarto.StatusQuarto;
import com.hotelpoo.dominio.quarto.TipoQuarto;
import java.math.BigDecimal;

public record QuartoResposta(
        Long id,
        String numero,
        TipoQuarto tipo,
        BigDecimal precoBasePorNoite,
        BigDecimal precoPorNoite,
        StatusQuarto status) {
}
