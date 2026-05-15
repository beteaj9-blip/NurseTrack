package edu.cit.nursetracker.hospital;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHospital(@PathVariable Long id) {
        hospitalService.deleteHospital(id);
        return ResponseEntity.ok().build();
    }
}
