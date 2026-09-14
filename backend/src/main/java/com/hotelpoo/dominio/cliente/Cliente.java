package com.hotelpoo.dominio.cliente;

import com.hotelpoo.excecao.RequisicaoInvalidaException;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.regex.Pattern;

@Entity
@Table(name = "clientes")
public class Cliente {

    private static final Pattern EMAIL_REALISTA = Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String nome;

    @Column(nullable = false, unique = true, length = 11)
    private String documento;

    @Column(nullable = false, length = 30)
    private String telefone;

    @Column(nullable = false, length = 120)
    private String email;

    protected Cliente() {
    }

    public Cliente(String nome, String documento, String telefone, String email) {
        aplicarDados(nome, documento, telefone, email);
    }

    public void atualizar(String nome, String documento, String telefone, String email) {
        aplicarDados(nome, documento, telefone, email);
    }

    private void aplicarDados(String nomeInformado, String documentoInformado, String telefoneInformado, String emailInformado) {
        this.nome = obrigatorio(nomeInformado, "Nome e obrigatorio.", "nome");
        this.documento = DocumentoCpf.normalizar(documentoInformado);
        this.telefone = obrigatorio(telefoneInformado, "Telefone e obrigatorio.", "telefone");
        this.email = validarEmail(emailInformado);
    }

    private String validarEmail(String emailInformado) {
        String emailLimpo = obrigatorio(emailInformado, "Email e obrigatorio.", "email");
        if (!EMAIL_REALISTA.matcher(emailLimpo).matches()) {
            throw new RequisicaoInvalidaException("Email deve ser valido e conter @ com dominio.", "email");
        }
        return emailLimpo.toLowerCase();
    }

    private String obrigatorio(String valor, String mensagem, String campo) {
        if (valor == null || valor.isBlank()) {
            throw new RequisicaoInvalidaException(mensagem, campo);
        }
        return valor.trim();
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getDocumento() {
        return documento;
    }

    public String getTelefone() {
        return telefone;
    }

    public String getEmail() {
        return email;
    }
}
