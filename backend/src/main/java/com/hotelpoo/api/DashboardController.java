package com.hotelpoo.api;

import com.hotelpoo.api.dto.DashboardResposta;
import com.hotelpoo.servico.DashboardServico;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardServico dashboardServico;

    public DashboardController(DashboardServico dashboardServico) {
        this.dashboardServico = dashboardServico;
    }

    @GetMapping
    public DashboardResposta consultar() {
        return dashboardServico.montar();
    }
}
