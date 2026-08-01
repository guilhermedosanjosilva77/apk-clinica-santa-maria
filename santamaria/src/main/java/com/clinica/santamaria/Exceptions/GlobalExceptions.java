package com.clinica.santamaria.Exceptions;

import java.time.LocalDateTime;
import java.util.stream.Collectors;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import com.clinica.santamaria.Dto.ExceptionDTO;
import jakarta.servlet.http.HttpServletRequest;

@RestControllerAdvice
public class GlobalExceptions {

    // Captura erros de validação dos campos (@Valid nos DTOs, ex: @NotBlank, @Email, @CPF)
    // Sem isso, esses erros caiam no handler genérico e viravam "Erro interno do servidor"
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ExceptionDTO> handleValidationException(MethodArgumentNotValidException ex, HttpServletRequest request) {
        String mensagem = ex.getBindingResult().getFieldErrors().stream()
            .map(erro -> erro.getField() + ": " + erro.getDefaultMessage())
            .collect(Collectors.joining(" | "));

        ExceptionDTO erro = new ExceptionDTO(
            LocalDateTime.now(),
            HttpStatus.BAD_REQUEST.value(),
            "Erro de validação",
            mensagem.isBlank() ? "Dados inválidos" : mensagem,
            request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(erro);
    }

    // Captura violação de integridade no banco (ex: CPF duplicado pego pela constraint UNIQUE,
    // caso escape da checagem manual no Service por concorrência)
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ExceptionDTO> handleDataIntegrityViolationException(DataIntegrityViolationException ex, HttpServletRequest request) {
        ExceptionDTO erro = new ExceptionDTO(
            LocalDateTime.now(),
            HttpStatus.CONFLICT.value(),
            "Conflito de dados",
            "Já existe um registro com esse dado (verifique CPF ou outro campo único).",
            request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.CONFLICT).body(erro);
    }

    // Captura erros de lógica e regras de negócio (Mais específico)
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ExceptionDTO> handleRunTimeException(RuntimeException ex, HttpServletRequest request){
        ExceptionDTO erro = new ExceptionDTO(
            LocalDateTime.now(),
            HttpStatus.BAD_REQUEST.value(), // Alinhado com o status de retorno
            "Erro de regra de negócio",
            ex.getMessage(),
            request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(erro);
    }

    // Captura QUALQUER outro erro que não seja RuntimeException (Genérico)
    @ExceptionHandler(Exception.class) // <--- MUDANÇA AQUI
    public ResponseEntity<ExceptionDTO> handleGenericException(Exception ex, HttpServletRequest request){
        ex.printStackTrace();
        ExceptionDTO erro = new ExceptionDTO(
            LocalDateTime.now(),
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            "Erro interno do servidor",
            "Ocorreu um erro inesperado. Tente novamente mais tarde.",
            request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(erro);
    }
}