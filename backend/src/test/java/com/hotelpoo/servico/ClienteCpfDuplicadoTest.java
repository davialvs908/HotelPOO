package com.hotelpoo.servico;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.hotelpoo.api.dto.ClienteRequisicao;
import com.hotelpoo.excecao.ConflitoNegocioException;
import com.hotelpoo.excecao.RequisicaoInvalidaException;
import com.hotelpoo.repositorio.ClienteRepositorio;
import com.hotelpoo.repositorio.ReservaRepositorio;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ClienteCpfDuplicadoTest {

    @Mock
    private ClienteRepositorio clienteRepositorio;

    @Mock
    private ReservaRepositorio reservaRepositorio;

    @InjectMocks
    private ClienteServico clienteServico;

    @Test
    void recusaCpfDuplicadoComMensagemClara() {
        when(clienteRepositorio.existsByDocumento("12345678901")).thenReturn(true);
        ClienteRequisicao requisicao = new ClienteRequisicao(
                "Maria Santos",
                "123.456.789-01",
                "11988887771",
                "maria@email.com");

        ConflitoNegocioException conflito = assertThrows(
                ConflitoNegocioException.class,
                () -> clienteServico.cadastrar(requisicao));

        assertEquals("documento", conflito.getCampo());
        assertEquals("Ja existe cliente com este CPF.", conflito.getMessage());
        verify(clienteRepositorio, never()).save(any());
    }

    @Test
    void recusaCpfComQuantidadeInvalidaDeDigitos() {
        ClienteRequisicao requisicao = new ClienteRequisicao(
                "Maria Santos",
                "123",
                "11988887771",
                "maria@email.com");

        RequisicaoInvalidaException erro = assertThrows(
                RequisicaoInvalidaException.class,
                () -> clienteServico.cadastrar(requisicao));

        assertEquals("documento", erro.getCampo());
        verify(clienteRepositorio, never()).save(any());
    }
}
