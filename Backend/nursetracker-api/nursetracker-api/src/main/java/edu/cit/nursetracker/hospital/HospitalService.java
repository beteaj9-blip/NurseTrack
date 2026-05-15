package edu.cit.nursetracker.hospital;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HospitalService {

    private final HospitalRepository hospitalRepository;

    public List<Hospital> getAllHospitals() {
        return hospitalRepository.findAll();
    }

    public Hospital createHospital(Hospital hospital) {
        return hospitalRepository.save(hospital);
    }

    public void deleteHospital(Long id) {
        hospitalRepository.deleteById(id);
    }
}
