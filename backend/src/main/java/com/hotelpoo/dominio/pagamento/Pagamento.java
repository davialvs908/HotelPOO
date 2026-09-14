package com.hotelpoo.dominio.pagamento;

import com.hotelpoo.dominio.reserva.Reserva;
import com.hotelpoo.excecao.RequisicaoInvalidaException;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;

@Entity
@Table(name = "pagamentos")
public class Pagamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "reserva_id")
    private Reserva reserva;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal valor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private FormaPagamento forma;

    @Column(nullable = false)
    private Instant instante;

    protected Pagamento() {
    }

    public Pagamento(Reserva reserva, BigDecimal valor, FormaPagamento forma, Instant instante) {
        if (forma == null) {
            throw new RequisicaoInvalidaException("Forma de pagamento e obrigatoria.", "forma");
        }
        if (valor == null || valor.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RequisicaoInvalidaException("O valor do pagamento deve ser maior que zero.", "valor");
        }
        this.reserva = reserva;
        this.valor = valor.setScale(2, RoundingMode.HALF_UP);
        this.forma = forma;
        this.instante = instante == null ? Instant.now() : instante;
    }

    public Long getId() {
        return id;
    }

    public Reserva getReserva() {
        return reserva;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public FormaPagamento getForma() {
        return forma;
    }

    public Instant getInstante() {
        return instante;
    }
}
