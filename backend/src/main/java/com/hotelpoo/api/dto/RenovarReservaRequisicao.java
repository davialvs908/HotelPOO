package com.hotelpoo.api.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record RenovarReservaRequisicao(
        @NotNull(message = "Nova data de check-out e obrigatoria") LocalDate novaDataCheckOut) {
}
