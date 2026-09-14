package com.hotelpoo.servico;

import com.hotelpoo.api.dto.MontadorRespostas;
import com.hotelpoo.api.dto.UsuarioRequisicao;
import com.hotelpoo.api.dto.UsuarioResposta;
import com.hotelpoo.dominio.usuario.Usuario;
import com.hotelpoo.excecao.ConflitoNegocioException;
import com.hotelpoo.excecao.RecursoNaoEncontradoException;
import com.hotelpoo.excecao.RequisicaoInvalidaException;
import com.hotelpoo.repositorio.UsuarioRepositorio;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class UsuarioServico {

    private final UsuarioRepositorio usuarioRepositorio;
    private final PasswordEncoder passwordEncoder;
    private final AuthServico authServico;

    public UsuarioServico(
            UsuarioRepositorio usuarioRepositorio,
            PasswordEncoder passwordEncoder,
            AuthServico authServico) {
        this.usuarioRepositorio = usuarioRepositorio;
        this.passwordEncoder = passwordEncoder;
        this.authServico = authServico;
    }

    @Transactional(readOnly = true)
    public List<UsuarioResposta> listar() {
        return usuarioRepositorio.findAll().stream()
                .map(MontadorRespostas::usuario)
                .toList();
    }

    @Transactional(readOnly = true)
    public UsuarioResposta buscarPorId(Long id) {
        return MontadorRespostas.usuario(carregar(id));
    }

    @Transactional
    public UsuarioResposta cadastrar(UsuarioRequisicao requisicao) {
        if (requisicao.senha() == null || requisicao.senha().isBlank()) {
            throw new RequisicaoInvalidaException("Senha e obrigatoria no cadastro.", "senha");
        }
        String login = requisicao.login().trim().toLowerCase();
        garantirLoginLivre(login, null);
        Usuario usuario = new Usuario(
                requisicao.nome(),
                login,
                passwordEncoder.encode(requisicao.senha()),
                requisicao.papel());
        return MontadorRespostas.usuario(usuarioRepositorio.save(usuario));
    }

    @Transactional
    public UsuarioResposta atualizar(Long id, UsuarioRequisicao requisicao) {
        Usuario usuario = carregar(id);
        String login = requisicao.login().trim().toLowerCase();
        garantirLoginLivre(login, id);
        usuario.atualizarCadastro(requisicao.nome(), login, requisicao.papel());
        if (requisicao.senha() != null && !requisicao.senha().isBlank()) {
            usuario.alterarSenhaHash(passwordEncoder.encode(requisicao.senha()));
        }
        return MontadorRespostas.usuario(usuario);
    }

    @Transactional
    public void remover(Long id, Authentication autenticacao) {
        Usuario alvo = carregar(id);
        Usuario autenticado = authServico.extrairUsuario(autenticacao);
        if (alvo.getId().equals(autenticado.getId())) {
            throw new ConflitoNegocioException("Nao e possivel excluir o proprio usuario logado.");
        }
        usuarioRepositorio.delete(alvo);
    }

    private void garantirLoginLivre(String login, Long idAtual) {
        boolean duplicado = idAtual == null
                ? usuarioRepositorio.existsByLogin(login)
                : usuarioRepositorio.existsByLoginAndIdNot(login, idAtual);
        if (duplicado) {
            throw new ConflitoNegocioException("Ja existe usuario com este login.", "login");
        }
    }

    private Usuario carregar(Long id) {
        return usuarioRepositorio.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuario nao encontrado."));
    }
}
