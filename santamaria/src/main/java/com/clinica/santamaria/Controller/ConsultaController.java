package com.clinica.santamaria.Controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.clinica.santamaria.Dto.ConsultaRequest;
import com.clinica.santamaria.Dto.ConsultaResponse;
import com.clinica.santamaria.Service.ConsultaService;

import jakarta.validation.Valid;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;



@RestController
@RequestMapping (value = "consulta")
public class ConsultaController {

    private final ConsultaService consultaService;

    public ConsultaController(ConsultaService consultaService ) {
        this.consultaService = consultaService;
    }

    //POST
    @PostMapping
    public ConsultaResponse criar(@RequestBody @Valid ConsultaRequest consultaRequest) {
        
        return consultaService.criar(consultaRequest);
    }

    //GET
    @GetMapping
    public List<ConsultaResponse> listar() {
        return consultaService.buscar();
    }

    //GET BY DATA CONSULTA
    @GetMapping("/buscar")
    public List<ConsultaResponse> buscarPorDataConsulta(@RequestParam("data") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataCadastro) {
        return consultaService.buscarPorDataDeConsulta(dataCadastro);
    }

    //POST
    @PostMapping("/{consultaID}")
    public ConsultaResponse atualizar(@RequestBody ConsultaRequest consultaRequest, @PathVariable Long consultaID) {
        //TODO: process POST request
        
        return consultaService.atualizar(consultaID, consultaRequest);
    }

    //DELETE
    @DeleteMapping
    public void deletar(@PathVariable Long consultaID){
        consultaService.deletar(consultaID);
    }
    
    
    


}
