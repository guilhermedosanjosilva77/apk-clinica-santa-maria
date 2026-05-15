package com.clinica.santamaria.Dto;

import java.time.LocalDate;


public record PacienteSimplificado(
    Long idPaciente,
    String nome,
    Integer numeroProntuario,
    LocalDate dataNascimento
) {
}
