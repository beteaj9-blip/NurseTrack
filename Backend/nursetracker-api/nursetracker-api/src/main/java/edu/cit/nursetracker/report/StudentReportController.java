package edu.cit.nursetracker.report;

import edu.cit.nursetracker.appeal.StudentAppealRepository;
import edu.cit.nursetracker.clinicalcase.CaseStatus;
import edu.cit.nursetracker.clinicalcase.ClinicalCase;
import edu.cit.nursetracker.clinicalcase.ClinicalCaseRepository;
import edu.cit.nursetracker.duty.DutyRecord;
import edu.cit.nursetracker.duty.DutyRepository;
import edu.cit.nursetracker.schedule.Schedule;
import edu.cit.nursetracker.schedule.ScheduleRepository;
import edu.cit.nursetracker.user.User;
import edu.cit.nursetracker.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class StudentReportController {

    private final UserRepository userRepository;
    private final ScheduleRepository scheduleRepository;
    private final ClinicalCaseRepository caseRepository;
    private final DutyRepository dutyRepository;
    private final StudentAppealRepository appealRepository;

    @GetMapping("/student/{studentId}")
    public ResponseEntity<Map<String, Object>> getStudentReport(
            @PathVariable Long studentId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found."));

        List<Schedule> schedules = scheduleRepository.findByStudentIdOrderByShiftDateAsc(studentId).stream()
                .filter(schedule -> !schedule.getShiftDate().isBefore(startDate) && !schedule.getShiftDate().isAfter(endDate))
                .toList();

        List<ClinicalCase> cases = caseRepository.findByStudentIdOrderByCaseDateDesc(studentId).stream()
                .filter(clinicalCase -> !clinicalCase.getCaseDate().isBefore(startDate) && !clinicalCase.getCaseDate().isAfter(endDate))
                .toList();

        List<DutyRecord> duties = dutyRepository.findByStudentIdOrderByTimeInDesc(studentId).stream()
                .filter(duty -> {
                    if (duty.getTimeIn() == null) {
                        return false;
                    }
                    LocalDate dutyDate = duty.getTimeIn().toLocalDate();
                    return !dutyDate.isBefore(startDate) && !dutyDate.isAfter(endDate);
                })
                .toList();

        long approvedCases = cases.stream()
                .filter(clinicalCase -> clinicalCase.getStatus() == CaseStatus.APPROVED)
                .count();

        long appealCount = appealRepository.findByStudentIdOrderByCreatedAtDesc(studentId).stream()
                .filter(appeal -> {
                    if (appeal.getCreatedAt() == null) {
                        return false;
                    }
                    LocalDate createdDate = appeal.getCreatedAt().toLocalDate();
                    return !createdDate.isBefore(startDate) && !createdDate.isAfter(endDate);
                })
                .count();

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("studentName", student.getFullName());
        report.put("schoolId", student.getSchoolId());
        report.put("sectionInfo", student.getSectionInfo());
        report.put("startDate", startDate);
        report.put("endDate", endDate);
        report.put("scheduleCount", schedules.size());
        report.put("caseCount", cases.size());
        report.put("approvedCaseCount", approvedCases);
        report.put("dutyRecordCount", duties.size());
        report.put("appealCount", appealCount);
        report.put("message", "General report successfully generated for " + student.getFullName() + ".");
        return ResponseEntity.ok(report);
    }
}
