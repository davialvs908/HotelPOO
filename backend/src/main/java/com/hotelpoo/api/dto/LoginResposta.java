package com.hotelpoo.api.dto;

import com.hotelpoo.dominio.usuario.PapelUsuario;

public record LoginResposta(String token, String nome, PapelUsuario papel) {
}
