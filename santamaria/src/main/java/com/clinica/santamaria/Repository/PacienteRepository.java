package com.clinica.santamaria.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.clinica.santamaria.Entity.PacienteEntity;

public interface PacienteRepository extends JpaRepository<PacienteEntity,Long> {

    
}
