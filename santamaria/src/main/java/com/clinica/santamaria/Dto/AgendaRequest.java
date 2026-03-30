package com.clinica.santamaria.Dto;

import java.time.LocalDate;

import com.clinica.santamaria.Entity.PacienteEntity;
import com.clinica.santamaria.Enum.Status;
import com.clinica.santamaria.Enum.TipoConsulta;

public record AgendaRequest(
    String nome,
    LocalDate dataNascimento,
    TipoConsulta tipoConsulta,
    Status status,
    PacienteEntity pacienteEntity
    


) {
    
    
}
