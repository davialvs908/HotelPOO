package com.hotelpoo.api.dto;

import com.hotelpoo.dominio.quarto.TipoQuarto;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record QuartoRequisicao(
        @NotBlank(message = "Numero do quarto e obrigatorio") String numero,
        @NotNull(message = "Tipo do quarto e obrigatorio") TipoQuarto tipo,
        @NotNull(message = "Preco base por noite e obrigatorio")
        @DecimalMin(value = "0.01", message = "Preco base por noite deve ser maior que zero")
        BigDecimal precoBasePorNoite) {
}
