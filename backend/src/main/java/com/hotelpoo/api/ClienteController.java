package com.hotelpoo.api;

import com.hotelpoo.api.dto.ClienteRequisicao;
import com.hotelpoo.api.dto.ClienteResposta;
import com.hotelpoo.servico.ClienteServico;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    private final ClienteServico clienteServico;

    public ClienteController(ClienteServico clienteServico) {
        this.clienteServico = clienteServico;
    }

    @GetMapping
    public List<ClienteResposta> listar(@RequestParam(required = false) String busca) {
        return clienteServico.listar(busca);
    }

    @GetMapping("/{id}")
    public ClienteResposta buscar(@PathVariable Long id) {
        return clienteServico.buscarPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ClienteResposta cadastrar(@Valid @RequestBody ClienteRequisicao requisicao) {
        return clienteServico.cadastrar(requisicao);
    }

    @PutMapping("/{id}")
    public ClienteResposta atualizar(@PathVariable Long id, @Valid @RequestBody ClienteRequisicao requisicao) {
        return clienteServico.atualizar(id, requisicao);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remover(@PathVariable Long id) {
        clienteServico.remover(id);
    }
}
