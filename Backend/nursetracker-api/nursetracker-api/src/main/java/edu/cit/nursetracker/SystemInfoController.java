package edu.cit.nursetracker;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

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
}
