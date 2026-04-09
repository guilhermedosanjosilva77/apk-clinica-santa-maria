package com.clinica.santamaria.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.clinica.santamaria.Dto.ConsultaSimplificado;
import com.clinica.santamaria.Dto.ExamesResponse;
import com.clinica.santamaria.Dto.ExamesSimplificado;
import com.clinica.santamaria.Dto.PacienteRequest;
import com.clinica.santamaria.Dto.PacienteResponse;
import com.clinica.santamaria.Entity.PacienteEntity;
import com.clinica.santamaria.Repository.PacienteRepository;

@Service
public class PacienteService {

    private final PacienteRepository pacienteRepository;

    public PacienteService(PacienteRepository pacienteRepository) {
        this.pacienteRepository = pacienteRepository;
    }

    // CREATE
    // Metodo para adicionar paciente ao sistema
    public PacienteResponse criar(PacienteRequest pacienteRequest) {
        PacienteEntity paciente = new PacienteEntity();

        boolean cpfExiste = pacienteRepository.existexistsBycpf(null);

        if (cpfExiste == true) {
            throw new RuntimeException("Conflito: Já existe um paciente cadastrado com esse CPF");
            
        }

        paciente.setNome(pacienteRequest.nome());
        paciente.setCpf(pacienteRequest.cpf());
        paciente.setCelular(pacienteRequest.celular());
        paciente.setEmail(pacienteRequest.email());
        paciente.setDataCadastro(pacienteRequest.dataCadastro());
        paciente.setDataNascimento(pacienteRequest.dataNascimento());
        paciente.setEndereco(pacienteRequest.endereco());
        paciente.setEstadoCivil(pacienteRequest.estadoCivil());
        paciente.setNumeroProntuario(pacienteRequest.numeroProntuario());
        paciente.setProfissao(pacienteRequest.profissao());
        paciente.setProfissao(pacienteRequest.mensagem());

        pacienteRepository.save(paciente);

        return paraDTO(paciente);

    }

    // READ
    // Lista todas as pacientes cadastradas
    public List<PacienteResponse> listar() {
        return pacienteRepository.findAll().stream().map(this::paraDTO).collect(Collectors.toList());

    }

    // READ BY DATE
    // Buscar paciente pelo campo data de nascimento
    public List<PacienteResponse> buscarPorDataNascimento(LocalDate dataNascimento) {
        // Busca a lista no banco
        List<PacienteEntity> pacientes = pacienteRepository.findByDataNascimento(dataNascimento);

        // Transforma a lista de Entidades em lista de DTOs (Response)
        return pacientes.stream()
                .map(this::paraDTO) // Usa aquele método auxiliar que criamos
                .collect(Collectors.toList());
    }

    // UPDATE
    // Atualiza cadastro da paciente
    public PacienteResponse atualizar(PacienteRequest pacienteRequest, Long idPaciente) {
        // 1. Busca o paciente existente pelo ID (Garantia de segurança)
        // O .get() extrai o objeto. Se não existir, o Java lança NoSuchElementException
        PacienteEntity pacienteExistente = pacienteRepository.findById(idPaciente).get();

        // 2. Atualiza os campos com os novos dados do Request
        pacienteExistente.setNome(pacienteRequest.nome());
        pacienteExistente.setCpf(pacienteRequest.cpf());
        pacienteExistente.setCelular(pacienteRequest.celular());
        pacienteExistente.setEmail(pacienteRequest.email());
        pacienteExistente.setDataNascimento(pacienteRequest.dataNascimento());
        pacienteExistente.setEndereco(pacienteRequest.endereco());
        pacienteExistente.setEstadoCivil(pacienteRequest.estadoCivil());
        pacienteExistente.setNumeroProntuario(pacienteRequest.numeroProntuario());
        pacienteExistente.setProfissao(pacienteRequest.profissao());
        pacienteExistente.setMensagem(pacienteRequest.mensagem());

        pacienteRepository.save(pacienteExistente);

        // 4. Retorna o DTO atualizado
        return paraDTO(pacienteExistente);

    }

    // DELETE
    // DELETA PACIENTE DO SISTEMA
    public void deletar(Long idPaciente) {
        pacienteRepository.deleteById(idPaciente);

    }

    // METODO QUE TRANSFORMA ENTITY EM DTO
    private PacienteResponse paraDTO(PacienteEntity paciente) {

        List<ConsultaSimplificado> consultaSimplificado = paciente.getConsultas().stream()
        .map(consulta -> new ConsultaSimplificado(
            consulta.getConsultaID(),
            consulta.getDataConsulta(),
            consulta.getHorario()
        ))
        .collect(Collectors.toList());

        List<ExamesSimplificado> examesSimplificados = new ArrayList<>();
    if (paciente.getExames() != null) {
        examesSimplificados = paciente.getExames().stream()
            .map(exame -> new ExamesSimplificado(
                exame.getExamesId(),
                exame.getDataColeta(),
                exame.getDataChegada()
            ))
            .collect(Collectors.toList());
    }

     

        return new PacienteResponse(
                paciente.getIdPaciente(),
                paciente.getNome(),
                paciente.getDataNascimento(),
                paciente.getCpf(),
                paciente.getNumeroProntuario(),
                paciente.getEstadoCivil(),
                paciente.getEmail(),
                paciente.getCelular(),
                paciente.getProfissao(),
                paciente.getMensagem(),
                consultaSimplificado,
                examesSimplificados
        );
    }
}
