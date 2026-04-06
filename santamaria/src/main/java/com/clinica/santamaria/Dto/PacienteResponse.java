package com.clinica.santamaria.Dto;

import java.time.LocalDate;
import java.util.List;
import com.clinica.santamaria.Entity.AgendaEntity;
import com.clinica.santamaria.Entity.ConsultaEntity;
import com.clinica.santamaria.Enum.EstadoCivil;

public record PacienteResponse(
    Long pacienteID,
    String nome,
    LocalDate dataNascimento,
    String CPF,
    Integer numeroProntuario,
    EstadoCivil estadoCivil,
    String email,
    String celular,
    String profissao,
    List<ConsultaEntity> consultaID


) {
} 
