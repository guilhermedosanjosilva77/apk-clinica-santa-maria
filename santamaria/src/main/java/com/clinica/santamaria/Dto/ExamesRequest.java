package com.clinica.santamaria.Dto;

import java.time.LocalDate;


import jakarta.validation.constraints.NotNull;

public record ExamesRequest(
    @NotNull
    LocalDate dataColeta,

    @NotNull
    LocalDate dataChegada,

    Long pacienteEntity

) {
} 
