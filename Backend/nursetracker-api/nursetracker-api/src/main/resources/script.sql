-- Student-only mock data seed.
-- This attaches records only to the current existing student account.
-- It intentionally does not create extra student accounts.

DELETE ci FROM checklist_items ci
JOIN users u ON ci.student_id = u.id
WHERE u.school_id = '12-3456-789'
AND ci.title IN (
    'Delivery Room - Cord Care',
    'Delivery Room - Handwashing',
    'Operating Room - Scrubbing',
    'Operating Room - Gowning & Gloving',
    'Ward - IV Insertion',
    'Ward - NGT Feeding'
);

DELETE n FROM notifications n
JOIN users u ON n.user_id = u.id
WHERE u.school_id <> '23-0509-324'
AND n.title IN ('Schedule Published', 'Duty Entry Verified');

DELETE sa FROM student_appeals sa
JOIN users u ON sa.student_id = u.id
WHERE u.school_id <> '23-0509-324'
AND sa.title IN (
    'Late arrival due to bus delay',
    'Excused tardiness request',
    'Late arrival due to transport delay',
    'Case documentation clarification'
);

DELETE dr FROM duty_records dr
JOIN users u ON dr.student_id = u.id
WHERE u.school_id <> '23-0509-324'
AND dr.time_in IN (
    '2026-04-19 23:00:00',
    '2026-04-20 23:00:00',
    '2026-04-22 23:00:00',
    '2026-04-23 23:00:00',
    '2026-04-20 07:00:00',
    '2026-04-21 07:00:00',
    '2026-04-23 07:00:00',
    '2026-05-20 07:00:00',
    '2026-05-21 07:00:00',
    '2026-05-22 07:00:00'
);

DELETE cc FROM clinical_cases cc
JOIN users u ON cc.student_id = u.id
WHERE u.school_id <> '23-0509-324'
AND cc.category IN (
    'Handled Cases',
    'Assisted Cases',
    'Newborn Care',
    'Minor Cases',
    'Major Cases - Scrub',
    'Major Cases - Circulating'
)
AND cc.case_date IN (
    '2026-04-20',
    '2026-04-21',
    '2026-04-22',
    '2026-04-23',
    '2026-04-24',
    '2026-04-25',
    '2026-04-26',
    '2026-04-27',
    '2026-04-28',
    '2026-05-21',
    '2026-05-22'
);

DELETE sc FROM schedules sc
JOIN users u ON sc.student_id = u.id
WHERE u.school_id <> '23-0509-324'
AND sc.shift_date IN (
    '2026-04-20',
    '2026-04-21',
    '2026-04-23',
    '2026-04-24',
    '2026-05-20',
    '2026-05-21',
    '2026-05-22'
);

DELETE FROM users
WHERE school_id = '12-3456-789'
AND full_name = 'Maria Cruz'
AND email = 'maria.cruz@cit.edu'
AND NOT EXISTS (SELECT 1 FROM schedules WHERE schedules.student_id = users.id OR schedules.instructor_id = users.id)
AND NOT EXISTS (SELECT 1 FROM clinical_cases WHERE clinical_cases.student_id = users.id OR clinical_cases.instructor_id = users.id)
AND NOT EXISTS (SELECT 1 FROM duty_records WHERE duty_records.student_id = users.id OR duty_records.instructor_id = users.id)
AND NOT EXISTS (SELECT 1 FROM notifications WHERE notifications.user_id = users.id)
AND NOT EXISTS (SELECT 1 FROM student_appeals WHERE student_appeals.student_id = users.id OR student_appeals.instructor_id = users.id)
AND NOT EXISTS (SELECT 1 FROM checklist_items WHERE checklist_items.student_id = users.id);

INSERT INTO system_info (version, last_updated, school_year, semester)
SELECT '1.0', '2026-05-16', '2025 - 2026', '2nd Semester'
WHERE NOT EXISTS (SELECT 1 FROM system_info);

UPDATE system_info
SET school_year = '2025 - 2026',
    semester = '2nd Semester',
    last_updated = '2026-05-16'
WHERE id = (SELECT id FROM (SELECT MIN(id) AS id FROM system_info) active_system_info);

INSERT INTO appeal_types (value, label)
SELECT 'Attendance', 'Attendance'
WHERE NOT EXISTS (SELECT 1 FROM appeal_types WHERE value = 'Attendance');

INSERT INTO appeal_types (value, label)
SELECT 'Grade', 'Grade'
WHERE NOT EXISTS (SELECT 1 FROM appeal_types WHERE value = 'Grade');

INSERT INTO appeal_types (value, label)
SELECT 'Other', 'Other'
WHERE NOT EXISTS (SELECT 1 FROM appeal_types WHERE value = 'Other');

INSERT INTO users (school_id, full_name, email, mobile_number, password_hash, role, section_info, status, created_at, updated_at)
SELECT 'CI-1002', 'Patricia Reyes', 'reyes@cit.edu', '+63 917 000 4234', 'NurseTrack123', 'INSTRUCTOR', 'Clinical Instructor', 'ACTIVE', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE school_id = 'CI-1002');

INSERT INTO hospitals (name, address)
SELECT 'CCMC', 'Cebu City Medical Center, Osmena Blvd, Cebu City'
WHERE NOT EXISTS (SELECT 1 FROM hospitals WHERE name = 'CCMC');

INSERT INTO hospitals (name, address)
SELECT 'VSMMC', 'Vicente Sotto Memorial Medical Center, B. Rodriguez St'
WHERE NOT EXISTS (SELECT 1 FROM hospitals WHERE name = 'VSMMC');

INSERT INTO hospital_wards (hospital_id, ward_name)
SELECT h.id, 'Emergency Room' FROM hospitals h
WHERE h.name = 'CCMC'
AND NOT EXISTS (SELECT 1 FROM hospital_wards hw WHERE hw.hospital_id = h.id AND hw.ward_name = 'Emergency Room');

INSERT INTO hospital_wards (hospital_id, ward_name)
SELECT h.id, 'Delivery Room' FROM hospitals h
WHERE h.name = 'CCMC'
AND NOT EXISTS (SELECT 1 FROM hospital_wards hw WHERE hw.hospital_id = h.id AND hw.ward_name = 'Delivery Room');

INSERT INTO hospital_wards (hospital_id, ward_name)
SELECT h.id, 'Operating Room' FROM hospitals h
WHERE h.name = 'VSMMC'
AND NOT EXISTS (SELECT 1 FROM hospital_wards hw WHERE hw.hospital_id = h.id AND hw.ward_name = 'Operating Room');

INSERT INTO hospital_wards (hospital_id, ward_name)
SELECT h.id, 'Medical Ward' FROM hospitals h
WHERE h.name = 'CCMC'
AND NOT EXISTS (SELECT 1 FROM hospital_wards hw WHERE hw.hospital_id = h.id AND hw.ward_name = 'Medical Ward');

INSERT INTO schedules (student_id, instructor_id, hospital, ward, shift_date, start_time, end_time, created_at, updated_at)
SELECT s.id, i.id, 'CCMC', 'Emergency Room', '2026-05-20', '07:00:00', '15:00:00', NOW(), NOW()
FROM users s
JOIN users i ON i.school_id = 'CI-1002'
WHERE s.school_id = '23-0509-324'
AND NOT EXISTS (
    SELECT 1 FROM schedules sc
    WHERE sc.student_id = s.id AND sc.shift_date = '2026-05-20' AND sc.ward = 'Emergency Room'
);

INSERT INTO schedules (student_id, instructor_id, hospital, ward, shift_date, start_time, end_time, created_at, updated_at)
SELECT s.id, i.id, 'CCMC', 'Delivery Room', '2026-05-21', '07:00:00', '15:00:00', NOW(), NOW()
FROM users s
JOIN users i ON i.school_id = 'CI-1002'
WHERE s.school_id = '23-0509-324'
AND NOT EXISTS (
    SELECT 1 FROM schedules sc
    WHERE sc.student_id = s.id AND sc.shift_date = '2026-05-21' AND sc.ward = 'Delivery Room'
);

INSERT INTO schedules (student_id, instructor_id, hospital, ward, shift_date, start_time, end_time, created_at, updated_at)
SELECT s.id, i.id, 'VSMMC', 'Operating Room', '2026-05-22', '07:00:00', '15:00:00', NOW(), NOW()
FROM users s
JOIN users i ON i.school_id = 'CI-1002'
WHERE s.school_id = '23-0509-324'
AND NOT EXISTS (
    SELECT 1 FROM schedules sc
    WHERE sc.student_id = s.id AND sc.shift_date = '2026-05-22' AND sc.ward = 'Operating Room'
);

INSERT INTO clinical_cases (student_id, instructor_id, case_type, patient_initials, patient_age, category, hospital, duty_area, shift_time, case_date, diagnosis, procedure_details, student_reflection, status, created_at, updated_at)
SELECT s.id, i.id, 'DELIVERY_ROOM', 'P.A.', 28, 'Handled Cases', 'CCMC', 'Delivery Room', '7:00 AM - 3:00 PM', '2026-05-21', 'Normal Spontaneous Delivery', 'Assisted with delivery room preparation and newborn assessment.', 'I practiced safe documentation and CI-supervised patient care.', 'APPROVED', NOW(), NOW()
FROM users s
JOIN users i ON i.school_id = 'CI-1002'
WHERE s.school_id = '23-0509-324'
AND NOT EXISTS (
    SELECT 1 FROM clinical_cases cc
    WHERE cc.student_id = s.id AND cc.case_date = '2026-05-21' AND cc.category = 'Handled Cases'
);

INSERT INTO clinical_cases (student_id, instructor_id, case_type, patient_initials, patient_age, category, hospital, duty_area, shift_time, case_date, diagnosis, procedure_details, student_reflection, status, created_at, updated_at)
SELECT s.id, i.id, 'DELIVERY_ROOM', 'N.B.', 0, 'Newborn Care', 'CCMC', 'Delivery Room', '7:00 AM - 3:00 PM', '2026-05-21', 'Newborn Assessment', 'Completed initial newborn vital signs and cord care observation.', 'I learned the importance of accurate newborn assessment and infection control.', 'PENDING', NOW(), NOW()
FROM users s
JOIN users i ON i.school_id = 'CI-1002'
WHERE s.school_id = '23-0509-324'
AND NOT EXISTS (
    SELECT 1 FROM clinical_cases cc
    WHERE cc.student_id = s.id AND cc.case_date = '2026-05-21' AND cc.category = 'Newborn Care'
);

INSERT INTO clinical_cases (student_id, instructor_id, case_type, patient_initials, patient_age, category, hospital, duty_area, shift_time, case_date, diagnosis, procedure_details, student_reflection, status, created_at, updated_at)
SELECT s.id, i.id, 'OPERATING_ROOM', 'O.R.', 35, 'Major Cases - Scrub', 'VSMMC', 'Operating Room', '7:00 AM - 3:00 PM', '2026-05-22', 'Appendectomy', 'Observed scrub nurse workflow and sterile field maintenance.', 'I learned how to maintain sterile technique during an OR procedure.', 'APPROVED', NOW(), NOW()
FROM users s
JOIN users i ON i.school_id = 'CI-1002'
WHERE s.school_id = '23-0509-324'
AND NOT EXISTS (
    SELECT 1 FROM clinical_cases cc
    WHERE cc.student_id = s.id AND cc.case_date = '2026-05-22' AND cc.category = 'Major Cases - Scrub'
);

INSERT INTO clinical_cases (student_id, instructor_id, case_type, patient_initials, patient_age, category, hospital, duty_area, shift_time, case_date, diagnosis, procedure_details, student_reflection, status, created_at, updated_at)
SELECT s.id, i.id, 'OPERATING_ROOM', 'M.S.', 42, 'Major Cases - Circulating', 'VSMMC', 'Operating Room', '7:00 AM - 3:00 PM', '2026-05-22', 'Cesarean Section', 'Assisted with circulating nurse documentation and supply preparation.', 'I understood the importance of teamwork and accurate counts in the OR.', 'PENDING', NOW(), NOW()
FROM users s
JOIN users i ON i.school_id = 'CI-1002'
WHERE s.school_id = '23-0509-324'
AND NOT EXISTS (
    SELECT 1 FROM clinical_cases cc
    WHERE cc.student_id = s.id AND cc.case_date = '2026-05-22' AND cc.category = 'Major Cases - Circulating'
);

INSERT INTO duty_records (student_id, instructor_id, hospital, ward, time_in, time_out, total_hours, status, created_at, updated_at)
SELECT s.id, i.id, 'CCMC', 'Emergency Room', '2026-05-20 07:00:00', '2026-05-20 15:00:00', 8.0, 'VERIFIED', NOW(), NOW()
FROM users s
JOIN users i ON i.school_id = 'CI-1002'
WHERE s.school_id = '23-0509-324'
AND NOT EXISTS (
    SELECT 1 FROM duty_records dr
    WHERE dr.student_id = s.id AND dr.time_in = '2026-05-20 07:00:00'
);

INSERT INTO duty_records (student_id, instructor_id, hospital, ward, time_in, time_out, total_hours, status, created_at, updated_at)
SELECT s.id, i.id, 'CCMC', 'Delivery Room', '2026-05-21 07:00:00', '2026-05-21 16:30:00', 9.5, 'VERIFIED', NOW(), NOW()
FROM users s
JOIN users i ON i.school_id = 'CI-1002'
WHERE s.school_id = '23-0509-324'
AND NOT EXISTS (
    SELECT 1 FROM duty_records dr
    WHERE dr.student_id = s.id AND dr.time_in = '2026-05-21 07:00:00'
);

INSERT INTO duty_records (student_id, instructor_id, hospital, ward, time_in, time_out, total_hours, status, created_at, updated_at)
SELECT s.id, i.id, 'VSMMC', 'Operating Room', '2026-05-22 07:00:00', '2026-05-22 15:00:00', 8.0, 'PENDING', NOW(), NOW()
FROM users s
JOIN users i ON i.school_id = 'CI-1002'
WHERE s.school_id = '23-0509-324'
AND NOT EXISTS (
    SELECT 1 FROM duty_records dr
    WHERE dr.student_id = s.id AND dr.time_in = '2026-05-22 07:00:00'
);

INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
SELECT s.id, 'Schedule Published', 'Your clinical duty schedule has been published.', 'SCHEDULE_CHANGE', false, NOW()
FROM users s
WHERE s.school_id = '23-0509-324'
AND NOT EXISTS (
    SELECT 1 FROM notifications n
    WHERE n.user_id = s.id AND n.title = 'Schedule Published'
);

UPDATE notifications n
JOIN users u ON n.user_id = u.id
SET n.action_url = '/nursing-student/schedules'
WHERE u.school_id = '23-0509-324'
AND n.title = 'Schedule Published';

INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
SELECT s.id, 'Duty Entry Verified', 'Your duty record was verified and added to your progress.', 'APPROVAL', false, NOW()
FROM users s
WHERE s.school_id = '23-0509-324'
AND NOT EXISTS (
    SELECT 1 FROM notifications n
    WHERE n.user_id = s.id AND n.title = 'Duty Entry Verified'
);

UPDATE notifications n
JOIN users u ON n.user_id = u.id
SET n.action_url = '/nursing-student/progress'
WHERE u.school_id = '23-0509-324'
AND n.title = 'Duty Entry Verified';

INSERT INTO student_appeals (student_id, instructor_id, appeal_type, related_duty_date, clinical_site, duty_area, title, student_reason, evidence_notes, supporting_files, status, created_at, updated_at)
SELECT s.id, i.id, 'Attendance', '2026-05-21', 'CCMC', 'Delivery Room', 'Late arrival due to transport delay', 'Public transportation was delayed during the route to the clinical site.', 'Transport advisory and arrival timestamp are available.', '', 'PENDING', NOW(), NOW()
FROM users s
JOIN users i ON i.school_id = 'CI-1002'
WHERE s.school_id = '23-0509-324'
AND NOT EXISTS (
    SELECT 1 FROM student_appeals sa
    WHERE sa.student_id = s.id AND sa.title = 'Late arrival due to transport delay'
);

INSERT INTO student_appeals (student_id, instructor_id, appeal_type, related_duty_date, clinical_site, duty_area, title, student_reason, evidence_notes, supporting_files, status, created_at, updated_at)
SELECT s.id, i.id, 'Other', '2026-05-22', 'VSMMC', 'Operating Room', 'Case documentation clarification', 'I would like to clarify the required supporting note for my OR case.', 'Awaiting CI recommendation.', '', 'ACCEPTED', NOW(), NOW()
FROM users s
JOIN users i ON i.school_id = 'CI-1002'
WHERE s.school_id = '23-0509-324'
AND NOT EXISTS (
    SELECT 1 FROM student_appeals sa
    WHERE sa.student_id = s.id AND sa.title = 'Case documentation clarification'
);
