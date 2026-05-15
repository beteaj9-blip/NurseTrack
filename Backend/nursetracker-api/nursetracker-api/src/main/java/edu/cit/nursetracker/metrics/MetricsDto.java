package edu.cit.nursetracker.metrics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MetricsDto {
    private long totalSchedules;
    private long totalAttendanceRecords;
    private long totalPendingCases;
    private long totalApprovedCases;
}
