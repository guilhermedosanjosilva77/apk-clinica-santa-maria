package com.clinica.santamaria.Controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.clinica.santamaria.Dto.PacienteRequest;
import com.clinica.santamaria.Dto.PacienteResponse;
import com.clinica.santamaria.Service.PacienteService;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;




@RestController
@RequestMapping(name = "/paciente")

public class PacienteController {

    PacienteService pacienteService;

    

public PacienteController(PacienteService pacienteService) {
        this.pacienteService = pacienteService;
    }



//POST
@PostMapping
public PacienteResponse postMethodName(@RequestBody @Valid PacienteRequest pacienteRequest) {
    
    return pacienteService.criar(pacienteRequest);
}

//GET
@GetMapping
public List<PacienteResponse>listar() {
    return pacienteService.listar();
}

//GET BY DATE
@GetMapping("/buscar")
public List<PacienteResponse>buscarPorData(@RequestParam("data") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {
    return pacienteService.buscarPorDataNascimento(data);
}

//PUT
@PutMapping("/{idPaciente}")
public PacienteResponse atualizar(@PathVariable Long idPaciente, @RequestBody PacienteRequest pacienteRequest) {
    
    return pacienteService.atualizar(pacienteRequest, idPaciente);
}

//DELETE
@DeleteMapping("/{idPaciente}")
public void deletar(Long idPaciente){
    pacienteService.deletar(idPaciente);


}




    
}
