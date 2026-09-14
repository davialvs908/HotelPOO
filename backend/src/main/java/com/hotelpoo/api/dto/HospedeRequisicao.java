package com.hotelpoo.api.dto;

import jakarta.validation.constraints.NotBlank;

public record HospedeRequisicao(
        @NotBlank(message = "Nome do acompanhante e obrigatorio") String nome,
        String documento) {
}
