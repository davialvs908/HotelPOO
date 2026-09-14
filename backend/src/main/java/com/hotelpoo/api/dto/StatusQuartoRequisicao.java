package com.hotelpoo.api.dto;

import com.hotelpoo.dominio.quarto.StatusQuarto;
import jakarta.validation.constraints.NotNull;

public record StatusQuartoRequisicao(
        @NotNull(message = "Status e obrigatorio") StatusQuarto status) {
}
