package edu.cit.nursetracker.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class SchemaCompatibilityInitializer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        createCompatibilityView("attendance_records", """
                CREATE OR REPLACE VIEW attendance_records AS
                SELECT id, student_id, instructor_id, schedule_id, hospital, ward, time_in, time_out, total_hours,
                       verification_method, location_verified, proximity_evidence, ble_session_id,
                       attendance_submitted_at, status, instructor_feedback, created_at, updated_at
                FROM duty_records
                """);
        createCompatibilityView("rosters", """
                CREATE OR REPLACE VIEW rosters AS
                SELECT id, student_id, instructor_id, hospital, ward, shift_date, start_time, end_time,
                       group_name, canceled, created_at, updated_at
                FROM schedules
                """);
    }

    private void createCompatibilityView(String name, String sql) {
        try {
            jdbcTemplate.execute(sql);
        } catch (Exception e) {
            log.warn("Could not create {} compatibility view: {}", name, e.getMessage());
        }
    }
}
