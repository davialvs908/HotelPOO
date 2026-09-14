package com.hotelpoo.api.dto;

import com.hotelpoo.dominio.pagamento.FormaPagamento;
import java.math.BigDecimal;
import java.time.Instant;

public record PagamentoResposta(Long id, BigDecimal valor, FormaPagamento forma, Instant instante) {
}
