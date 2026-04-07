package com.clinica.santamaria.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.clinica.santamaria.Entity.AgendaEntity;

public interface AgendaRepository extends JpaRepository <AgendaEntity,Long> {

    List<AgendaEntity> findByPacienteIdPaciente(Long idPaciente);

    
} 
