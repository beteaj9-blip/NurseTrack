package edu.cit.nursetracker;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
public class HealthController {

    @CrossOrigin(origins = "*")
    @GetMapping({"/health", "/api/health"})
    public Map<String, Object> health() {
        return Map.of(
                "status", "ok",
                "service", "nursetracker-api",
                "timestamp", Instant.now().toString()
        );
    }
}
