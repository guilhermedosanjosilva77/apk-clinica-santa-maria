package com.clinica.santamaria.Dto;

import java.time.LocalDate;

import com.clinica.santamaria.Entity.PacienteEntity;

public record ConsultaResponse(
     Long consultaID,
    LocalDate dataConsulta,

    boolean consultaPreNatal,

    String retorno,

    PacienteSimplificado pacienteSimplificado,


    String horario

) {
} 
