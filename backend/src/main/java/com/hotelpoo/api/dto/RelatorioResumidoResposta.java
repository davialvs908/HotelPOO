package com.hotelpoo.api.dto;

public record RelatorioResumidoResposta(
        long quartosLivres,
        long totalQuartos,
        long clientesCadastrados,
        long reservasAtivas) {
}
