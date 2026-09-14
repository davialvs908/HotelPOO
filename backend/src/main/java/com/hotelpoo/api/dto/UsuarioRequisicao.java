package com.hotelpoo.api.dto;

import com.hotelpoo.dominio.usuario.PapelUsuario;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UsuarioRequisicao(
        @NotBlank(message = "Nome e obrigatorio") String nome,
        @NotBlank(message = "Login e obrigatorio") String login,
        String senha,
        @NotNull(message = "Papel e obrigatorio") PapelUsuario papel) {
}
