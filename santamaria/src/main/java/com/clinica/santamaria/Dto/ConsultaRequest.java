package com.clinica.santamaria.Dto;

import java.time.LocalDate;

import com.clinica.santamaria.Entity.PacienteEntity;
import com.clinica.santamaria.Enum.TipoConsulta;

import jakarta.validation.constraints.NotNull;

public record ConsultaRequest(
    @NotNull
    LocalDate dataConsulta,

    boolean consultaPreNatal,

    String retorno,

    Long paciente,

    String horario,

    String nome,
    LocalDate dataNascimento,

    TipoConsulta tipoConsulta

) {
}
