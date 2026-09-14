package com.hotelpoo.config;

import com.hotelpoo.dominio.cliente.Cliente;
import com.hotelpoo.dominio.feedback.FeedbackHospede;
import com.hotelpoo.dominio.quarto.Quarto;
import com.hotelpoo.dominio.quarto.QuartoLuxo;
import com.hotelpoo.dominio.quarto.QuartoSimples;
import com.hotelpoo.dominio.quarto.Suite;
import com.hotelpoo.dominio.reserva.Reserva;
import com.hotelpoo.dominio.usuario.PapelUsuario;
import com.hotelpoo.dominio.usuario.Usuario;
import com.hotelpoo.repositorio.ClienteRepositorio;
import com.hotelpoo.repositorio.FeedbackRepositorio;
import com.hotelpoo.repositorio.QuartoRepositorio;
import com.hotelpoo.repositorio.ReservaRepositorio;
import com.hotelpoo.repositorio.UsuarioRepositorio;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class InicializadorDados implements ApplicationRunner {

    private static final ZoneId FUSO_HOTEL = ZoneId.of("America/Sao_Paulo");

    private final UsuarioRepositorio usuarioRepositorio;
    private final QuartoRepositorio quartoRepositorio;
    private final ClienteRepositorio clienteRepositorio;
    private final ReservaRepositorio reservaRepositorio;
    private final FeedbackRepositorio feedbackRepositorio;
    private final PasswordEncoder passwordEncoder;

    public InicializadorDados(
            UsuarioRepositorio usuarioRepositorio,
            QuartoRepositorio quartoRepositorio,
            ClienteRepositorio clienteRepositorio,
            ReservaRepositorio reservaRepositorio,
            FeedbackRepositorio feedbackRepositorio,
            PasswordEncoder passwordEncoder) {
        this.usuarioRepositorio = usuarioRepositorio;
        this.quartoRepositorio = quartoRepositorio;
        this.clienteRepositorio = clienteRepositorio;
        this.reservaRepositorio = reservaRepositorio;
        this.feedbackRepositorio = feedbackRepositorio;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments argumentos) {
        if (usuarioRepositorio.count() == 0) {
            usuarioRepositorio.save(new Usuario("Administrador", "admin", passwordEncoder.encode("admin123"), PapelUsuario.GERENTE));
            usuarioRepositorio.save(new Usuario("Recepcionista", "recepcao", passwordEncoder.encode("recepcao123"), PapelUsuario.RECEPCIONISTA));
            usuarioRepositorio.save(new Usuario("Camareira", "camareira", passwordEncoder.encode("camareira123"), PapelUsuario.CAMAREIRA));
        }

        if (quartoRepositorio.count() == 0) {
            quartoRepositorio.save(new QuartoSimples("101", new BigDecimal("100.00")));
            quartoRepositorio.save(new QuartoSimples("102", new BigDecimal("100.00")));
            quartoRepositorio.save(new QuartoLuxo("201", new BigDecimal("150.00")));
            quartoRepositorio.save(new QuartoLuxo("202", new BigDecimal("150.00")));
            quartoRepositorio.save(new Suite("301", new BigDecimal("200.00")));
            quartoRepositorio.save(new Suite("302", new BigDecimal("200.00")));
        }

        if (clienteRepositorio.count() == 0) {
            Cliente maria = clienteRepositorio.save(new Cliente("Maria Santos", "52998224725", "11988887771", "maria.santos@email.com"));
            Cliente joao = clienteRepositorio.save(new Cliente("Joao Pereira", "12345678901", "11988887772", "joao.pereira@email.com"));
            clienteRepositorio.save(new Cliente("Ana Costa", "98765432100", "11988887773", "ana.costa@email.com"));

            if (reservaRepositorio.count() == 0) {
                LocalDate hoje = LocalDate.now(FUSO_HOTEL);
                Quarto quarto101 = quartoRepositorio.findByNumero("101").orElseThrow();
                Quarto quarto201 = quartoRepositorio.findByNumero("201").orElseThrow();

                Reserva hospedada = Reserva.criar(maria, quarto101, hoje.minusDays(1), hoje.plusDays(2));
                hospedada.adicionarHospede("Pedro Santos", "11122233344");
                hospedada = reservaRepositorio.save(hospedada);
                hospedada.realizarCheckIn(hoje);

                Reserva futura = Reserva.criar(joao, quarto201, hoje.plusDays(7), hoje.plusDays(10));
                futura.adicionarHospede("Carla Pereira", null);
                reservaRepositorio.save(futura);

                feedbackRepositorio.save(new FeedbackHospede(
                        "O chuveiro nao esquenta, mas a cama e firme e o cafe veio quente.",
                        maria,
                        hospedada));
            }
        }
    }
}
