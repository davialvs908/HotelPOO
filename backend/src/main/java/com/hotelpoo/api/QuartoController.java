package com.hotelpoo.api;

import com.hotelpoo.api.dto.QuartoRequisicao;
import com.hotelpoo.api.dto.QuartoResposta;
import com.hotelpoo.api.dto.StatusQuartoRequisicao;
import com.hotelpoo.servico.QuartoServico;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/quartos")
public class QuartoController {

    private final QuartoServico quartoServico;

    public QuartoController(QuartoServico quartoServico) {
        this.quartoServico = quartoServico;
    }

    @GetMapping
    public List<QuartoResposta> listar() {
        return quartoServico.listar();
    }

    @GetMapping("/disponiveis")
    public List<QuartoResposta> disponiveis(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut) {
        return quartoServico.listarDisponiveis(checkIn, checkOut);
    }

    @GetMapping("/{id}")
    public QuartoResposta buscar(@PathVariable Long id) {
        return quartoServico.buscarPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('GERENTE')")
    public QuartoResposta cadastrar(@Valid @RequestBody QuartoRequisicao requisicao) {
        return quartoServico.cadastrar(requisicao);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('GERENTE')")
    public QuartoResposta atualizar(@PathVariable Long id, @Valid @RequestBody QuartoRequisicao requisicao) {
        return quartoServico.atualizar(id, requisicao);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('GERENTE', 'CAMAREIRA')")
    public QuartoResposta alterarStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusQuartoRequisicao requisicao) {
        return quartoServico.alterarStatus(id, requisicao.status());
    }
}
