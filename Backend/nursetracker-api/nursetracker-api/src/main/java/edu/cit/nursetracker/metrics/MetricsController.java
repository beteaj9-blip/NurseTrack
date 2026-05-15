package edu.cit.nursetracker.metrics;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/metrics")
@RequiredArgsConstructor
public class MetricsController {

    private final MetricsService metricsService;

    @GetMapping("/overall")
    public ResponseEntity<MetricsDto> getOverallMetrics() {
        return ResponseEntity.ok(metricsService.getOverallMetrics());
    }
}
