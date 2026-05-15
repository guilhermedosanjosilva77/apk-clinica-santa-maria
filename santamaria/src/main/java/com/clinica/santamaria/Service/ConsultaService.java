package com.clinica.santamaria.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
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

        // 1. Resolve o paciente (por ID ou pré-cadastro)
        if (consultaRequest.paciente() != null) {
            paciente = pacienteRepository.findById(consultaRequest.paciente())
                    .orElseThrow(() -> new RuntimeException("Erro ao encontrar ID"));
        } else {
            paciente = new PacienteEntity();
            paciente.setNome(consultaRequest.nome());
            paciente.setDataNascimento(consultaRequest.dataNascimento());
            paciente.setDataCadastro(LocalDate.now());
            paciente = pacienteRepository.save(paciente);
        }
        // 2. Determina o retorno com regra de 30 dias
        String retornoCalculado;

        ConsultaEntity ultimaConsulta =
                consultaRepository.findTopByPacienteEntityOrderByDataConsultaDesc(paciente);

        if (ultimaConsulta == null) {
            retornoCalculado = "0";
        } else {

            String retornoUltima = ultimaConsulta.getRetorno();
            LocalDate dataUltima = ultimaConsulta.getDataConsulta();
            LocalDate dataNova = consultaRequest.dataConsulta();

            long dias = ChronoUnit.DAYS.between(dataUltima, dataNova);

            if ("0".equals(retornoUltima) && dias <= 30 && dias >= 0) {
                retornoCalculado = "1";
            } else {
                retornoCalculado = "0";
            }
        }

        // 3. Salva a consulta
        ConsultaEntity consultaEntity = new ConsultaEntity();
        consultaEntity.setPacienteEntity(paciente);
        consultaEntity.setDataConsulta(consultaRequest.dataConsulta());
        consultaEntity.setRetorno(retornoCalculado);
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

    //READ BY HORARIO
    public List<ConsultaResponse> buscarPorHorarioConsulta (String horario){
        List<ConsultaEntity> horarioConsulta = consultaRepository.findByHorario(horario);

         return horarioConsulta.stream()
                .map(this::paraDTO) 
                .collect(Collectors.toList());
    }

    public ConsultaResponse atualizar(Long id, ConsultaRequest request) {
        ConsultaEntity consulta = consultaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Consulta não encontrada"));

        consulta.setDataConsulta(request.dataConsulta());
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
            consulta.getPacienteEntity().getNumeroProntuario(),
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