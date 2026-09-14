package com.hotelpoo.dominio.quarto;

import com.hotelpoo.excecao.RequisicaoInvalidaException;
import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorColumn;
import jakarta.persistence.DiscriminatorType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Entity
@Table(name = "quartos")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "dtype", discriminatorType = DiscriminatorType.STRING)
public abstract class Quarto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String numero;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal precoBasePorNoite;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusQuarto status = StatusQuarto.LIVRE;

    protected Quarto() {
    }

    protected Quarto(String numero, BigDecimal precoBasePorNoite) {
        this.numero = validarNumero(numero);
        this.precoBasePorNoite = validarPreco(precoBasePorNoite);
        this.status = StatusQuarto.LIVRE;
    }

    public abstract BigDecimal calcularPreco(int noites);

    public abstract TipoQuarto getTipo();

    public void atualizarCadastro(String novoNumero, BigDecimal novoPrecoBase) {
        this.numero = validarNumero(novoNumero);
        this.precoBasePorNoite = validarPreco(novoPrecoBase);
    }

    public void ocupar() {
        this.status = StatusQuarto.OCUPADO;
    }

    public void marcarComoSujo() {
        this.status = StatusQuarto.SUJO;
    }

    public void aplicarStatusGovernanca(StatusQuarto novoStatus) {
        if (novoStatus == null) {
            throw new RequisicaoInvalidaException("Status do quarto e obrigatorio.", "status");
        }
        if (novoStatus == StatusQuarto.OCUPADO) {
            throw new RequisicaoInvalidaException("Ocupacao do quarto ocorre somente via check-in.", "status");
        }
        this.status = novoStatus;
    }

    public boolean emManutencao() {
        return status == StatusQuarto.MANUTENCAO;
    }

    protected BigDecimal arredondar(BigDecimal valor) {
        return valor.setScale(2, RoundingMode.HALF_UP);
    }

    private String validarNumero(String numeroInformado) {
        if (numeroInformado == null || numeroInformado.isBlank()) {
            throw new RequisicaoInvalidaException("Numero do quarto e obrigatorio.", "numero");
        }
        return numeroInformado.trim();
    }

    private BigDecimal validarPreco(BigDecimal preco) {
        if (preco == null || preco.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RequisicaoInvalidaException("Preco base por noite deve ser maior que zero.", "precoBasePorNoite");
        }
        return preco.setScale(2, RoundingMode.HALF_UP);
    }

    public Long getId() {
        return id;
    }

    public String getNumero() {
        return numero;
    }

    public BigDecimal getPrecoBasePorNoite() {
        return precoBasePorNoite;
    }

    public StatusQuarto getStatus() {
        return status;
    }
}
