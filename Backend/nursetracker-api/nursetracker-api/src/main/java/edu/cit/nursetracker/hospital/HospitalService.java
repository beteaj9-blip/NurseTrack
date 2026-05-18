package edu.cit.nursetracker.hospital;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class HospitalService {

    private final HospitalRepository hospitalRepository;

    @Transactional(readOnly = true)
    public List<Hospital> getAllHospitals() {
        return hospitalRepository.findAll().stream().map(this::responseCopy).toList();
    }

    public Hospital createHospital(Hospital hospital) {
        Hospital incoming = normalize(hospital);
        return hospitalRepository.findByNameIgnoreCase(incoming.getName())
                .map(existing -> {
                    existing.setFullName(incoming.getFullName());
                    existing.setLabel(incoming.getLabel());
                    existing.setAddress(incoming.getAddress());
                    existing.setActive(true);
                    existing.setWards(merge(existing.getWards(), incoming.getWards()));
                    existing.setInactiveWards(removeAll(existing.getInactiveWards(), existing.getWards()));
                    return hospitalRepository.save(normalize(existing));
                })
                .orElseGet(() -> hospitalRepository.save(incoming));
    }

    public Hospital updateHospital(Long id, Hospital updates) {
        Hospital hospital = hospitalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hospital not found with id: " + id));
        Boolean requestedActive = updates.getActive();
        Hospital normalizedUpdates = normalize(updates);
        hospital.setName(normalizedUpdates.getName());
        hospital.setFullName(normalizedUpdates.getFullName());
        hospital.setLabel(normalizedUpdates.getLabel());
        hospital.setAddress(normalizedUpdates.getAddress());
        hospital.setActive(requestedActive == null ? hospital.getActive() : requestedActive);
        hospital.setWards(normalizedUpdates.getWards());
        hospital.setInactiveWards(removeAll(normalizedUpdates.getInactiveWards(), normalizedUpdates.getWards()));
        return hospitalRepository.save(normalize(hospital));
    }

    public void deleteHospital(Long id) {
        Hospital hospital = hospitalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hospital not found with id: " + id));
        hospital.setActive(false);
        hospitalRepository.save(normalize(hospital));
    }

    public void addWard(Long hospitalId, String wardName) {
        Hospital hospital = hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new RuntimeException("Hospital not found with id: " + hospitalId));
        String cleanWardName = wardName == null ? "" : wardName.trim();
        if (cleanWardName.isBlank()) {
            throw new IllegalArgumentException("Ward name is required");
        }
        if (containsIgnoreCase(hospital.getWards(), cleanWardName)) {
            throw new IllegalStateException("Duty area already exists for this hospital.");
        }
        if (containsIgnoreCase(hospital.getInactiveWards(), cleanWardName)) {
            throw new IllegalStateException("Duty area already exists but is deactivated. Reactivate it from the Duty Area List.");
        }
        hospital.setWards(merge(hospital.getWards(), List.of(cleanWardName)));
        hospital.setInactiveWards(removeAll(hospital.getInactiveWards(), List.of(cleanWardName)));
        hospitalRepository.save(normalize(hospital));
    }

    private Hospital responseCopy(Hospital hospital) {
        List<String> wards = cleanList(hospital.getWards());
        return new Hospital(
                hospital.getId(),
                hospital.getName() == null ? null : hospital.getName().trim().toUpperCase(),
                hospital.getFullName() == null ? null : hospital.getFullName().trim(),
                hospital.getLabel() == null || hospital.getLabel().isBlank() ? hospital.getFullName() : hospital.getLabel(),
                hospital.getAddress() == null || hospital.getAddress().isBlank() ? hospital.getFullName() : hospital.getAddress(),
                hospital.getActive() == null ? true : hospital.getActive(),
                wards,
                removeAll(cleanList(hospital.getInactiveWards()), wards)
        );
    }

    private Hospital normalize(Hospital hospital) {
        if (hospital.getName() != null) hospital.setName(hospital.getName().trim().toUpperCase());
        if (hospital.getFullName() != null) hospital.setFullName(hospital.getFullName().trim());
        if (hospital.getLabel() == null || hospital.getLabel().isBlank()) hospital.setLabel(hospital.getFullName());
        if (hospital.getAddress() == null || hospital.getAddress().isBlank()) hospital.setAddress(hospital.getFullName() == null || hospital.getFullName().isBlank() ? hospital.getName() : hospital.getFullName());
        if (hospital.getActive() == null) hospital.setActive(true);
        hospital.setWards(cleanList(hospital.getWards()));
        hospital.setInactiveWards(removeAll(cleanList(hospital.getInactiveWards()), hospital.getWards()));
        return hospital;
    }

    private List<String> cleanList(List<String> values) {
        if (values == null) return new ArrayList<>();
        return values.stream()
                .filter(value -> value != null && !value.isBlank())
                .map(String::trim)
                .collect(java.util.stream.Collectors.collectingAndThen(java.util.stream.Collectors.toCollection(LinkedHashSet::new), ArrayList::new));
    }

    private List<String> merge(List<String> first, List<String> second) {
        List<String> merged = new ArrayList<>(cleanList(first));
        merged.addAll(cleanList(second));
        return cleanList(merged);
    }

    private List<String> removeAll(List<String> values, List<String> remove) {
        List<String> cleanRemove = cleanList(remove);
        return cleanList(values).stream()
                .filter(value -> cleanRemove.stream().noneMatch(item -> item.equalsIgnoreCase(value)))
                .collect(java.util.stream.Collectors.toCollection(ArrayList::new));
    }

    private boolean containsIgnoreCase(List<String> values, String target) {
        return cleanList(values).stream().anyMatch(value -> value.equalsIgnoreCase(target));
    }
}
