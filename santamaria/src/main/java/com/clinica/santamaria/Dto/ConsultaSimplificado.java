package com.clinica.santamaria.Dto;

import java.time.LocalDate;

public record ConsultaSimplificado(
    Long consultaId,

    LocalDate dataConsulta,

    String horario

    
) {
    
}
