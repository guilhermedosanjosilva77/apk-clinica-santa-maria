package com.clinica.santamaria.Dto;

import java.time.LocalDate;

import com.clinica.santamaria.Entity.PacienteEntity;

import jakarta.validation.constraints.NotNull;

public record ConsultaRequest(
    @NotNull
    LocalDate dataConsulta,

    boolean consultaPreNatal,

    String retorno,

    PacienteEntity paciente
) {
}
