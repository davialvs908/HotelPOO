package com.hotelpoo.api.dto;

import com.hotelpoo.dominio.cliente.Cliente;
import com.hotelpoo.dominio.feedback.FeedbackHospede;
import com.hotelpoo.dominio.pagamento.FolioHospedagem;
import com.hotelpoo.dominio.pagamento.Pagamento;
import com.hotelpoo.dominio.quarto.Quarto;
import com.hotelpoo.dominio.reserva.HospedeReserva;
import com.hotelpoo.dominio.reserva.Reserva;
import com.hotelpoo.dominio.usuario.Usuario;
import java.util.List;

public final class MontadorRespostas {

    private MontadorRespostas() {
    }

    public static ClienteResposta cliente(Cliente cliente) {
        return new ClienteResposta(
                cliente.getId(),
                cliente.getNome(),
                cliente.getDocumento(),
                cliente.getTelefone(),
                cliente.getEmail());
    }

    public static QuartoResposta quarto(Quarto quarto) {
        return new QuartoResposta(
                quarto.getId(),
                quarto.getNumero(),
                quarto.getTipo(),
                quarto.getPrecoBasePorNoite(),
                quarto.calcularPreco(1),
                quarto.getStatus());
    }

    public static ReservaResposta reserva(Reserva reserva) {
        FolioHospedagem folio = reserva.calcularFolio();
        List<HospedeResposta> hospedes = reserva.getHospedes().stream()
                .map(MontadorRespostas::hospede)
                .toList();
        List<PagamentoResposta> pagamentos = reserva.getPagamentos().stream()
                .map(MontadorRespostas::pagamento)
                .toList();
        return new ReservaResposta(
                reserva.getId(),
                cliente(reserva.getCliente()),
                quarto(reserva.getQuarto()),
                reserva.getCheckIn(),
                reserva.getCheckOut(),
                reserva.getValorTotal(),
                reserva.getStatus(),
                hospedes,
                pagamentos,
                folio.saldo());
    }

    public static HospedeResposta hospede(HospedeReserva hospede) {
        return new HospedeResposta(hospede.getId(), hospede.getNome(), hospede.getDocumento());
    }

    public static PagamentoResposta pagamento(Pagamento pagamento) {
        return new PagamentoResposta(
                pagamento.getId(),
                pagamento.getValor(),
                pagamento.getForma(),
                pagamento.getInstante());
    }

    public static FolioResposta folio(FolioHospedagem folio) {
        return new FolioResposta(folio.valorReserva(), folio.totalPago(), folio.saldo());
    }

    public static FeedbackResposta feedback(FeedbackHospede feedback) {
        Long reservaId = feedback.getReserva() == null ? null : feedback.getReserva().getId();
        return new FeedbackResposta(
                feedback.getId(),
                feedback.getTexto(),
                cliente(feedback.getCliente()),
                reservaId);
    }

    public static UsuarioResposta usuario(Usuario usuario) {
        return new UsuarioResposta(
                usuario.getId(),
                usuario.getNome(),
                usuario.getLogin(),
                usuario.getPapel());
    }

    public static UsuarioAutenticadoResposta autenticado(Usuario usuario) {
        return new UsuarioAutenticadoResposta(
                usuario.getId(),
                usuario.getNome(),
                usuario.getLogin(),
                usuario.getPapel());
    }
}
