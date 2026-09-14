package com.hotelpoo.dominio.reserva;

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
@Table(name = "hospedes_reserva")
public class HospedeReserva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "reserva_id")
    private Reserva reserva;

    @Column(nullable = false, length = 120)
    private String nome;

    @Column(length = 40)
    private String documento;

    protected HospedeReserva() {
    }

    public HospedeReserva(Reserva reserva, String nome, String documento) {
        this.reserva = reserva;
        this.nome = validarNome(nome);
        this.documento = documento == null || documento.isBlank() ? null : documento.trim();
    }

    private String validarNome(String nomeInformado) {
        if (nomeInformado == null || nomeInformado.isBlank()) {
            throw new RequisicaoInvalidaException("Nome do acompanhante e obrigatorio.", "nome");
        }
        return nomeInformado.trim();
    }

    public Long getId() {
        return id;
    }

    public Reserva getReserva() {
        return reserva;
    }

    public String getNome() {
        return nome;
    }

    public String getDocumento() {
        return documento;
    }
}
