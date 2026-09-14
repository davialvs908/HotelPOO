package com.hotelpoo.api;

import com.hotelpoo.api.dto.RelatorioCompletoResposta;
import com.hotelpoo.api.dto.RelatorioResumidoResposta;
import com.hotelpoo.servico.RelatorioServico;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/relatorios")
public class RelatorioController {

    private final RelatorioServico relatorioServico;

    public RelatorioController(RelatorioServico relatorioServico) {
        this.relatorioServico = relatorioServico;
    }

    @GetMapping("/completo")
    public RelatorioCompletoResposta completo() {
        return relatorioServico.completo();
    }

    @GetMapping("/resumido")
    public RelatorioResumidoResposta resumido() {
        return relatorioServico.resumido();
    }
}
