package edu.cit.nursetracker.metrics;

import edu.cit.nursetracker.duty.DutyRepository;
import edu.cit.nursetracker.clinicalcase.ClinicalCaseRepository;
import edu.cit.nursetracker.clinicalcase.CaseStatus;
import edu.cit.nursetracker.schedule.ScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MetricsService {

    private final ScheduleRepository scheduleRepository;
    private final DutyRepository dutyRepository;
    private final ClinicalCaseRepository clinicalCaseRepository;

    public MetricsDto getOverallMetrics() {
        long totalSchedules = scheduleRepository.count();
        long totalAttendance = dutyRepository.count();
        long pendingCases = clinicalCaseRepository.findAll().stream()
                .filter(c -> c.getStatus() == CaseStatus.PENDING)
                .count();
        long approvedCases = clinicalCaseRepository.findAll().stream()
                .filter(c -> c.getStatus() == CaseStatus.APPROVED)
                .count();

        return MetricsDto.builder()
                .totalSchedules(totalSchedules)
                .totalAttendanceRecords(totalAttendance)
                .totalPendingCases(pendingCases)
                .totalApprovedCases(approvedCases)
                .build();
    }
}
