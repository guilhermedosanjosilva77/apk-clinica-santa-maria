package com.clinica.santamaria.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.clinica.santamaria.Dto.ExamesRequest;
import com.clinica.santamaria.Dto.ExamesResponse;
import com.clinica.santamaria.Dto.PacienteSimplificado;
import com.clinica.santamaria.Entity.ExamesEntity;
import com.clinica.santamaria.Entity.PacienteEntity;
import com.clinica.santamaria.Repository.ExamesRepository;
import com.clinica.santamaria.Repository.PacienteRepository;

@Service
public class ExamesService {

    private final ExamesRepository examesRepository;
    private final PacienteRepository pacienteRepository;

    public ExamesService(ExamesRepository examesRepository, PacienteRepository pacienteRepository) {
        this.examesRepository = examesRepository;
        this.pacienteRepository = pacienteRepository;
    }

    // CREATE
    public ExamesResponse criar(ExamesRequest examesRequest){
        ExamesEntity exame = new ExamesEntity();
        PacienteEntity paciente = pacienteRepository.findById(examesRequest.pacienteEntity()).orElseThrow(()-> new RuntimeException("Erro ao buscar id"));

        if (paciente != null) {
            exame.setDataChegada(examesRequest.dataChegada());
            exame.setDataColeta(examesRequest.dataColeta());
            exame.setPacienteEntity(paciente);
            
        }

        examesRepository.save(exame);

        return paraDTO(exame);
    }

    // READ
    public List<ExamesResponse> listarTodos() {
        return examesRepository.findAll().stream()
                .map(this::paraDTO)
                .collect(Collectors.toList());
    }

    // READ BY ID
    public ExamesResponse buscarPorId(Long id) {
        // Busca o exame ou lança erro se não existir
        ExamesEntity exame = examesRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exame com ID " + id + " não encontrado."));

        return paraDTO(exame);
    }

    // UPDATE
    public ExamesResponse atualizar(Long examesId, ExamesRequest examesRequest) {
        ExamesEntity exame = examesRepository.findById(examesId)
                .orElseThrow(() -> new RuntimeException("Exame não encontrado para atualização."));

        exame.setDataChegada(examesRequest.dataChegada());
        exame.setDataColeta(examesRequest.dataColeta());

        // 3. Se precisar trocar o paciente, buscamos o novo ID enviado no Request
        if (examesRequest.pacienteEntity() != null) {
            PacienteEntity novoPaciente = pacienteRepository.findById(examesRequest.pacienteEntity())
                    .orElseThrow(() -> new RuntimeException("Novo paciente não encontrado."));
            exame.setPacienteEntity(novoPaciente);
        }

        // 4. Salva a entidade atualizada
        examesRepository.save(exame);

        return paraDTO(exame);
    }

    // DELETE
    public void deletar(Long examesId) {
        // Verifica se existe antes de deletar para evitar erros silenciosos
        if (!examesRepository.existsById(examesId)) {
            throw new RuntimeException("Não foi possível deletar: Exame não encontrado.");
        }
        examesRepository.deleteById(examesId);
    }

private ExamesResponse paraDTO(ExamesEntity exame) {

     PacienteSimplificado pacienteSimplificado = new PacienteSimplificado(
            exame.getPacienteEntity().getIdPaciente(),
            exame.getPacienteEntity().getNome(),
            exame.getPacienteEntity().getNumeroProntuario(),
            exame.getPacienteEntity().getDataNascimento()
        );
    return new ExamesResponse(
    exame.getExamesId(),
    exame.getDataColeta(),   // primeiro coleta
    exame.getDataChegada(),  // depois chegada
    pacienteSimplificado
);
}

}
