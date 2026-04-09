package com.clinica.santamaria.Controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.clinica.santamaria.Dto.ExamesRequest;
import com.clinica.santamaria.Dto.ExamesResponse;
import com.clinica.santamaria.Service.ExamesService;

@RestController
@RequestMapping(value = "exames")
public class ExamesController {
    private final ExamesService examesService;

    public ExamesController(ExamesService examesService) {
        this.examesService = examesService;
    }

    // Criar novo exame
    @PostMapping
    public ExamesResponse criar(@RequestBody ExamesRequest request) {
        return examesService.criar(request);
    }

    // Listar todos os exames
    @GetMapping
    public List<ExamesResponse> listar() {
        return examesService.listarTodos();
    }

    // Buscar exame por ID (Ex: /exames/1)
    @GetMapping("/{examesId}")
    public ExamesResponse buscarPorId(@PathVariable Long examesId) {
        return examesService.buscarPorId(examesId);
    }

    // Atualizar exame (Ex: /exames/1)
    @PutMapping("/{examesId}")
    public ExamesResponse atualizar(@PathVariable Long examesId, @RequestBody ExamesRequest request) {
        return examesService.atualizar(examesId, request);
    }

    // Deletar exame (Ex: /exames/1)
    @DeleteMapping("/{examesID}")
    public void deletar(@PathVariable Long examesId) {
        examesService.deletar(examesId);
    }
}
    

