package com.clinica.santamaria.Entity;

import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "consulta")
public class ConsultaEntity {
    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long consultaID;

    private LocalDate dataConsulta;

    private boolean consultaPreNatal;

    private String retorno;

    

    public ConsultaEntity() {
    }

    public ConsultaEntity(Long consultaID, LocalDate dataConsulta, boolean consultaPreNatal, String retorno) {
        this.consultaID = consultaID;
        this.dataConsulta = dataConsulta;
        this.consultaPreNatal = consultaPreNatal;
        this.retorno = retorno;
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

    
    
}
