package com.hotelpoo.api;

import com.hotelpoo.api.dto.FolioResposta;
import com.hotelpoo.api.dto.HospedeRequisicao;
import com.hotelpoo.api.dto.HospedeResposta;
import com.hotelpoo.api.dto.PagamentoRequisicao;
import com.hotelpoo.api.dto.PagamentoResposta;
import com.hotelpoo.api.dto.RenovarReservaRequisicao;
import com.hotelpoo.api.dto.ReservaRequisicao;
import com.hotelpoo.api.dto.ReservaResposta;
import com.hotelpoo.api.dto.TransferirReservaRequisicao;
import com.hotelpoo.dominio.reserva.StatusReserva;
import com.hotelpoo.servico.ReservaServico;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reservas")
public class ReservaController {

    private final ReservaServico reservaServico;

    public ReservaController(ReservaServico reservaServico) {
        this.reservaServico = reservaServico;
    }

    @GetMapping
    public List<ReservaResposta> listar(@RequestParam(required = false) StatusReserva status) {
        return reservaServico.listar(status);
    }

    @GetMapping("/{id}")
    public ReservaResposta buscar(@PathVariable Long id) {
        return reservaServico.buscarPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReservaResposta criar(@Valid @RequestBody ReservaRequisicao requisicao) {
        return reservaServico.criar(requisicao);
    }

    @PostMapping("/{id}/cancelar")
    public ReservaResposta cancelar(@PathVariable Long id) {
        return reservaServico.cancelar(id);
    }

    @PostMapping("/{id}/renovar")
    public ReservaResposta renovar(
            @PathVariable Long id,
            @Valid @RequestBody RenovarReservaRequisicao requisicao) {
        return reservaServico.renovar(id, requisicao.novaDataCheckOut());
    }

    @PostMapping("/{id}/transferir")
    public ReservaResposta transferir(
            @PathVariable Long id,
            @Valid @RequestBody TransferirReservaRequisicao requisicao) {
        return reservaServico.transferir(id, requisicao.novoQuartoId());
    }

    @PostMapping("/{id}/check-in")
    public ReservaResposta checkIn(@PathVariable Long id) {
        return reservaServico.realizarCheckIn(id);
    }

    @PostMapping("/{id}/check-out")
    public ReservaResposta checkOut(@PathVariable Long id) {
        return reservaServico.realizarCheckOut(id);
    }

    @PostMapping("/{id}/hospedes")
    @ResponseStatus(HttpStatus.CREATED)
    public HospedeResposta adicionarHospede(
            @PathVariable Long id,
            @Valid @RequestBody HospedeRequisicao requisicao) {
        return reservaServico.adicionarHospede(id, requisicao);
    }

    @PostMapping("/{id}/pagamentos")
    @ResponseStatus(HttpStatus.CREATED)
    public PagamentoResposta registrarPagamento(
            @PathVariable Long id,
            @Valid @RequestBody PagamentoRequisicao requisicao) {
        return reservaServico.registrarPagamento(id, requisicao);
    }

    @GetMapping("/{id}/folio")
    public FolioResposta folio(@PathVariable Long id) {
        return reservaServico.consultarFolio(id);
    }
}
