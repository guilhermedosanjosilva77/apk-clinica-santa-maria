package com.clinica.santamaria.Dto;

import java.time.LocalDate;

import com.clinica.santamaria.Entity.PacienteEntity;

import jakarta.validation.constraints.NotNull;

public record ExamesResponse(
    Long examesId,

    @NotNull
    LocalDate dataColeta,

    @NotNull
    LocalDate dataChegada,

    PacienteSimplificado PacienteSimplificado
) {
} 
