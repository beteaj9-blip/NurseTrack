package edu.cit.nursetracker.schedule;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schedules")
@RequiredArgsConstructor

public class ScheduleController {

    private final ScheduleService scheduleService;

    @PostMapping
    public ResponseEntity<Schedule> assignSchedule(@RequestBody Schedule schedule) {
        return ResponseEntity.ok(scheduleService.assignSchedule(schedule));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Schedule>> getStudentSchedules(@PathVariable Long studentId) {
        return ResponseEntity.ok(scheduleService.getStudentSchedules(studentId));
    }

    @GetMapping("/instructor/{instructorId}")
    public ResponseEntity<List<Schedule>> getInstructorSchedules(@PathVariable Long instructorId) {
        return ResponseEntity.ok(scheduleService.getInstructorSchedules(instructorId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> unassignSchedule(@PathVariable Long id) {
        scheduleService.unassignSchedule(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/all")
    public ResponseEntity<List<Schedule>> getAllSchedules() {
        return ResponseEntity.ok(scheduleService.getAllSchedules());
    }
}
