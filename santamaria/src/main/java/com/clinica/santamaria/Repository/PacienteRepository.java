package com.clinica.santamaria.Repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.clinica.santamaria.Entity.PacienteEntity;

public interface PacienteRepository extends JpaRepository<PacienteEntity,Long> {
        //BUSCA TODOS OS PACIENTES PELA DATA DE NASCIMENTO
        List<PacienteEntity>findByDataNascimento (LocalDate dataNascimento);


    
}
