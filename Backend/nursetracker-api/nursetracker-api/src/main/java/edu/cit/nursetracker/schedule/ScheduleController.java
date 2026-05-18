package edu.cit.nursetracker.schedule;

import lombok.RequiredArgsConstructor;
import edu.cit.nursetracker.user.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schedules")
@RequiredArgsConstructor

public class ScheduleController {

    private final ScheduleService scheduleService;
    private final ScheduleImportService scheduleImportService;
    private final JwtService jwtService;

    @PostMapping
    public ResponseEntity<Schedule> assignSchedule(@RequestBody Schedule schedule) {
        return ResponseEntity.ok(scheduleService.assignSchedule(schedule));
    }

    @PostMapping("/import/preview")
    public ResponseEntity<ScheduleImportPreview> previewScheduleImport(@RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        return ResponseEntity.ok(scheduleImportService.preview(file));
    }

    @PostMapping("/import/publish")
    public ResponseEntity<ScheduleImportResult> publishScheduleImport(@RequestBody ScheduleImportPreview preview) {
        return ResponseEntity.ok(scheduleImportService.publish(preview));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Schedule>> getStudentSchedules(@PathVariable Long studentId) {
        return ResponseEntity.ok(scheduleService.getStudentSchedules(studentId));
    }

    @GetMapping("/student")
    public ResponseEntity<List<Schedule>> getCurrentStudentSchedules(HttpServletRequest request) {
        return ResponseEntity.ok(scheduleService.getStudentSchedules(jwtService.getUserId(request)));
    }

    @GetMapping("/instructor/{instructorId}")
    public ResponseEntity<List<Schedule>> getInstructorSchedules(@PathVariable Long instructorId) {
        return ResponseEntity.ok(scheduleService.getInstructorSchedules(instructorId));
    }

    @GetMapping("/instructor")
    public ResponseEntity<List<Schedule>> getCurrentInstructorSchedules(HttpServletRequest request) {
        return ResponseEntity.ok(scheduleService.getInstructorSchedules(jwtService.getUserId(request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> unassignSchedule(@PathVariable Long id) {
        scheduleService.unassignSchedule(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Schedule> updateSchedule(@PathVariable Long id, @RequestBody Schedule schedule) {
        return ResponseEntity.ok(scheduleService.updateSchedule(id, schedule));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Schedule>> getAllSchedules(HttpServletRequest request) {
        return ResponseEntity.ok(scheduleService.getSchedulesForViewer(jwtService.getUserId(request)));
    }
}
