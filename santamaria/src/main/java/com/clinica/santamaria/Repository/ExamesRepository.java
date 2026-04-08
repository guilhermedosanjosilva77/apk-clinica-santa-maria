package com.clinica.santamaria.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.clinica.santamaria.Entity.ExamesEntity;

public interface ExamesRepository extends JpaRepository <ExamesEntity,Long> {
    
}
