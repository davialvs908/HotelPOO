package com.hotelpoo.api;

import com.hotelpoo.api.dto.LoginRequisicao;
import com.hotelpoo.api.dto.LoginResposta;
import com.hotelpoo.api.dto.UsuarioAutenticadoResposta;
import com.hotelpoo.servico.AuthServico;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthServico authServico;

    public AuthController(AuthServico authServico) {
        this.authServico = authServico;
    }

    @PostMapping("/login")
    public LoginResposta login(@Valid @RequestBody LoginRequisicao requisicao) {
        return authServico.autenticar(requisicao);
    }

    @GetMapping("/me")
    public UsuarioAutenticadoResposta me(Authentication autenticacao) {
        return authServico.usuarioAtual(autenticacao);
    }
}
