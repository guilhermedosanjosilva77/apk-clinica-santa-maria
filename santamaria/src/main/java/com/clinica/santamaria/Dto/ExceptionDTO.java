package com.clinica.santamaria.Dto;

import java.time.LocalDateTime;

public record ExceptionDTO(
    LocalDateTime timestamp,
    int status,
    String erro,
    String mensagem,
    String path
) {
    
}
