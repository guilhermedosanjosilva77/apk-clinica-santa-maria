package com.clinica.santamaria.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

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

    //CREATE
    public PacienteResponse criar(PacienteRequest pacienteRequest){
        PacienteEntity paciente = new PacienteEntity();

        paciente.setNome(pacienteRequest.nome());
            paciente.setCPF(pacienteRequest.CPF());
            paciente.setCelular(pacienteRequest.celular());
            paciente.setEmail(pacienteRequest.email());
            paciente.setDataCadastro(pacienteRequest.dataCadastro());
            paciente.setDataNascimento(pacienteRequest.dataNascimento());
            paciente.setEndereco(pacienteRequest.endereco());
            paciente.setEstadoCivil(pacienteRequest.estadoCivil());
            paciente.setNumeroProntuario(pacienteRequest.numeroProntuario());
            paciente.setProfissao(pacienteRequest.profissao());

            pacienteRepository.save(paciente);

            return paraDTO(paciente);

    }

    //READ
    public List<PacienteResponse>listar(){
                return pacienteRepository.findAll().stream().map(this::paraDTO).collect(Collectors.toList());

    }

    //READ BY DATE
    public List<PacienteResponse>buscarPorDataNascimento(LocalDate dataNascimento){
        // 1. Busca a lista no banco
    List<PacienteEntity> pacientes = pacienteRepository.findByDataNascimento(dataNascimento);

    // 2. Transforma a lista de Entidades em lista de DTOs (Response)
    return pacientes.stream()
            .map(this::paraDTO) // Usa aquele método auxiliar que criamos
            .collect(Collectors.toList());
    }

    //UPDATE
    public PacienteResponse atualizar(PacienteRequest pacienteRequest, Long idPaciente){
        // 1. Busca o paciente existente pelo ID (Garantia de segurança)
        // O .get() extrai o objeto. Se não existir, o Java lança NoSuchElementException
        PacienteEntity pacienteExistente = pacienteRepository.findById(idPaciente).get();

        // 2. Atualiza os campos com os novos dados do Request
        pacienteExistente.setNome(pacienteRequest.nome());
        pacienteExistente.setCPF(pacienteRequest.CPF());
        pacienteExistente.setCelular(pacienteRequest.celular());
        pacienteExistente.setEmail(pacienteRequest.email());
        pacienteExistente.setDataNascimento(pacienteRequest.dataNascimento());
        pacienteExistente.setEndereco(pacienteRequest.endereco());
        pacienteExistente.setEstadoCivil(pacienteRequest.estadoCivil());
        pacienteExistente.setNumeroProntuario(pacienteRequest.numeroProntuario());
        pacienteExistente.setProfissao(pacienteRequest.profissao());
        
        
        pacienteRepository.save(pacienteExistente);

        // 4. Retorna o DTO atualizado
        return paraDTO(pacienteExistente);



    
}

//DELETE
public void deletar (Long idPaciente ){
    if (pacienteRepository.existsById(idPaciente)) {
            pacienteRepository.deleteById(idPaciente);
        } else {
            throw new RuntimeException("Paciente não encontrado para exclusão.");
        }

}

private PacienteResponse paraDTO(PacienteEntity paciente) {
    return new PacienteResponse(
        paciente.getIdPaciente(),
        paciente.getNome(),
        paciente.getDataNascimento(),
        paciente.getCPF(),
        paciente.getNumeroProntuario(),
        paciente.getEstadoCivil(),
        paciente.getEmail(),
        paciente.getCelular(),
        paciente.getProfissao(),
        paciente.getConsultas() 
    );
}
}
