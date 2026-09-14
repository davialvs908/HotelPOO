package com.hotelpoo.dominio;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.hotelpoo.dominio.reserva.CalendarioHospedagem;
import com.hotelpoo.excecao.RequisicaoInvalidaException;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;

class CalendarioHospedagemTest {

    @Test
    void permiteCheckInNoMesmoDiaDoCheckOutAnterior() {
        LocalDate existenteCheckIn = LocalDate.of(2026, 10, 1);
        LocalDate existenteCheckOut = LocalDate.of(2026, 10, 5);
        LocalDate novoCheckIn = LocalDate.of(2026, 10, 5);
        LocalDate novoCheckOut = LocalDate.of(2026, 10, 8);

        assertFalse(CalendarioHospedagem.periodosSeSobrepoem(
                existenteCheckIn, existenteCheckOut, novoCheckIn, novoCheckOut));
    }

    @Test
    void rejeitaSobreposicaoRealDeEstadia() {
        LocalDate existenteCheckIn = LocalDate.of(2026, 10, 1);
        LocalDate existenteCheckOut = LocalDate.of(2026, 10, 5);
        LocalDate novoCheckIn = LocalDate.of(2026, 10, 3);
        LocalDate novoCheckOut = LocalDate.of(2026, 10, 8);

        assertTrue(CalendarioHospedagem.periodosSeSobrepoem(
                existenteCheckIn, existenteCheckOut, novoCheckIn, novoCheckOut));
    }

    @Test
    void recusaIntervaloInvertidoOuIgual() {
        LocalDate checkIn = LocalDate.of(2026, 10, 10);
        LocalDate checkOutAnterior = LocalDate.of(2026, 10, 9);
        assertThrows(RequisicaoInvalidaException.class,
                () -> CalendarioHospedagem.validarIntervalo(checkIn, checkOutAnterior));
        assertThrows(RequisicaoInvalidaException.class,
                () -> CalendarioHospedagem.validarIntervalo(checkIn, checkIn));
        assertThrows(RequisicaoInvalidaException.class,
                () -> CalendarioHospedagem.validarIntervalo(null, checkIn));
    }
}
