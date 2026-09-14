package com.hotelpoo.seguranca;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class JwtServico {

    private final SecretKey chave;
    private final long expiracaoHoras;

    public JwtServico(
            @Value("${app.jwt.secret}") String segredo,
            @Value("${app.jwt.expiration-hours}") long expiracaoHoras) {
        this.chave = Keys.hmacShaKeyFor(segredo.getBytes(StandardCharsets.UTF_8));
        this.expiracaoHoras = expiracaoHoras;
    }

    public String gerarToken(String login, String papel, String nome) {
        Instant agora = Instant.now();
        Instant expiracao = agora.plus(expiracaoHoras, ChronoUnit.HOURS);
        return Jwts.builder()
                .subject(login)
                .claim("papel", papel)
                .claim("nome", nome)
                .issuedAt(Date.from(agora))
                .expiration(Date.from(expiracao))
                .signWith(chave)
                .compact();
    }

    public String extrairLogin(String token) {
        return parsear(token).getSubject();
    }

    public boolean tokenValido(String token, UserDetails usuario) {
        try {
            Claims claims = parsear(token);
            return usuario.getUsername().equals(claims.getSubject())
                    && claims.getExpiration().after(new Date());
        } catch (JwtException | IllegalArgumentException excecao) {
            return false;
        }
    }

    private Claims parsear(String token) {
        return Jwts.parser()
                .verifyWith(chave)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
