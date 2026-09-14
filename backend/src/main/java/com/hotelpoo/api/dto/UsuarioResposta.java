package com.hotelpoo.api.dto;

import com.hotelpoo.dominio.usuario.PapelUsuario;

public record UsuarioResposta(Long id, String nome, String login, PapelUsuario papel) {
}
