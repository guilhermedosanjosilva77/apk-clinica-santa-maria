package com.clinica.santamaria.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.clinica.santamaria.Dto.ConsultaRequest;
import com.clinica.santamaria.Dto.ConsultaResponse;
import com.clinica.santamaria.Entity.PacienteEntity;
import com.clinica.santamaria.Repository.ConsultaRepository;
import com.clinica.santamaria.Repository.PacienteRepository;

@Service
public class ConsultaService {

    ConsultaRepository consultaRepository;
    PacienteRepository pacienteRepository;

    public ConsultaService(ConsultaRepository consultaRepository, PacienteRepository pacienteRepository) {
        this.consultaRepository = consultaRepository;
        this.pacienteRepository = pacienteRepository;
    }

    //CREATE
    public ConsultaResponse criar(ConsultaRequest consultaRequest){
        PacienteEntity paciente;

        if (consultaRequest.paciente() != null) {
            paciente = pacienteRepository.findById(consultaRequest.paciente())
            
        }

    }
    
}
