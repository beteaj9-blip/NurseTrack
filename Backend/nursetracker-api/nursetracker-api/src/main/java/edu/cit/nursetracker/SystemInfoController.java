package edu.cit.nursetracker;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/system")

public class SystemInfoController {

    @Autowired
    private SystemInfoRepository repository;

    @GetMapping("/info")
    public SystemInfo getSystemInfo() {
        List<SystemInfo> allInfo = repository.findAll();
        if (allInfo.isEmpty()) {
            // Auto-create a default initial row so the DB has something to pull
            SystemInfo defaultInfo = new SystemInfo("1.0", LocalDate.of(2026, 4, 26));
            return repository.save(defaultInfo);
        }
        // Assuming they manually edit row ID 1
        return allInfo.get(0);
    }
}
