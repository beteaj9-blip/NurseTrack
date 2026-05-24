package edu.cit.nursetracker.duty;

import lombok.RequiredArgsConstructor;
import edu.cit.nursetracker.user.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/duties")
@RequiredArgsConstructor

public class DutyController {

    private final DutyService dutyService;
    private final JwtService jwtService;

    @GetMapping("/attendance/today")
    public ResponseEntity<DutyAttendanceTodayResponse> getTodayAttendance(
            @RequestParam(required = false) Long scheduleId,
            HttpServletRequest request) {
        boolean isMobile = "mobile".equalsIgnoreCase(request.getHeader("X-Platform"));
        return ResponseEntity.ok(dutyService.getTodayAttendance(jwtService.getUserId(request), scheduleId, isMobile));
    }

    @PostMapping("/attendance/time-in")
    public ResponseEntity<DutyAttendanceTodayResponse> timeInForToday(
            @RequestBody(required = false) DutyAttendanceTimeInRequest timeInRequest,
            HttpServletRequest request) {
        Long scheduleId = timeInRequest != null ? timeInRequest.scheduleId() : null;
        return ResponseEntity.ok(dutyService.timeInForToday(jwtService.getUserId(request), scheduleId));
    }

    @PostMapping("/attendance/time-out")
    public ResponseEntity<DutyAttendanceTodayResponse> timeOutForToday(
            @RequestBody(required = false) DutyAttendanceScheduleRequest timeOutRequest,
            HttpServletRequest request) {
        Long scheduleId = timeOutRequest != null ? timeOutRequest.scheduleId() : null;
        return ResponseEntity.ok(dutyService.timeOutForToday(jwtService.getUserId(request), scheduleId));
    }

    @PostMapping("/attendance/submit")
    public ResponseEntity<DutyAttendanceTodayResponse> submitAttendanceForToday(
            @RequestBody(required = false) DutyAttendanceScheduleRequest submitRequest,
            HttpServletRequest request) {
        Long scheduleId = submitRequest != null ? submitRequest.scheduleId() : null;
        boolean isMobile = "mobile".equalsIgnoreCase(request.getHeader("X-Platform"));
        return ResponseEntity.ok(dutyService.submitAttendanceForToday(jwtService.getUserId(request), scheduleId, isMobile));
    }

    @PostMapping("/time-in")
    public ResponseEntity<DutyRecord> timeIn(@RequestBody DutyRecord dutyRecord) {
        return ResponseEntity.ok(dutyService.timeIn(dutyRecord));
    }

    @PostMapping("/manual")
    public ResponseEntity<DutyRecord> manualEntry(@RequestBody DutyRecord dutyRecord) {
        return ResponseEntity.ok(dutyService.manualEntry(dutyRecord));
    }

    @PutMapping("/manual/{id}")
    public ResponseEntity<DutyRecord> updateManualEntry(@PathVariable Long id, @RequestBody DutyRecord dutyRecord) {
        return ResponseEntity.ok(dutyService.updateManualEntry(id, dutyRecord));
    }

    @PutMapping("/{id}/time-out")
    public ResponseEntity<DutyRecord> timeOut(@PathVariable Long id) {
        return ResponseEntity.ok(dutyService.timeOut(id));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<DutyRecord>> getStudentDuties(@PathVariable Long studentId) {
        return ResponseEntity.ok(dutyService.getStudentDuties(studentId));
    }

    @GetMapping("/student")
    public ResponseEntity<List<DutyRecord>> getCurrentStudentDuties(HttpServletRequest request) {
        return ResponseEntity.ok(dutyService.getStudentDuties(jwtService.getUserId(request)));
    }

    @GetMapping("/instructor/{instructorId}")
    public ResponseEntity<List<DutyRecord>> getInstructorValidations(@PathVariable Long instructorId) {
        return ResponseEntity.ok(dutyService.getInstructorValidations(instructorId));
    }

    @GetMapping("/instructor")
    public ResponseEntity<List<DutyRecord>> getCurrentInstructorValidations(HttpServletRequest request) {
        return ResponseEntity.ok(dutyService.getInstructorValidations(jwtService.getUserId(request)));
    }

    @GetMapping
    public ResponseEntity<List<DutyRecord>> getAllDuties(
            @RequestParam(required = false) Long viewerId,
            @RequestParam(required = false, defaultValue = "false") boolean includeInstructors,
            HttpServletRequest request) {
        Long effectiveViewerId = viewerId != null ? viewerId : jwtService.getUserId(request);
        return ResponseEntity.ok(dutyService.getDutiesVisibleTo(effectiveViewerId, includeInstructors));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DutyRecord> getDutyById(@PathVariable Long id) {
        return ResponseEntity.ok(dutyService.getAllDuties().stream()
                .filter(d -> d.getId().equals(id)).findFirst()
                .orElseThrow(() -> new RuntimeException("Duty not found")));
    }

    @PutMapping("/{id}/validate")
    public ResponseEntity<DutyRecord> validateDuty(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String feedback) {
        return ResponseEntity.ok(dutyService.validateDuty(id, parseDutyStatus(status), feedback));
    }

    private DutyStatus parseDutyStatus(String value) {
        if (value != null && value.equalsIgnoreCase("VALIDATED")) return DutyStatus.VERIFIED;
        if (value != null && value.equalsIgnoreCase("APPROVED")) return DutyStatus.VERIFIED;
        return DutyStatus.valueOf(String.valueOf(value).toUpperCase());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDuty(@PathVariable Long id) {
        dutyService.deleteDutyRecord(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/attendance/reset-today")
    public ResponseEntity<Void> resetTodayAttendance(HttpServletRequest request) {
        dutyService.resetTodayAttendanceForUser(jwtService.getUserId(request));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/attendance/broadcast")
    public ResponseEntity<Void> setBroadcasting(@RequestBody DutyAttendanceBroadcastRequest broadcastRequest) {
        dutyService.setBroadcasting(broadcastRequest.scheduleId(), broadcastRequest.broadcasting());
        return ResponseEntity.ok().build();
    }
}
