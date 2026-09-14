package com.hotelpoo.api.dto;

import jakarta.validation.constraints.NotBlank;

public record ClienteRequisicao(
        @NotBlank(message = "Nome e obrigatorio") String nome,
        @NotBlank(message = "Documento e obrigatorio") String documento,
        @NotBlank(message = "Telefone e obrigatorio") String telefone,
        @NotBlank(message = "Email e obrigatorio") String email) {
}
