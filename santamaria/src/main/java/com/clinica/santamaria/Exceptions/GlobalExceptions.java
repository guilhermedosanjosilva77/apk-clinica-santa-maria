package com.clinica.santamaria.Exceptions;

import java.time.LocalDateTime;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import com.clinica.santamaria.Dto.ExceptionDTO;
import jakarta.servlet.http.HttpServletRequest;

@RestControllerAdvice
public class GlobalExceptions {

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