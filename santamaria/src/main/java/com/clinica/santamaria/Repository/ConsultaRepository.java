package com.clinica.santamaria.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.clinica.santamaria.Entity.ConsultaEntity;
import com.clinica.santamaria.Entity.PacienteEntity;
import java.util.List;
import java.time.LocalDate;


public interface ConsultaRepository extends JpaRepository<ConsultaEntity, Long> {

    List<ConsultaEntity> findByDataConsulta(LocalDate dataConsulta);

    List<ConsultaEntity> findByHorario(String horario);

    // Busca todas as consultas de um paciente — usado para calcular retorno automático
    List<ConsultaEntity> findByPacienteEntity(PacienteEntity pacienteEntity);

    ConsultaEntity findTopByPacienteEntityOrderByDataConsultaDesc(PacienteEntity paciente);
}