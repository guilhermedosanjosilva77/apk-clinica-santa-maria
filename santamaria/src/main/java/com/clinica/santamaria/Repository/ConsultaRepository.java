package com.clinica.santamaria.Repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.clinica.santamaria.Entity.ConsultaEntity;
import com.clinica.santamaria.Entity.PacienteEntity;

public interface ConsultaRepository extends JpaRepository <ConsultaEntity,Long> {

    List<PacienteEntity>findByDataNascimento(LocalDate dataNascimento);
    
}
