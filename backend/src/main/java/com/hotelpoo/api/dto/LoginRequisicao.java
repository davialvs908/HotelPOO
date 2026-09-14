package com.hotelpoo.api.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequisicao(
        @NotBlank(message = "Login e obrigatorio") String login,
        @NotBlank(message = "Senha e obrigatoria") String senha) {
}
