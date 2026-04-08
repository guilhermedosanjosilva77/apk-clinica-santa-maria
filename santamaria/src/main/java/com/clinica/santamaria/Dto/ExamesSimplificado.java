package com.clinica.santamaria.Dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;

public record ExamesSimplificado(

    Long examesId,

    @NotNull
    LocalDate dataColeta,

    @NotNull
    LocalDate dataChegada

) {
}
