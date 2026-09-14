package com.hotelpoo.servico;

import com.hotelpoo.api.dto.ClienteRequisicao;
import com.hotelpoo.api.dto.ClienteResposta;
import com.hotelpoo.api.dto.MontadorRespostas;
import com.hotelpoo.dominio.cliente.Cliente;
import com.hotelpoo.dominio.cliente.DocumentoCpf;
import com.hotelpoo.dominio.reserva.StatusReserva;
import com.hotelpoo.excecao.ConflitoNegocioException;
import com.hotelpoo.excecao.RecursoNaoEncontradoException;
import com.hotelpoo.repositorio.ClienteRepositorio;
import com.hotelpoo.repositorio.ReservaRepositorio;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ClienteServico {

    private static final List<StatusReserva> RESERVAS_ATIVAS =
            List.of(StatusReserva.RESERVADA, StatusReserva.CHECKED_IN);

    private final ClienteRepositorio clienteRepositorio;
    private final ReservaRepositorio reservaRepositorio;

    public ClienteServico(ClienteRepositorio clienteRepositorio, ReservaRepositorio reservaRepositorio) {
        this.clienteRepositorio = clienteRepositorio;
        this.reservaRepositorio = reservaRepositorio;
    }

    @Transactional(readOnly = true)
    public List<ClienteResposta> listar(String busca) {
        String termo = busca == null ? "" : busca.trim();
        List<Cliente> encontrados = termo.isEmpty()
                ? clienteRepositorio.findAll(Sort.by("nome"))
                : clienteRepositorio.buscarPorNomeDocumentoOuEmail(termo);
        return encontrados.stream().map(MontadorRespostas::cliente).toList();
    }

    @Transactional(readOnly = true)
    public ClienteResposta buscarPorId(Long id) {
        return MontadorRespostas.cliente(carregar(id));
    }

    @Transactional
    public ClienteResposta cadastrar(ClienteRequisicao requisicao) {
        String documento = DocumentoCpf.normalizar(requisicao.documento());
        garantirCpfLivre(documento, null);
        Cliente cliente = new Cliente(
                requisicao.nome(),
                documento,
                requisicao.telefone(),
                requisicao.email());
        return MontadorRespostas.cliente(clienteRepositorio.save(cliente));
    }

    @Transactional
    public ClienteResposta atualizar(Long id, ClienteRequisicao requisicao) {
        Cliente cliente = carregar(id);
        String documento = DocumentoCpf.normalizar(requisicao.documento());
        garantirCpfLivre(documento, id);
        cliente.atualizar(requisicao.nome(), documento, requisicao.telefone(), requisicao.email());
        return MontadorRespostas.cliente(cliente);
    }

    @Transactional
    public void remover(Long id) {
        Cliente cliente = carregar(id);
        if (reservaRepositorio.existsByClienteIdAndStatusIn(id, RESERVAS_ATIVAS)) {
            throw new ConflitoNegocioException(
                    "Nao e possivel excluir cliente com reserva RESERVADA ou CHECKED_IN.");
        }
        clienteRepositorio.delete(cliente);
    }

    public Cliente carregar(Long id) {
        return clienteRepositorio.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Cliente nao encontrado."));
    }

    public void garantirCpfLivre(String documento, Long idAtual) {
        boolean duplicado = idAtual == null
                ? clienteRepositorio.existsByDocumento(documento)
                : clienteRepositorio.existsByDocumentoAndIdNot(documento, idAtual);
        if (duplicado) {
            throw new ConflitoNegocioException("Ja existe cliente com este CPF.", "documento");
        }
    }
}
