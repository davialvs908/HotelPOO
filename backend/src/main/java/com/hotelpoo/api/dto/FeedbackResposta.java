package com.hotelpoo.api.dto;

public record FeedbackResposta(
        Long id,
        String texto,
        ClienteResposta cliente,
        Long reservaId) {
}
