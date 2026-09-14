package com.hotelpoo.api.dto;

import jakarta.validation.constraints.NotNull;

public record TransferirReservaRequisicao(
        @NotNull(message = "Novo quarto e obrigatorio") Long novoQuartoId) {
}
