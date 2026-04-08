package com.clinica.santamaria.Dto;

import java.time.LocalDate;
import java.util.List;
import com.clinica.santamaria.Entity.ConsultaEntity;
import com.clinica.santamaria.Enum.EstadoCivil;

//Trata os dados que serão enviados do backEnd para o front end
public record PacienteResponse(
    Long pacienteID,
    String nome,
    LocalDate dataNascimento,
    String cpf,
    Integer numeroProntuario,
    EstadoCivil estadoCivil,
    String email,
    String celular,
    String profissao,
    //Retorna todas as consultas que serão alocadas ao id de uma das pacientes
    List<ConsultaSimplificado> consultaSimplificado

) {
} 
