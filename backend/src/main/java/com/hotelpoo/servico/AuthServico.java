package com.hotelpoo.servico;

import com.hotelpoo.api.dto.LoginRequisicao;
import com.hotelpoo.api.dto.LoginResposta;
import com.hotelpoo.api.dto.MontadorRespostas;
import com.hotelpoo.api.dto.UsuarioAutenticadoResposta;
import com.hotelpoo.dominio.usuario.Usuario;
import com.hotelpoo.excecao.CredenciaisInvalidasException;
import com.hotelpoo.excecao.RecursoNaoEncontradoException;
import com.hotelpoo.repositorio.UsuarioRepositorio;
import com.hotelpoo.seguranca.JwtServico;
import com.hotelpoo.seguranca.UsuarioAutenticado;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServico {

    private final UsuarioRepositorio usuarioRepositorio;
    private final PasswordEncoder passwordEncoder;
    private final JwtServico jwtServico;

    public AuthServico(
            UsuarioRepositorio usuarioRepositorio,
            PasswordEncoder passwordEncoder,
            JwtServico jwtServico) {
        this.usuarioRepositorio = usuarioRepositorio;
        this.passwordEncoder = passwordEncoder;
        this.jwtServico = jwtServico;
    }

    @Transactional(readOnly = true)
    public LoginResposta autenticar(LoginRequisicao requisicao) {
        String login = requisicao.login() == null ? "" : requisicao.login().trim().toLowerCase();
        Usuario usuario = usuarioRepositorio.findByLogin(login)
                .orElseThrow(CredenciaisInvalidasException::new);
        if (!passwordEncoder.matches(requisicao.senha(), usuario.getSenhaHash())) {
            throw new CredenciaisInvalidasException();
        }
        String token = jwtServico.gerarToken(usuario.getLogin(), usuario.getPapel().name(), usuario.getNome());
        return new LoginResposta(token, usuario.getNome(), usuario.getPapel());
    }

    @Transactional(readOnly = true)
    public UsuarioAutenticadoResposta usuarioAtual(Authentication autenticacao) {
        Usuario usuario = extrairUsuario(autenticacao);
        return MontadorRespostas.autenticado(usuario);
    }

    public Usuario extrairUsuario(Authentication autenticacao) {
        if (autenticacao == null || !(autenticacao.getPrincipal() instanceof UsuarioAutenticado autenticado)) {
            throw new RecursoNaoEncontradoException("Sessao invalida. Faca login novamente.");
        }
        return autenticado.getUsuario();
    }
}
