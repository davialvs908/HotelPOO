package com.hotelpoo.dominio;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.hotelpoo.dominio.cliente.Cliente;
import com.hotelpoo.dominio.quarto.QuartoSimples;
import com.hotelpoo.dominio.quarto.StatusQuarto;
import com.hotelpoo.dominio.reserva.Reserva;
import com.hotelpoo.dominio.reserva.StatusReserva;
import com.hotelpoo.excecao.ConflitoNegocioException;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;

class ReservaFolioCheckOutTest {

    @Test
    void checkOutComSaldoLancaConflitoEMantemHospede() {
        Cliente cliente = new Cliente("Maria Santos", "52998224725", "11988887771", "maria@email.com");
        QuartoSimples quarto = new QuartoSimples("101", new BigDecimal("100.00"));
        LocalDate checkIn = LocalDate.of(2026, 9, 14);
        Reserva reserva = Reserva.criar(cliente, quarto, checkIn, checkIn.plusDays(2));
        reserva.realizarCheckIn(checkIn);

        ConflitoNegocioException conflito = assertThrows(
                ConflitoNegocioException.class,
                () -> reserva.realizarCheckOut(new BigDecimal("200.00")));

        assertTrueMensagemFolio(conflito.getMessage());
        assertEquals(StatusReserva.CHECKED_IN, reserva.getStatus());
        assertEquals(StatusQuarto.OCUPADO, quarto.getStatus());
    }

    @Test
    void checkOutComFolioQuitadoLiberaQuartoComoSujo() {
        Cliente cliente = new Cliente("Maria Santos", "52998224725", "11988887771", "maria@email.com");
        QuartoSimples quarto = new QuartoSimples("101", new BigDecimal("100.00"));
        LocalDate checkIn = LocalDate.of(2026, 9, 14);
        Reserva reserva = Reserva.criar(cliente, quarto, checkIn, checkIn.plusDays(2));
        reserva.realizarCheckIn(checkIn);

        reserva.realizarCheckOut(BigDecimal.ZERO);

        assertEquals(StatusReserva.CHECKED_OUT, reserva.getStatus());
        assertEquals(StatusQuarto.SUJO, quarto.getStatus());
    }

    private void assertTrueMensagemFolio(String mensagem) {
        if (!mensagem.toLowerCase().contains("folio") && !mensagem.toLowerCase().contains("saldo")) {
            throw new AssertionError("Mensagem deveria explicar o folio em aberto: " + mensagem);
        }
    }
}
