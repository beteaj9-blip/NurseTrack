package edu.cit.nursetracker;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.jdbc.core.JdbcTemplate;

import java.time.Instant;
import java.util.Map;

@RestController
public class HealthController {

    private final JdbcTemplate jdbcTemplate;

    public HealthController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @CrossOrigin(origins = "*")
    @GetMapping({"/health", "/api/health"})
    public Map<String, Object> health() {
        return Map.of(
                "status", "ok",
                "service", "nursetracker-api",
                "timestamp", Instant.now().toString()
        );
    }

    @CrossOrigin(origins = "*")
    @GetMapping({"/db-health", "/api/db-health"})
    public Map<String, Object> dbHealth() {
        long start = System.currentTimeMillis();

        jdbcTemplate.queryForObject("SELECT 1", Integer.class);

        long dbTime = System.currentTimeMillis() - start;

        return Map.of(
                "status", "database ok",
                "dbResponseMs", dbTime
        );
    }
}
