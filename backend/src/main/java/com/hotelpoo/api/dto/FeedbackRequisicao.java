package com.hotelpoo.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record FeedbackRequisicao(
        @NotBlank(message = "Texto do feedback e obrigatorio") String texto,
        @NotNull(message = "Cliente e obrigatorio") Long clienteId,
        Long reservaId) {
}
