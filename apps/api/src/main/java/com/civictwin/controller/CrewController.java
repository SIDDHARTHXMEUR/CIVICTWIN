package com.civictwin.controller;

import com.civictwin.model.Crew;
import com.civictwin.repository.CrewRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/crews")
@Tag(name = "Crews", description = "Emergency Crew Unit Registry Endpoints")
public class CrewController {

    private final CrewRepository crewRepository;

    public CrewController(CrewRepository crewRepository) {
        this.crewRepository = crewRepository;
    }

    @GetMapping
    @Operation(summary = "Get all municipal emergency response crew units")
    public List<Crew> getCrews() {
        return crewRepository.findAll();
    }
}
