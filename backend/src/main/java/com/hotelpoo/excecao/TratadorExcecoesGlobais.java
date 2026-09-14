package com.hotelpoo.excecao;

import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import jakarta.validation.ConstraintViolationException;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
public class TratadorExcecoesGlobais {

    @ExceptionHandler(RequisicaoInvalidaException.class)
    public ResponseEntity<MensagemErro> tratarRequisicaoInvalida(RequisicaoInvalidaException excecao) {
        return ResponseEntity.badRequest().body(new MensagemErro(excecao.getMessage(), excecao.getCampo()));
    }

    @ExceptionHandler(RecursoNaoEncontradoException.class)
    public ResponseEntity<MensagemErro> tratarNaoEncontrado(RecursoNaoEncontradoException excecao) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MensagemErro(excecao.getMessage()));
    }

    @ExceptionHandler(ConflitoNegocioException.class)
    public ResponseEntity<MensagemErro> tratarConflito(ConflitoNegocioException excecao) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new MensagemErro(excecao.getMessage(), excecao.getCampo()));
    }

    @ExceptionHandler(CredenciaisInvalidasException.class)
    public ResponseEntity<MensagemErro> tratarCredenciais(CredenciaisInvalidasException excecao) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MensagemErro(excecao.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<MensagemErro> tratarValidacao(MethodArgumentNotValidException excecao) {
        FieldError primeiroErro = excecao.getBindingResult().getFieldErrors().stream().findFirst().orElse(null);
        if (primeiroErro == null) {
            return ResponseEntity.badRequest().body(new MensagemErro("Dados invalidos."));
        }
        String mensagem = primeiroErro.getDefaultMessage() == null
                ? "Campo invalido."
                : primeiroErro.getDefaultMessage();
        return ResponseEntity.badRequest().body(new MensagemErro(mensagem, primeiroErro.getField()));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<MensagemErro> tratarConstraint(ConstraintViolationException excecao) {
        String mensagem = excecao.getConstraintViolations().stream()
                .map(violacao -> violacao.getMessage())
                .collect(Collectors.joining("; "));
        return ResponseEntity.badRequest().body(new MensagemErro(mensagem.isBlank() ? "Dados invalidos." : mensagem));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<MensagemErro> tratarCorpoIlegivel(HttpMessageNotReadableException excecao) {
        if (excecao.getCause() instanceof InvalidFormatException formato) {
            String campo = formato.getPath().isEmpty() ? null : formato.getPath().getLast().getFieldName();
            return ResponseEntity.badRequest()
                    .body(new MensagemErro("Valor invalido para o campo informado.", campo));
        }
        return ResponseEntity.badRequest().body(new MensagemErro("Corpo da requisicao invalido ou malformado."));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<MensagemErro> tratarTipo(MethodArgumentTypeMismatchException excecao) {
        return ResponseEntity.badRequest()
                .body(new MensagemErro("Parametro com formato invalido.", excecao.getName()));
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<MensagemErro> tratarParametroAusente(MissingServletRequestParameterException excecao) {
        return ResponseEntity.badRequest()
                .body(new MensagemErro("Parametro obrigatorio ausente.", excecao.getParameterName()));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<MensagemErro> tratarAutenticacao(AuthenticationException excecao) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new MensagemErro("Nao autenticado. Faca login."));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<MensagemErro> tratarAcessoNegado(AccessDeniedException excecao) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new MensagemErro("Acesso negado para este recurso."));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<MensagemErro> tratarInesperado(Exception excecao) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MensagemErro("Erro interno ao processar a requisicao."));
    }
}
