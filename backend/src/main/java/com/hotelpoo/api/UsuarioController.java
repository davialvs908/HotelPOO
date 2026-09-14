package com.hotelpoo.api;

import com.hotelpoo.api.dto.UsuarioRequisicao;
import com.hotelpoo.api.dto.UsuarioResposta;
import com.hotelpoo.servico.UsuarioServico;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/usuarios")
@PreAuthorize("hasRole('GERENTE')")
public class UsuarioController {

    private final UsuarioServico usuarioServico;

    public UsuarioController(UsuarioServico usuarioServico) {
        this.usuarioServico = usuarioServico;
    }

    @GetMapping
    public List<UsuarioResposta> listar() {
        return usuarioServico.listar();
    }

    @GetMapping("/{id}")
    public UsuarioResposta buscar(@PathVariable Long id) {
        return usuarioServico.buscarPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UsuarioResposta cadastrar(@Valid @RequestBody UsuarioRequisicao requisicao) {
        return usuarioServico.cadastrar(requisicao);
    }

    @PutMapping("/{id}")
    public UsuarioResposta atualizar(@PathVariable Long id, @Valid @RequestBody UsuarioRequisicao requisicao) {
        return usuarioServico.atualizar(id, requisicao);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remover(@PathVariable Long id, Authentication autenticacao) {
        usuarioServico.remover(id, autenticacao);
    }
}
