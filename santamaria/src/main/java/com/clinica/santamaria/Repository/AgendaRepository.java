package com.clinica.santamaria.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.clinica.santamaria.Entity.AgendaEntity;

public interface AgendaRepository extends JpaRepository <AgendaEntity,Long> {

    
} 
