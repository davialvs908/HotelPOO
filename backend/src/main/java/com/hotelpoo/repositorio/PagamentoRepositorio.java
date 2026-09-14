package com.hotelpoo.repositorio;

import com.hotelpoo.dominio.pagamento.Pagamento;
import java.math.BigDecimal;
import java.time.Instant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PagamentoRepositorio extends JpaRepository<Pagamento, Long> {

    @Query("""
            SELECT COALESCE(SUM(p.valor), 0)
            FROM Pagamento p
            WHERE p.instante >= :inicio AND p.instante < :fim
            """)
    BigDecimal somarNoPeriodo(@Param("inicio") Instant inicio, @Param("fim") Instant fim);
}
