package com.hotelpoo.dominio.usuario;

import com.hotelpoo.excecao.RequisicaoInvalidaException;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String nome;

    @Column(nullable = false, unique = true, length = 60)
    private String login;

    @Column(nullable = false, length = 80)
    private String senhaHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PapelUsuario papel;

    protected Usuario() {
    }

    public Usuario(String nome, String login, String senhaHash, PapelUsuario papel) {
        aplicarCadastro(nome, login, papel);
        this.senhaHash = exigirHash(senhaHash);
    }

    public void atualizarCadastro(String nome, String login, PapelUsuario papel) {
        aplicarCadastro(nome, login, papel);
    }

    public void alterarSenhaHash(String novoHash) {
        this.senhaHash = exigirHash(novoHash);
    }

    private void aplicarCadastro(String nomeInformado, String loginInformado, PapelUsuario papelInformado) {
        this.nome = obrigatorio(nomeInformado, "Nome e obrigatorio.", "nome");
        this.login = obrigatorio(loginInformado, "Login e obrigatorio.", "login").toLowerCase();
        if (papelInformado == null) {
            throw new RequisicaoInvalidaException("Papel do usuario e obrigatorio.", "papel");
        }
        this.papel = papelInformado;
    }

    private String exigirHash(String hash) {
        if (hash == null || hash.isBlank()) {
            throw new RequisicaoInvalidaException("Senha e obrigatoria.", "senha");
        }
        return hash;
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

    public String getLogin() {
        return login;
    }

    public String getSenhaHash() {
        return senhaHash;
    }

    public PapelUsuario getPapel() {
        return papel;
    }
}
