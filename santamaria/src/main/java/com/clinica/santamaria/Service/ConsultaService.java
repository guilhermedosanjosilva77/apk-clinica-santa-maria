package com.clinica.santamaria.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.clinica.santamaria.Dto.ConsultaRequest;
import com.clinica.santamaria.Dto.ConsultaResponse;
import com.clinica.santamaria.Dto.PacienteSimplificado;
import com.clinica.santamaria.Entity.AgendaEntity;
import com.clinica.santamaria.Entity.ConsultaEntity;
import com.clinica.santamaria.Entity.PacienteEntity;
import com.clinica.santamaria.Enum.Status;
import com.clinica.santamaria.Repository.AgendaRepository;
import com.clinica.santamaria.Repository.ConsultaRepository;
import com.clinica.santamaria.Repository.PacienteRepository;

@Service
public class ConsultaService {

    ConsultaRepository consultaRepository;
    PacienteRepository pacienteRepository;
    AgendaRepository agendaRepository;

    public ConsultaService(ConsultaRepository consultaRepository, PacienteRepository pacienteRepository, AgendaRepository agendaRepository) {
        this.consultaRepository = consultaRepository;
        this.pacienteRepository = pacienteRepository;
        this.agendaRepository = agendaRepository;
    }

    //CREATE
    public ConsultaResponse criar(ConsultaRequest consultaRequest){
        PacienteEntity paciente;

        //Quando id vem é buscado no banco de dados
        if (consultaRequest.paciente() != null) {
            paciente = pacienteRepository.findById(consultaRequest.paciente()).orElseThrow(() -> new RuntimeException("Erro ao encontrar ID"));
            
        }
        else{
        
        //Se nao encontrado é feito um pré cadastro da paciente
        paciente = new PacienteEntity();
        paciente.setNome(consultaRequest.nome());
        paciente.setDataNascimento(consultaRequest.dataNascimento());
        paciente.setDataCadastro(LocalDate.now());
        paciente = pacienteRepository.save(paciente);
        }

        //Logica que impede ter mais de 2 retornos por consulta
        if (consultaRequest.retorno() != null && !consultaRequest.retorno().isBlank()) {
        if (Integer.parseInt(consultaRequest.retorno()) > 2) {
            throw new RuntimeException("Não é possível agendar: limite de 2 retornos excedido.");
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

        //Já salva automaticamente na agenda
        AgendaEntity agenda = new AgendaEntity();
        agenda.setPaciente(paciente);
        agenda.setNome(paciente.getNome());
        agenda.setDataNascimento(paciente.getDataNascimento());
        agenda.setTipoConsulta(consultaRequest.tipoConsulta());
        agenda.setDataAgendamento(consultaRequest.dataConsulta());
        agenda.setStatus(Status.Pendente);

        agendaRepository.save(agenda);

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

    // 2. Validação do limite de retorno (mesma lógica do criar)
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

    // Sincroniza com a Agenda
    // Busca o item na agenda vinculado a este paciente e (opcionalmente) a esta data
    // Aqui vamos buscar pela relação com o paciente
    List<AgendaEntity> agendamentos = agendaRepository.findByPacienteIdPaciente(consulta.getPacienteEntity().getIdPaciente());
    
    if (!agendamentos.isEmpty()) {
        // Pegamos o agendamento mais recente ou o que coincida com a lógica da clínica
        AgendaEntity agenda = agendamentos.get(0); 
        agenda.setTipoConsulta(request.tipoConsulta());
        agenda.setDataAgendamento(request.dataConsulta());
        
        agendaRepository.save(agenda);
    }

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
       consulta.getConsultaID(),      // Long
        consulta.getDataConsulta(),    // LocalDate
        consulta.isConsultaPreNatal(), // boolean
        consulta.getRetorno(),         // String
        pacienteSimplificado,          // O Record que criamos acima
        consulta.getHorario()          // Strin

    );
}

    
}
