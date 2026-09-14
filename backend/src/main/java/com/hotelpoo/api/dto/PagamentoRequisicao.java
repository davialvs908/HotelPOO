package com.hotelpoo.api.dto;

import com.hotelpoo.dominio.pagamento.FormaPagamento;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record PagamentoRequisicao(
        @NotNull(message = "Valor e obrigatorio")
        @DecimalMin(value = "0.01", message = "O valor do pagamento deve ser maior que zero")
        BigDecimal valor,
        @NotNull(message = "Forma de pagamento e obrigatoria") FormaPagamento forma) {
}
