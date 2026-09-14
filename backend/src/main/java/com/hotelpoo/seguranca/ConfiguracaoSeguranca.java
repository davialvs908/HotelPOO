package com.hotelpoo.seguranca;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotelpoo.excecao.MensagemErro;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableMethodSecurity
public class ConfiguracaoSeguranca {

    private final JwtFiltroAutenticacao jwtFiltroAutenticacao;
    private final ObjectMapper objectMapper;

    public ConfiguracaoSeguranca(JwtFiltroAutenticacao jwtFiltroAutenticacao, ObjectMapper objectMapper) {
        this.jwtFiltroAutenticacao = jwtFiltroAutenticacao;
        this.objectMapper = objectMapper;
    }

    @Bean
    public SecurityFilterChain cadeiaFiltros(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(fonteCors()))
                .sessionManagement(sessao -> sessao.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(excecoes -> excecoes
                        .authenticationEntryPoint((requisicao, resposta, excecao) ->
                                escreverErro(resposta, HttpServletResponse.SC_UNAUTHORIZED, "Nao autenticado. Faca login."))
                        .accessDeniedHandler((requisicao, resposta, excecao) ->
                                escreverErro(resposta, HttpServletResponse.SC_FORBIDDEN, "Acesso negado para este recurso.")))
                .authorizeHttpRequests(autorizacao -> autorizacao
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                        .requestMatchers("/api/usuarios/**").hasRole("GERENTE")
                        .requestMatchers(HttpMethod.POST, "/api/quartos").hasRole("GERENTE")
                        .requestMatchers(HttpMethod.PUT, "/api/quartos/**").hasRole("GERENTE")
                        .requestMatchers(HttpMethod.PATCH, "/api/quartos/*/status").hasAnyRole("GERENTE", "CAMAREIRA")
                        .requestMatchers(HttpMethod.GET, "/api/quartos/disponiveis").hasAnyRole("GERENTE", "RECEPCIONISTA")
                        .requestMatchers(HttpMethod.GET, "/api/quartos", "/api/quartos/*").hasAnyRole("GERENTE", "RECEPCIONISTA", "CAMAREIRA")
                        .requestMatchers("/api/auth/me").authenticated()
                        .requestMatchers("/api/**").hasAnyRole("GERENTE", "RECEPCIONISTA")
                        .anyRequest().authenticated())
                .addFilterBefore(jwtFiltroAutenticacao, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource fonteCors() {
        CorsConfiguration configuracao = new CorsConfiguration();
        configuracao.setAllowedOrigins(List.of("http://localhost:5173"));
        configuracao.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuracao.setAllowedHeaders(List.of("*"));
        configuracao.setExposedHeaders(List.of("Authorization"));
        configuracao.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource origem = new UrlBasedCorsConfigurationSource();
        origem.registerCorsConfiguration("/**", configuracao);
        return origem;
    }

    private void escreverErro(HttpServletResponse resposta, int status, String mensagem) throws IOException {
        resposta.setStatus(status);
        resposta.setCharacterEncoding(StandardCharsets.UTF_8.name());
        resposta.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(resposta.getWriter(), new MensagemErro(mensagem));
    }
}
