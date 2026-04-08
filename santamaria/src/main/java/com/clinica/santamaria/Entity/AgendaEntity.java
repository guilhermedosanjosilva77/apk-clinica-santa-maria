package com.clinica.santamaria.Entity;

import java.time.LocalDate;
import com.clinica.santamaria.Enum.Status;
import com.clinica.santamaria.Enum.TipoConsulta;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "agenda")
public class AgendaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idAgenda;

    //Nome paciente
    @NotBlank
    private String nome;

    //Data de Nascimento
    @NotNull
    private LocalDate dataNascimento;

    private LocalDate dataAgendamento;

    //Tipo de Consulta Particular ou Unimed
    @Enumerated(EnumType.STRING)
    @NotNull
    private TipoConsulta tipoConsulta;

    //Status Pendente,Cancelado,Concluido
    @Enumerated(EnumType.STRING)
    private Status status;

    //Tabela associativa com paciente
    @ManyToOne 
    @JoinColumn(name = "agendaID")
    private PacienteEntity paciente;

    

    public AgendaEntity() {
    }

    public AgendaEntity(Long idAgenda, String nome, LocalDate dataNascimento, TipoConsulta tipoConsulta, Status status,
            PacienteEntity paciente, LocalDate dataAgendamento) {
        this.idAgenda = idAgenda;
        this.nome = nome;
        this.dataNascimento = dataNascimento;
        this.tipoConsulta = tipoConsulta;
        this.status = status;
        this.paciente = paciente;
        this.dataAgendamento = dataAgendamento;
    }

    public Long getIdAgenda() {
        return idAgenda;
    }

    public void setIdAgenda(Long idAgenda) {
        this.idAgenda = idAgenda;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public LocalDate getDataNascimento() {
        return dataNascimento;
    }

    public void setDataNascimento(LocalDate dataNascimento) {
        this.dataNascimento = dataNascimento;
    }

    public TipoConsulta getTipoConsulta() {
        return tipoConsulta;
    }

    public void setTipoConsulta(TipoConsulta tipoConsulta) {
        this.tipoConsulta = tipoConsulta;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public PacienteEntity getPaciente() {
        return paciente;
    }

    public void setPaciente(PacienteEntity paciente) {
        this.paciente = paciente;
    }

    public LocalDate getDataAgendamento() {
        return dataAgendamento;
    }

    public void setDataAgendamento(LocalDate dataAgendamento) {
        this.dataAgendamento = dataAgendamento;
    }

    

    




    
}
