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
@Table(name = "consulta")
public class ConsultaEntity {
    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long consultaID;

    //Data da consulta que a paciente irá agendar
    @NotNull
    private LocalDate dataConsulta;

    private String horario;

    //Consulta pré natal
    private boolean consultaPreNatal;

    //Retorno
    private String retorno;

    @ManyToOne
    @JoinColumn(name = "idPaciente")
    private PacienteEntity pacienteEntity;

    

    

    public ConsultaEntity() {
    }

    public ConsultaEntity(Long consultaID, @NotNull LocalDate dataConsulta, String horario, boolean consultaPreNatal,
            String retorno, PacienteEntity pacienteEntity) {
        this.consultaID = consultaID;
        this.dataConsulta = dataConsulta;
        this.horario = horario;
        this.consultaPreNatal = consultaPreNatal;
        this.retorno = retorno;
        this.pacienteEntity = pacienteEntity;
    }







    public Long getConsultaID() {
        return consultaID;
    }





    public void setConsultaID(Long consultaID) {
        this.consultaID = consultaID;
    }





    public LocalDate getDataConsulta() {
        return dataConsulta;
    }





    public void setDataConsulta(LocalDate dataConsulta) {
        this.dataConsulta = dataConsulta;
    }





    public String getHorario() {
        return horario;
    }





    public void setHorario(String horario) {
        this.horario = horario;
    }





    public boolean isConsultaPreNatal() {
        return consultaPreNatal;
    }





    public void setConsultaPreNatal(boolean consultaPreNatal) {
        this.consultaPreNatal = consultaPreNatal;
    }





    public String getRetorno() {
        return retorno;
    }





    public void setRetorno(String retorno) {
        this.retorno = retorno;
    }





    public PacienteEntity getPacienteEntity() {
        return pacienteEntity;
    }





    public void setPacienteEntity(PacienteEntity pacienteEntity) {
        this.pacienteEntity = pacienteEntity;
    }

    

    
   

    
    
}
