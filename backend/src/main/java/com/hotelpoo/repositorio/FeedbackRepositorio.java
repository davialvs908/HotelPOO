package com.hotelpoo.repositorio;

import com.hotelpoo.dominio.feedback.FeedbackHospede;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FeedbackRepositorio extends JpaRepository<FeedbackHospede, Long> {

    @Query("""
            SELECT f FROM FeedbackHospede f
            JOIN FETCH f.cliente
            LEFT JOIN FETCH f.reserva
            ORDER BY f.id DESC
            """)
    List<FeedbackHospede> listarComClienteEReserva();

    @Query("""
            SELECT f FROM FeedbackHospede f
            JOIN FETCH f.cliente
            LEFT JOIN FETCH f.reserva
            WHERE f.id = :id
            """)
    Optional<FeedbackHospede> buscarComClienteEReserva(@Param("id") Long id);
}
