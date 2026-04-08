package com.clinica.santamaria.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.clinica.santamaria.Dto.ConsultaRequest;
import com.clinica.santamaria.Dto.ConsultaResponse;
import com.clinica.santamaria.Dto.PacienteSimplificado;
import com.clinica.santamaria.Entity.ConsultaEntity;
import com.clinica.santamaria.Entity.PacienteEntity;
import com.clinica.santamaria.Repository.ConsultaRepository;
import com.clinica.santamaria.Repository.PacienteRepository;

@Service
public class ConsultaService {

    ConsultaRepository consultaRepository;
    PacienteRepository pacienteRepository;

    public ConsultaService(ConsultaRepository consultaRepository, PacienteRepository pacienteRepository) {
        this.consultaRepository = consultaRepository;
        this.pacienteRepository = pacienteRepository;
    }

    //CREATE
    public ConsultaResponse criar(ConsultaRequest consultaRequest){
        PacienteEntity paciente;

        //Quando id vem é buscado no banco de dados
        if (consultaRequest.paciente() != null) {
            paciente = pacienteRepository.findById(consultaRequest.paciente())
                    .orElseThrow(() -> new RuntimeException("Erro ao encontrar ID"));
        }
        else {
            //Se nao encontrado é feito um pré cadastro da paciente
            paciente = new PacienteEntity();
            paciente.setNome(consultaRequest.nome());
            paciente.setDataNascimento(consultaRequest.dataNascimento());
            paciente.setDataCadastro(LocalDate.now());
            paciente = pacienteRepository.save(paciente);
        }

        //Logica que impede ter mais de 1 retornos por consulta
        if (consultaRequest.retorno() != null && !consultaRequest.retorno().isBlank()) {
            if (Integer.parseInt(consultaRequest.retorno()) > 1) {
                throw new RuntimeException("Não é possível agendar: limite de 1 retornos excedido.");
            }
        }

        if (consultaRequest.paciente() != null) {
            System.out.println("DEBUG: Buscando paciente com ID: " + consultaRequest.paciente());
            
            paciente = pacienteRepository.findById(consultaRequest.paciente())
                .orElseThrow(() -> {
                    System.out.println("DEBUG: ID " + consultaRequest.paciente() + " NÃO foi encontrado no banco.");
                    return new RuntimeException("Erro ao encontrar ID: " + consultaRequest.paciente());
                });
            
            System.out.println("DEBUG: Paciente encontrado: " + paciente.getNome());
        }

        //Salvar a consulta
        ConsultaEntity consultaEntity = new ConsultaEntity();
        consultaEntity.setPacienteEntity(paciente);
        consultaEntity.setDataConsulta(consultaRequest.dataConsulta());
        consultaEntity.setRetorno(consultaRequest.retorno());
        consultaEntity.setConsultaPreNatal(consultaRequest.consultaPreNatal());
        consultaEntity.setHorario(consultaRequest.horario());
  
        consultaRepository.save(consultaEntity);

        return paraDTO(consultaEntity);
    }

    //READ
    public List<ConsultaResponse> buscar(){
        return consultaRepository.findAll().stream()
            .map(this::paraDTO)
            .collect(Collectors.toList());
    }

    //READ BY DATA CONSULTA
    public List<ConsultaResponse> buscarPorDataDeConsulta (LocalDate dataCadastro){
        List<ConsultaEntity> dataConsulta = consultaRepository.findByDataConsulta(dataCadastro);

        return dataConsulta.stream()
                .map(this::paraDTO) 
                .collect(Collectors.toList());
    }

    public ConsultaResponse atualizar(Long id, ConsultaRequest request) {
        // 1. Verifica se a consulta existe
        ConsultaEntity consulta = consultaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Consulta não encontrada"));

        // 2. Validação do limite de retorno
        if (request.retorno() != null && !request.retorno().isBlank()) {
            if (Integer.parseInt(request.retorno()) > 2) {
                throw new RuntimeException("Não é possível atualizar: limite de 2 retornos excedido.");
            }
        }

        // 3. Atualiza os dados da Consulta
        consulta.setDataConsulta(request.dataConsulta());
        consulta.setRetorno(request.retorno());
        consulta.setConsultaPreNatal(request.consultaPreNatal());
        consulta.setHorario(request.horario());

        consultaRepository.save(consulta);

        return paraDTO(consulta);
    }

    //DELETE
    public void deletar(Long idConsulta){
        consultaRepository.deleteById(idConsulta);
    }

    private ConsultaResponse paraDTO(ConsultaEntity consulta) {
        PacienteSimplificado pacienteSimplificado = new PacienteSimplificado(
            consulta.getPacienteEntity().getIdPaciente(),
            consulta.getPacienteEntity().getNome(),
            consulta.getPacienteEntity().getDataNascimento()
        );

        return new ConsultaResponse(
            consulta.getConsultaID(),
            consulta.getDataConsulta(),
            consulta.isConsultaPreNatal(),
            consulta.getRetorno(),
            pacienteSimplificado,
            consulta.getHorario()
        );
    }
}