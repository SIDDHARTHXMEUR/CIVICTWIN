package com.civictwin;

import com.civictwin.controller.IncidentController;
import com.civictwin.security.JwtTokenProvider;
import com.civictwin.service.IncidentService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
class IncidentControllerMockMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private IncidentService incidentService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @Test
    @DisplayName("Test GET /api/incidents returns 200 OK")
    void testGetIncidents() throws Exception {
        given(incidentService.getAllActiveIncidents()).willReturn(Collections.emptyList());

        mockMvc.perform(get("/api/incidents"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Test POST /api/incidents intake creates new report")
    void testCreateIncident() throws Exception {
        given(incidentService.intakeReport(anyString(), anyString(), anyString(), anyDouble(), anyDouble(), anyString(), anyInt()))
                .willReturn(Map.of("merged", false));

        String body = """
                {
                    "category": "water",
                    "title": "Pipe Burst Near Station",
                    "description": "Severe water leakage on main road",
                    "lat": 26.9124,
                    "lng": 75.7873,
                    "location": "Jaipur Substation",
                    "severity": 8
                }
                """;

        mockMvc.perform(post("/api/incidents")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk());
    }
}
