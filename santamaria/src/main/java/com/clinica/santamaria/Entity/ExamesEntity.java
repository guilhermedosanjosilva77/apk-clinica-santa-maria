package com.clinica.santamaria.Entity;

import java.time.LocalDate;


import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "exames")
public class ExamesEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long examesId;

    @NotNull
    private LocalDate dataColeta;

    @NotNull
    private LocalDate dataChegada;

    @ManyToOne
    @JoinColumn(name = "idPaciente" )
    private PacienteEntity pacienteEntity;

    public ExamesEntity() {
    }

    public ExamesEntity(Long examesId, LocalDate dataColeta, LocalDate dataChegada, PacienteEntity pacienteEntity) {
        this.examesId = examesId;
        this.dataColeta = dataColeta;
        this.dataChegada = dataChegada;
        this.pacienteEntity = pacienteEntity;
    }

    public Long getExamesId() {
        return examesId;
    }

    public void setExamesId(Long examesId) {
        this.examesId = examesId;
    }

    public LocalDate getDataColeta() {
        return dataColeta;
    }

    public void setDataColeta(LocalDate dataColeta) {
        this.dataColeta = dataColeta;
    }

    public LocalDate getDataChegada() {
        return dataChegada;
    }

    public void setDataChegada(LocalDate dataChegada) {
        this.dataChegada = dataChegada;
    }

    public PacienteEntity getPacienteEntity() {
        return pacienteEntity;
    }

    public void setPacienteEntity(PacienteEntity pacienteEntity) {
        this.pacienteEntity = pacienteEntity;
    }

    


    
}
