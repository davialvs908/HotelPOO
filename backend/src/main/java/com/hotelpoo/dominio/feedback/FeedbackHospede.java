package com.hotelpoo.dominio.feedback;

import com.hotelpoo.dominio.cliente.Cliente;
import com.hotelpoo.dominio.reserva.Reserva;
import com.hotelpoo.excecao.RequisicaoInvalidaException;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "feedbacks")
public class FeedbackHospede {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 2000)
    private String texto;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reserva_id")
    private Reserva reserva;

    protected FeedbackHospede() {
    }

    public FeedbackHospede(String texto, Cliente cliente, Reserva reserva) {
        this.texto = validarTexto(texto);
        if (cliente == null) {
            throw new RequisicaoInvalidaException("Cliente do feedback e obrigatorio.", "clienteId");
        }
        this.cliente = cliente;
        this.reserva = reserva;
    }

    public void atualizar(String texto, Cliente cliente, Reserva reserva) {
        this.texto = validarTexto(texto);
        if (cliente == null) {
            throw new RequisicaoInvalidaException("Cliente do feedback e obrigatorio.", "clienteId");
        }
        this.cliente = cliente;
        this.reserva = reserva;
    }

    private String validarTexto(String textoInformado) {
        if (textoInformado == null || textoInformado.isBlank()) {
            throw new RequisicaoInvalidaException("Texto do feedback e obrigatorio.", "texto");
        }
        return textoInformado.trim();
    }

    public Long getId() {
        return id;
    }

    public String getTexto() {
        return texto;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public Reserva getReserva() {
        return reserva;
    }
}
