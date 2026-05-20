package edu.cit.nursetracker;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.time.LocalDate;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/system")

public class SystemInfoController {

    @Autowired
    private SystemInfoRepository repository;

    @GetMapping("/info")
    public ResponseEntity<SystemInfo> getSystemInfo() {
        List<SystemInfo> allInfo = repository.findAll();
        if (allInfo.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(allInfo.get(0));
    }

    @GetMapping("/about")
    public ResponseEntity<SystemInfo> getAboutInfo() {
        SystemInfo info = repository.findFirstByOrderByIdAsc().orElseGet(() -> {
            SystemInfo created = new SystemInfo("1.0", LocalDate.of(2026, 4, 28));
            created.setName("NurseTrack");
            created.setOrganization("CIT-U Nursing");
            created.setReleaseVersion("Version 1.0");
            created.setReleaseDate(LocalDate.of(2026, 4, 28));
            created.setStatusMessage("System information is up to date.");
            created.setUpdatedAt(LocalDateTime.now());
            return repository.save(created);
        });

        boolean changed = false;
        if (info.getName() == null || info.getName().isBlank()) { info.setName("NurseTrack"); changed = true; }
        if (info.getOrganization() == null || info.getOrganization().isBlank()) { info.setOrganization("CIT-U Nursing"); changed = true; }
        if (info.getReleaseVersion() == null || info.getReleaseVersion().isBlank()) { info.setReleaseVersion("Version " + info.getVersion()); changed = true; }
        if (info.getReleaseDate() == null) { info.setReleaseDate(info.getLastUpdated()); changed = true; }
        if (info.getStatusMessage() == null || info.getStatusMessage().isBlank()) { info.setStatusMessage("System information is up to date."); changed = true; }
        if (info.getUpdatedAt() == null) { info.setUpdatedAt(LocalDateTime.now()); changed = true; }

        return ResponseEntity.ok(changed ? repository.save(info) : info);
    }
}
