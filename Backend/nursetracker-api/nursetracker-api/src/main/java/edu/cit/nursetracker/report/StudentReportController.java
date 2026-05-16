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
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
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
            @RequestParam(required = false, defaultValue = "2025-06-01") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false, defaultValue = "2026-05-31") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false, defaultValue = "true") boolean includeProfile,
            @RequestParam(required = false, defaultValue = "true") boolean includeSchedules,
            @RequestParam(required = false, defaultValue = "true") boolean includeCases,
            @RequestParam(required = false, defaultValue = "true") boolean includeProgress,
            @RequestParam(required = false, defaultValue = "true") boolean includeAppeals) {

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
        if (includeProfile) {
            Map<String, Object> profile = new LinkedHashMap<>();
            profile.put("studentName", student.getFullName());
            profile.put("schoolId", student.getSchoolId());
            profile.put("sectionInfo", student.getSectionInfo());
            profile.put("email", student.getEmail());
            report.put("profile", profile);
        }
        report.put("startDate", startDate);
        report.put("endDate", endDate);
        report.put("includeProfile", includeProfile);
        report.put("includeSchedules", includeSchedules);
        report.put("includeCases", includeCases);
        report.put("includeProgress", includeProgress);
        report.put("includeAppeals", includeAppeals);
        if (includeSchedules) report.put("scheduleCount", schedules.size());
        if (includeCases) {
            report.put("caseCount", cases.size());
            report.put("approvedCaseCount", approvedCases);
        }
        if (includeProgress) report.put("dutyRecordCount", duties.size());
        if (includeAppeals) report.put("appealCount", appealCount);
        report.put("message", "General report successfully generated for " + student.getFullName() + ".");
        return ResponseEntity.ok(report);
    }

    @GetMapping("/student/{studentId}/export")
    public ResponseEntity<byte[]> exportStudentReport(
            @PathVariable Long studentId,
            @RequestParam(required = false, defaultValue = "2025-06-01") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false, defaultValue = "2026-05-31") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false, defaultValue = "true") boolean includeProfile,
            @RequestParam(required = false, defaultValue = "true") boolean includeSchedules,
            @RequestParam(required = false, defaultValue = "true") boolean includeCases,
            @RequestParam(required = false, defaultValue = "true") boolean includeProgress,
            @RequestParam(required = false, defaultValue = "true") boolean includeAppeals) {

        Map<String, Object> report = getStudentReport(studentId, startDate, endDate, includeProfile, includeSchedules, includeCases, includeProgress, includeAppeals).getBody();
        byte[] bytes = buildPdfReport(report);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=student-report-" + studentId + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(bytes);
    }

    private byte[] buildPdfReport(Map<String, Object> report) {
        try (PDDocument document = new PDDocument(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            PDPage page = new PDPage(PDRectangle.LETTER);
            document.addPage(page);
            try (PDPageContentStream content = new PDPageContentStream(document, page)) {
                float pageWidth = page.getMediaBox().getWidth();
                float y = page.getMediaBox().getHeight() - 54;
                drawLogo(document, content, 54, y - 42);
                content.setNonStrokingColor(138, 37, 44);
                content.setFont(PDType1Font.HELVETICA_BOLD, 16);
                writeText(content, "Cebu Institute of Technology - University", 118, y);
                content.setNonStrokingColor(17, 24, 39);
                content.setFont(PDType1Font.HELVETICA_BOLD, 14);
                writeText(content, "NurseTrack Student Report", 118, y - 20);
                content.setNonStrokingColor(100, 116, 139);
                content.setFont(PDType1Font.HELVETICA, 10);
                writeText(content, "Generated from verified NurseTrack records", 118, y - 36);

                content.setStrokingColor(226, 232, 240);
                content.moveTo(54, y - 62);
                content.lineTo(pageWidth - 54, y - 62);
                content.stroke();

                y -= 92;
                Map<?, ?> profile = report == null ? null : (Map<?, ?>) report.get("profile");
                y = section(content, "Student Information", y);
                y = row(content, "Student Name", value(profile, "studentName"), y);
                y = row(content, "School ID", value(profile, "schoolId"), y);
                y = row(content, "Section", value(profile, "sectionInfo"), y);
                y = row(content, "Email", value(profile, "email"), y);

                y -= 10;
                y = section(content, "Report Coverage", y);
                y = row(content, "Start Date", value(report, "startDate"), y);
                y = row(content, "End Date", value(report, "endDate"), y);

                y -= 10;
                y = section(content, "Summary", y);
                y = row(content, "Schedules", value(report, "scheduleCount"), y);
                y = row(content, "Clinical Cases", value(report, "caseCount"), y);
                y = row(content, "Approved Clinical Cases", value(report, "approvedCaseCount"), y);
                y = row(content, "Duty Records", value(report, "dutyRecordCount"), y);
                y = row(content, "Appeals", value(report, "appealCount"), y);
            }
            document.save(output);
            return output.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Unable to generate PDF report.", e);
        }
    }

    private void drawLogo(PDDocument document, PDPageContentStream content, float x, float y) throws IOException {
        try (InputStream logo = getClass().getResourceAsStream("/assets/cit-u-logo.png")) {
            if (logo == null) return;
            PDImageXObject image = PDImageXObject.createFromByteArray(document, logo.readAllBytes(), "cit-u-logo");
            content.drawImage(image, x, y, 48, 48);
        }
    }

    private float section(PDPageContentStream content, String title, float y) throws IOException {
        content.setNonStrokingColor(138, 37, 44);
        content.setFont(PDType1Font.HELVETICA_BOLD, 12);
        writeText(content, title, 54, y);
        return y - 20;
    }

    private float row(PDPageContentStream content, String label, String value, float y) throws IOException {
        content.setNonStrokingColor(100, 116, 139);
        content.setFont(PDType1Font.HELVETICA_BOLD, 9);
        writeText(content, label.toUpperCase(), 54, y);
        content.setNonStrokingColor(17, 24, 39);
        content.setFont(PDType1Font.HELVETICA, 10);
        writeText(content, value == null || value.isBlank() ? "Not provided" : value, 190, y);
        return y - 16;
    }

    private void writeText(PDPageContentStream content, String text, float x, float y) throws IOException {
        content.beginText();
        content.newLineAtOffset(x, y);
        content.showText(sanitize(text));
        content.endText();
    }

    private String value(Map<?, ?> map, String key) {
        if (map == null || map.get(key) == null) return "";
        return String.valueOf(map.get(key));
    }

    private String sanitize(String text) {
        return text == null ? "" : text.replaceAll("[^\\x20-\\x7E]", "-");
    }
}
