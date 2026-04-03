package com.clinica.santamaria.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.clinica.santamaria.Entity.ConsultaEntity;

public interface ConsultaRepository extends JpaRepository <ConsultaEntity,Long> {
    
}
