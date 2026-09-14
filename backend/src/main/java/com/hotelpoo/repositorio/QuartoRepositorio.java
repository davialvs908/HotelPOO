package com.hotelpoo.repositorio;

import com.hotelpoo.dominio.quarto.Quarto;
import com.hotelpoo.dominio.quarto.StatusQuarto;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuartoRepositorio extends JpaRepository<Quarto, Long> {

    boolean existsByNumero(String numero);

    boolean existsByNumeroAndIdNot(String numero, Long id);

    Optional<Quarto> findByNumero(String numero);

    long countByStatus(StatusQuarto status);

    List<Quarto> findAllByOrderByNumeroAsc();
}
