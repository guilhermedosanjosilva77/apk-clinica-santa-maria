package com.clinica.santamaria.Entity;

import java.time.LocalDate;
import java.util.List;

import org.hibernate.validator.constraints.br.CPF;

import com.clinica.santamaria.Enum.EstadoCivil;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

@Entity
@Table (name = "paciente")
public class PacienteEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idPaciente;

    //Nome
    @NotBlank
    private String nome;

    //Data de nascimento
    @NotNull
    private LocalDate dataNascimento;
    
    //CPF
    @CPF(message = "O CPF tem que ser válido")
    private String CPF;

    //Numero do prontuario da paciente
    private Integer numeroProntuario;

    //Estado civil
    @Enumerated(EnumType.STRING)
    private EstadoCivil estadoCivil;

    //Email
    @Email(message = "O email tem que ser válido")
    private String email;

    //Celular
    @Pattern(
        regexp = "^\\([1-9]{2}\\) (?:[2-8]|9[1-9])[0-9]{3}\\-[0-9]{4}$"
    )
    private String celular;

    //Profissao
    private String profissao;

    //Tabela relacional com agenda, cria uma lista de todas as consultas que a paciente ja agendou
    @OneToMany
    @JoinColumn (name = "paciente")
    private List<AgendaEntity> agendaID;

    

    public PacienteEntity(Long idPaciente, @NotBlank String nome, @NotNull LocalDate dataNascimento,
            @org.hibernate.validator.constraints.br.CPF String cPF, @NotNull Integer numeroProntuario,
            EstadoCivil estadoCivil, @Email String email, String celular, @NotBlank String profissao,
            List<AgendaEntity> agendaID) {
        this.idPaciente = idPaciente;
        this.nome = nome;
        this.dataNascimento = dataNascimento;
        CPF = cPF;
        this.numeroProntuario = numeroProntuario;
        this.estadoCivil = estadoCivil;
        this.email = email;
        this.celular = celular;
        this.profissao = profissao;
        this.agendaID = agendaID;
    }

    public PacienteEntity() {
    }

    public Long getIdPaciente() {
        return idPaciente;
    }

    public void setIdPaciente(Long idPaciente) {
        this.idPaciente = idPaciente;
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

    public String getCPF() {
        return CPF;
    }

    public void setCPF(String cPF) {
        CPF = cPF;
    }

    public Integer getNumeroProntuario() {
        return numeroProntuario;
    }

    public void setNumeroProntuario(Integer numeroProntuario) {
        this.numeroProntuario = numeroProntuario;
    }

    public EstadoCivil getEstadoCivil() {
        return estadoCivil;
    }

    public void setEstadoCivil(EstadoCivil estadoCivil) {
        this.estadoCivil = estadoCivil;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getCelular() {
        return celular;
    }

    public void setCelular(String celular) {
        this.celular = celular;
    }

    public String getProfissao() {
        return profissao;
    }

    public void setProfissao(String profissao) {
        this.profissao = profissao;
    }

    public List<AgendaEntity> getAgendaID() {
        return agendaID;
    }

    public void setAgendaID(List<AgendaEntity> agendaID) {
        this.agendaID = agendaID;
    }
    
    
    


    
}
