package com.hotelpoo.dominio.reserva;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import com.hotelpoo.excecao.RequisicaoInvalidaException;

public final class CalendarioHospedagem {

    private CalendarioHospedagem() {
    }

    public static int contarNoites(LocalDate checkIn, LocalDate checkOut) {
        validarIntervalo(checkIn, checkOut);
        return (int) ChronoUnit.DAYS.between(checkIn, checkOut);
    }

    public static void validarIntervalo(LocalDate checkIn, LocalDate checkOut) {
        if (checkIn == null) {
            throw new RequisicaoInvalidaException("Data de check-in e obrigatoria.", "checkIn");
        }
        if (checkOut == null) {
            throw new RequisicaoInvalidaException("Data de check-out e obrigatoria.", "checkOut");
        }
        if (!checkOut.isAfter(checkIn)) {
            throw new RequisicaoInvalidaException("A data de check-out deve ser posterior ao check-in.", "checkOut");
        }
    }

    /**
     * Check-in no mesmo dia do check-out anterior e permitido porque a saida e as 10h
     * e a entrada as 14h; por isso a comparacao e estrita nas pontas do intervalo.
     */
    public static boolean periodosSeSobrepoem(
            LocalDate existenteCheckIn,
            LocalDate existenteCheckOut,
            LocalDate novoCheckIn,
            LocalDate novoCheckOut) {
        return existenteCheckIn.isBefore(novoCheckOut) && existenteCheckOut.isAfter(novoCheckIn);
    }
}
