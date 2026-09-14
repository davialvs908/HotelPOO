package com.hotelpoo.repositorio;

import com.hotelpoo.dominio.cliente.Cliente;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ClienteRepositorio extends JpaRepository<Cliente, Long> {

    boolean existsByDocumento(String documento);

    boolean existsByDocumentoAndIdNot(String documento, Long id);

    Optional<Cliente> findByDocumento(String documento);

    @Query("""
            SELECT c FROM Cliente c
            WHERE LOWER(c.nome) LIKE LOWER(CONCAT('%', :busca, '%'))
               OR c.documento LIKE CONCAT('%', :busca, '%')
               OR LOWER(c.email) LIKE LOWER(CONCAT('%', :busca, '%'))
            ORDER BY c.nome
            """)
    List<Cliente> buscarPorNomeDocumentoOuEmail(@Param("busca") String busca);
}
