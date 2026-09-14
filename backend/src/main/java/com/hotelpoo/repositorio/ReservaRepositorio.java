package com.hotelpoo.repositorio;

import com.hotelpoo.dominio.reserva.Reserva;
import com.hotelpoo.dominio.reserva.StatusReserva;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReservaRepositorio extends JpaRepository<Reserva, Long> {

    @Query("""
            SELECT DISTINCT r FROM Reserva r
            JOIN FETCH r.cliente
            JOIN FETCH r.quarto
            ORDER BY r.checkIn
            """)
    List<Reserva> listarComClienteEQuarto();

    @Query("""
            SELECT DISTINCT r FROM Reserva r
            JOIN FETCH r.cliente
            JOIN FETCH r.quarto
            WHERE r.status = :status
            ORDER BY r.checkIn
            """)
    List<Reserva> listarPorStatus(@Param("status") StatusReserva status);

    @Query("""
            SELECT r FROM Reserva r
            JOIN FETCH r.cliente
            JOIN FETCH r.quarto
            WHERE r.id = :id
            """)
    Optional<Reserva> buscarComClienteEQuarto(@Param("id") Long id);

    @Query("""
            SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END
            FROM Reserva r
            WHERE r.quarto.id = :quartoId
              AND r.status IN :statusBloqueantes
              AND (:reservaIgnoradaId IS NULL OR r.id <> :reservaIgnoradaId)
              AND r.checkIn < :checkOut
              AND r.checkOut > :checkIn
            """)
    boolean existeSobreposicao(
            @Param("quartoId") Long quartoId,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut,
            @Param("reservaIgnoradaId") Long reservaIgnoradaId,
            @Param("statusBloqueantes") List<StatusReserva> statusBloqueantes);

    boolean existsByClienteIdAndStatusIn(Long clienteId, List<StatusReserva> status);

    boolean existsByQuartoIdAndStatus(Long quartoId, StatusReserva status);

    long countByStatusIn(List<StatusReserva> status);

    @Query("""
            SELECT COUNT(r) FROM Reserva r
            WHERE r.checkIn = :checkIn AND r.status IN :status
            """)
    long countByCheckInAndStatusIn(@Param("checkIn") LocalDate checkIn, @Param("status") List<StatusReserva> status);

    @Query("""
            SELECT COUNT(r) FROM Reserva r
            WHERE r.checkOut = :checkOut AND r.status IN :status
            """)
    long countByCheckOutAndStatusIn(@Param("checkOut") LocalDate checkOut, @Param("status") List<StatusReserva> status);
}
