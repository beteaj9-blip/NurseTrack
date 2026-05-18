package edu.cit.nursetracker.hospital;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hospitals")
@RequiredArgsConstructor

public class HospitalController {

    private final HospitalService hospitalService;

    @GetMapping
    public ResponseEntity<List<Hospital>> getAllHospitals() {
        return ResponseEntity.ok(hospitalService.getAllHospitals());
    }

    @PostMapping
    public ResponseEntity<Hospital> createHospital(@RequestBody Hospital hospital) {
        return ResponseEntity.ok(hospitalService.createHospital(hospital));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Hospital> updateHospital(@PathVariable Long id, @RequestBody Hospital hospital) {
        return ResponseEntity.ok(hospitalService.updateHospital(id, hospital));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHospital(@PathVariable Long id) {
        hospitalService.deleteHospital(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/wards")
    public ResponseEntity<?> addWard(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        try {
            hospitalService.addWard(id, payload.get("name"));
            return ResponseEntity.ok(Map.of("message", "Duty area saved to the hospital."));
        } catch (IllegalStateException exception) {
            return ResponseEntity.status(409).body(Map.of("message", exception.getMessage()));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(Map.of("message", exception.getMessage()));
        }
    }
}
