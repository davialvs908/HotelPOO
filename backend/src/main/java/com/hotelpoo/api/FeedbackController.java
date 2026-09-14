package com.hotelpoo.api;

import com.hotelpoo.api.dto.FeedbackRequisicao;
import com.hotelpoo.api.dto.FeedbackResposta;
import com.hotelpoo.servico.FeedbackServico;
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
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/feedbacks")
public class FeedbackController {

    private final FeedbackServico feedbackServico;

    public FeedbackController(FeedbackServico feedbackServico) {
        this.feedbackServico = feedbackServico;
    }

    @GetMapping
    public List<FeedbackResposta> listar() {
        return feedbackServico.listar();
    }

    @GetMapping("/{id}")
    public FeedbackResposta buscar(@PathVariable Long id) {
        return feedbackServico.buscarPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FeedbackResposta cadastrar(@Valid @RequestBody FeedbackRequisicao requisicao) {
        return feedbackServico.cadastrar(requisicao);
    }

    @PutMapping("/{id}")
    public FeedbackResposta atualizar(
            @PathVariable Long id,
            @Valid @RequestBody FeedbackRequisicao requisicao) {
        return feedbackServico.atualizar(id, requisicao);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remover(@PathVariable Long id) {
        feedbackServico.remover(id);
    }
}
