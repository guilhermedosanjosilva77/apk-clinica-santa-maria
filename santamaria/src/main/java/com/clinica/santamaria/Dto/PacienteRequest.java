package com.clinica.santamaria.Dto;

import java.time.LocalDate;
import java.util.List;

import org.hibernate.validator.constraints.br.CPF;

import com.clinica.santamaria.Entity.AgendaEntity;
import com.clinica.santamaria.Entity.ConsultaEntity;
import com.clinica.santamaria.Enum.EstadoCivil;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record PacienteRequest(
    @NotBlank
    String nome,
    
    @NotNull
    LocalDate dataNascimento,

    @CPF
    String CPF,

    Integer numeroProntuario,

    @Enumerated(EnumType.STRING)
    EstadoCivil estadoCivil,

    @Email(message = "O email tem que ser válido")
     
    @Pattern(
        regexp = "^\\([1-9]{2}\\) (?:[2-8]|9[1-9])[0-9]{3}\\-[0-9]{4}$"
    )
    String email,

    String celular,
    String profissao,
    LocalDate dataCadastro,
    String endereco
    

) {
} 