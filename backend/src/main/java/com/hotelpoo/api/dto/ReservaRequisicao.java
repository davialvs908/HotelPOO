package com.hotelpoo.api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public record ReservaRequisicao(
        @NotNull(message = "Cliente e obrigatorio") Long clienteId,
        @NotNull(message = "Quarto e obrigatorio") Long quartoId,
        @NotNull(message = "Data de check-in e obrigatoria") LocalDate checkIn,
        @NotNull(message = "Data de check-out e obrigatoria") LocalDate checkOut,
        @Valid List<HospedeRequisicao> hospedes) {
}
