package com.hotelpoo.seguranca;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtFiltroAutenticacao extends OncePerRequestFilter {

    private final JwtServico jwtServico;
    private final UsuarioDetalhesServico usuarioDetalhesServico;

    public JwtFiltroAutenticacao(JwtServico jwtServico, UsuarioDetalhesServico usuarioDetalhesServico) {
        this.jwtServico = jwtServico;
        this.usuarioDetalhesServico = usuarioDetalhesServico;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest requisicao,
            HttpServletResponse resposta,
            FilterChain cadeia) throws ServletException, IOException {
        String cabecalho = requisicao.getHeader(HttpHeaders.AUTHORIZATION);
        if (cabecalho != null && cabecalho.startsWith("Bearer ")) {
            String token = cabecalho.substring(7);
            try {
                String login = jwtServico.extrairLogin(token);
                if (login != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UserDetails usuario = usuarioDetalhesServico.loadUserByUsername(login);
                    if (jwtServico.tokenValido(token, usuario)) {
                        UsernamePasswordAuthenticationToken autenticacao =
                                new UsernamePasswordAuthenticationToken(usuario, null, usuario.getAuthorities());
                        autenticacao.setDetails(new WebAuthenticationDetailsSource().buildDetails(requisicao));
                        SecurityContextHolder.getContext().setAuthentication(autenticacao);
                    }
                }
            } catch (JwtException | IllegalArgumentException | UsernameNotFoundException excecao) {
                SecurityContextHolder.clearContext();
            }
        }
        cadeia.doFilter(requisicao, resposta);
    }
}
