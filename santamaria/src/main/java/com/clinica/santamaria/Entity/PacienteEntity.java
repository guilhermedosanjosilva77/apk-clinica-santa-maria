package com.clinica.santamaria.Entity;

import java.time.LocalDate;
import java.util.List;

import org.hibernate.validator.constraints.br.CPF;

import com.clinica.santamaria.Enum.EstadoCivil;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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
    
    //cpf
    @CPF(message = "O cpf tem que ser válido")
    private String cpf;

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

    //Data de Cdastro da paciente no sistema
    private LocalDate dataCadastro;

    //Endereço
    private String endereco;

    //Mensgame opcional de paciente
    private String mensagem;

    @OneToMany(mappedBy ="pacienteEntity", cascade = CascadeType.ALL)
    private List<ExamesEntity> exames;

    //Lista de consultas atribuidas a uma paciente
    @OneToMany(mappedBy = "pacienteEntity", cascade = CascadeType.ALL)
    private List<ConsultaEntity> consultas;

    public PacienteEntity() {
    }

    public PacienteEntity(Long idPaciente, @NotBlank String nome, @NotNull LocalDate dataNascimento,
            @org.hibernate.validator.constraints.br.CPF(message = "O cpf tem que ser válido") String cpf,
            Integer numeroProntuario, EstadoCivil estadoCivil,
            @Email(message = "O email tem que ser válido") String email,
            @Pattern(regexp = "^\\([1-9]{2}\\) (?:[2-8]|9[1-9])[0-9]{3}\\-[0-9]{4}$") String celular, String profissao,
            LocalDate dataCadastro, String endereco,String mensagem, List<ConsultaEntity> consultas,List<ExamesEntity> exames) {
        this.idPaciente = idPaciente;
        this.nome = nome;
        this.dataNascimento = dataNascimento;
        this.cpf = cpf;
        this.numeroProntuario = numeroProntuario;
        this.estadoCivil = estadoCivil;
        this.email = email;
        this.celular = celular;
        this.profissao = profissao;
        this.dataCadastro = dataCadastro;
        this.endereco = endereco;
        this.consultas = consultas;
        this.mensagem = mensagem;
        this.exames = exames;
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

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
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

    public LocalDate getDataCadastro() {
        return dataCadastro;
    }

    public void setDataCadastro(LocalDate dataCadastro) {
        this.dataCadastro = dataCadastro;
    }

    public String getEndereco() {
        return endereco;
    }

    public void setEndereco(String endereco) {
        this.endereco = endereco;
    }

    public void setConsultas(List<ConsultaEntity> consultas) {
        this.consultas = consultas;
    }

    public List<ConsultaEntity> getConsultas() {
        return consultas;
    }

    public String getMensagem() {
        return mensagem;
    }

    public void setMensagem(String mensagem) {
        this.mensagem = mensagem;
    }

    public List<ExamesEntity> getExames() {
        return exames;
    }

    public void setExames(List<ExamesEntity> exames) {
        this.exames = exames;
    }

    ''

    

}

   