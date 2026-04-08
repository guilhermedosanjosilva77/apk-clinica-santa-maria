package com.clinica.santamaria.Dto;

import java.time.LocalDate;

import com.clinica.santamaria.Entity.PacienteEntity;

import jakarta.validation.constraints.NotNull;

public record ExamesRequest(
    @NotNull
    LocalDate dataColeta,

    @NotNull
    LocalDate dataChegada,

    PacienteEntity pacienteEntity

) {
} 
