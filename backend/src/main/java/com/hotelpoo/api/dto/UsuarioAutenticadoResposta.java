package com.hotelpoo.api.dto;

import com.hotelpoo.dominio.usuario.PapelUsuario;

public record UsuarioAutenticadoResposta(Long id, String nome, String login, PapelUsuario papel) {
}
