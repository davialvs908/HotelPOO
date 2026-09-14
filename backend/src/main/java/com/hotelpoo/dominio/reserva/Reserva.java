package com.hotelpoo.dominio.reserva;

import com.hotelpoo.dominio.cliente.Cliente;
import com.hotelpoo.dominio.pagamento.FolioHospedagem;
import com.hotelpoo.dominio.pagamento.FormaPagamento;
import com.hotelpoo.dominio.pagamento.Pagamento;
import com.hotelpoo.dominio.quarto.Quarto;
import com.hotelpoo.excecao.ConflitoNegocioException;
import com.hotelpoo.excecao.RequisicaoInvalidaException;
import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Entity
@Table(name = "reservas")
public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "quarto_id")
    private Quarto quarto;

    @Column(nullable = false)
    private LocalDate checkIn;

    @Column(nullable = false)
    private LocalDate checkOut;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal valorTotal;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusReserva status;

    @OneToMany(mappedBy = "reserva", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<HospedeReserva> hospedes = new ArrayList<>();

    @OneToMany(mappedBy = "reserva", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Pagamento> pagamentos = new ArrayList<>();

    protected Reserva() {
    }

    public static Reserva criar(Cliente cliente, Quarto quarto, LocalDate checkIn, LocalDate checkOut) {
        if (cliente == null) {
            throw new RequisicaoInvalidaException("Cliente da reserva e obrigatorio.", "clienteId");
        }
        if (quarto == null) {
            throw new RequisicaoInvalidaException("Quarto da reserva e obrigatorio.", "quartoId");
        }
        Reserva reserva = new Reserva();
        reserva.cliente = cliente;
        reserva.quarto = quarto;
        reserva.checkIn = checkIn;
        reserva.checkOut = checkOut;
        reserva.status = StatusReserva.RESERVADA;
        reserva.recalcularValor();
        return reserva;
    }

    public void cancelar() {
        if (status != StatusReserva.RESERVADA) {
            throw new ConflitoNegocioException("Somente reservas com status RESERVADA podem ser canceladas.");
        }
        this.status = StatusReserva.CANCELADA;
    }

    /**
     * Troca o quarto na propria reserva e recalcula o valor, sem criar outro ID
     * e sem usar reflection: quarto e valorTotal nao sao finais.
     */
    public void transferirPara(Quarto novoQuarto) {
        garantirReservaAtiva("Somente reservas ativas podem ser transferidas.");
        if (novoQuarto == null) {
            throw new RequisicaoInvalidaException("Novo quarto e obrigatorio.", "novoQuartoId");
        }
        if (mesmoQuarto(novoQuarto)) {
            throw new RequisicaoInvalidaException("O novo quarto deve ser diferente do atual.", "novoQuartoId");
        }
        Quarto quartoAnterior = this.quarto;
        this.quarto = novoQuarto;
        recalcularValor();
        if (status == StatusReserva.CHECKED_IN) {
            quartoAnterior.marcarComoSujo();
            novoQuarto.ocupar();
        }
    }

    public void renovarAte(LocalDate novaDataCheckOut) {
        garantirReservaAtiva("Somente reservas ativas podem ser renovadas.");
        if (novaDataCheckOut == null) {
            throw new RequisicaoInvalidaException("Nova data de check-out e obrigatoria.", "novaDataCheckOut");
        }
        if (!novaDataCheckOut.isAfter(this.checkOut)) {
            throw new RequisicaoInvalidaException(
                    "A renovacao deve estender o check-out para uma data posterior a atual.",
                    "novaDataCheckOut");
        }
        this.checkOut = novaDataCheckOut;
        recalcularValor();
    }

    /**
     * Check-in antecipado ocuparia o quarto sem o hospede ter direito a entrada;
     * a hospedagem so comeca no dia combinado (nao antes).
     */
    public void realizarCheckIn(LocalDate hoje) {
        if (status != StatusReserva.RESERVADA) {
            throw new ConflitoNegocioException("Check-in permitido somente para reservas com status RESERVADA.");
        }
        if (hoje.isBefore(checkIn)) {
            throw new ConflitoNegocioException("Check-in so e permitido a partir da data combinada de entrada.");
        }
        if (!hoje.isBefore(checkOut)) {
            throw new ConflitoNegocioException("Nao e possivel fazer check-in apos o periodo da reserva.");
        }
        this.status = StatusReserva.CHECKED_IN;
        this.quarto.ocupar();
    }

    public void realizarCheckOut(BigDecimal saldoDevedor) {
        if (status != StatusReserva.CHECKED_IN) {
            throw new ConflitoNegocioException("Check-out permitido somente para hospedes com check-in realizado.");
        }
        if (saldoDevedor.compareTo(BigDecimal.ZERO) > 0) {
            throw new ConflitoNegocioException(
                    "Check-out bloqueado: o folio ainda possui saldo a pagar de R$ "
                            + saldoDevedor.setScale(2, RoundingMode.HALF_UP) + ".");
        }
        this.status = StatusReserva.CHECKED_OUT;
        this.quarto.marcarComoSujo();
    }

    public Pagamento registrarPagamento(BigDecimal valor, FormaPagamento forma) {
        garantirReservaAtiva("Nao e possivel registrar pagamento nesta reserva.");
        FolioHospedagem folio = calcularFolio();
        if (valor != null && valor.compareTo(folio.saldo()) > 0) {
            throw new ConflitoNegocioException("Pagamento excede o saldo do folio.", "valor");
        }
        Pagamento pagamento = new Pagamento(this, valor, forma, Instant.now());
        this.pagamentos.add(pagamento);
        return pagamento;
    }

    public HospedeReserva adicionarHospede(String nome, String documento) {
        garantirReservaAtiva("Nao e possivel incluir acompanhantes nesta reserva.");
        HospedeReserva hospede = new HospedeReserva(this, nome, documento);
        this.hospedes.add(hospede);
        return hospede;
    }

    public FolioHospedagem calcularFolio() {
        BigDecimal totalPago = pagamentos.stream()
                .map(Pagamento::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return FolioHospedagem.de(valorTotal, totalPago);
    }

    public boolean estaAtiva() {
        return status == StatusReserva.RESERVADA || status == StatusReserva.CHECKED_IN;
    }

    private void recalcularValor() {
        int noites = CalendarioHospedagem.contarNoites(checkIn, checkOut);
        this.valorTotal = quarto.calcularPreco(noites);
    }

    private void garantirReservaAtiva(String mensagem) {
        if (!estaAtiva()) {
            throw new ConflitoNegocioException(mensagem);
        }
    }

    private boolean mesmoQuarto(Quarto outro) {
        if (this.quarto.getId() != null && outro.getId() != null) {
            return this.quarto.getId().equals(outro.getId());
        }
        return this.quarto.getNumero().equals(outro.getNumero());
    }

    public Long getId() {
        return id;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public Quarto getQuarto() {
        return quarto;
    }

    public LocalDate getCheckIn() {
        return checkIn;
    }

    public LocalDate getCheckOut() {
        return checkOut;
    }

    public BigDecimal getValorTotal() {
        return valorTotal;
    }

    public StatusReserva getStatus() {
        return status;
    }

    public List<HospedeReserva> getHospedes() {
        return Collections.unmodifiableList(hospedes);
    }

    public List<Pagamento> getPagamentos() {
        return Collections.unmodifiableList(pagamentos);
    }
}
