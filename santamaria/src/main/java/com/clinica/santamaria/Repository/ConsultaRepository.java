package com.clinica.santamaria.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.clinica.santamaria.Entity.ConsultaEntity;
import java.util.List;
import java.time.LocalDate;


public interface ConsultaRepository extends JpaRepository <ConsultaEntity,Long> {

List<ConsultaEntity> findByDataConsulta(LocalDate dataConsulta);
}
