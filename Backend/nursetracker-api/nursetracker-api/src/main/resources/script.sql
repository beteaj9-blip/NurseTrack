-- Test mock data seed for one nursing student and one clinical instructor.
-- Student: 23-0509-324
-- Clinical Instructor: 23-0509-234

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

DELETE dr FROM duty_records dr
JOIN users s ON dr.student_id = s.id
WHERE s.school_id = '23-0509-324'
AND dr.time_in IN ('2026-05-20 07:00:00', '2026-05-21 07:00:00', '2026-05-22 07:00:00');

DELETE cc FROM clinical_cases cc
JOIN users s ON cc.student_id = s.id
WHERE s.school_id = '23-0509-324'
AND cc.case_date IN ('2026-05-20', '2026-05-21', '2026-05-22')
AND cc.patient_initials IN ('P.A.', 'N.B.', 'O.R.', 'M.S.');

DELETE sc FROM schedules sc
JOIN users s ON sc.student_id = s.id
WHERE s.school_id = '23-0509-324'
AND sc.shift_date IN ('2026-05-20', '2026-05-21', '2026-05-22')
AND sc.ward IN ('Emergency Room', 'Delivery Room', 'Operating Room');

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
SELECT 'Schedule', 'Schedule'
WHERE NOT EXISTS (SELECT 1 FROM appeal_types WHERE value = 'Schedule');

INSERT INTO appeal_types (value, label)
SELECT 'Clinical Case', 'Clinical Case'
WHERE NOT EXISTS (SELECT 1 FROM appeal_types WHERE value = 'Clinical Case');

DELETE FROM appeal_types WHERE value IN ('Grade', 'Other');

INSERT INTO clinical_case_categories (value, label)
SELECT 'Major Cases - Assist', 'Major Case - Assist'
WHERE NOT EXISTS (SELECT 1 FROM clinical_case_categories WHERE value = 'Major Cases - Assist');

INSERT INTO clinical_case_categories (value, label)
SELECT 'Major Cases - Scrub', 'Major Case - Scrub'
WHERE NOT EXISTS (SELECT 1 FROM clinical_case_categories WHERE value = 'Major Cases - Scrub');

INSERT INTO clinical_case_categories (value, label)
SELECT 'Major Cases - Circulating', 'Major Case - Circulating'
WHERE NOT EXISTS (SELECT 1 FROM clinical_case_categories WHERE value = 'Major Cases - Circulating');

INSERT INTO clinical_case_categories (value, label)
SELECT 'Minor Case', 'Minor Case'
WHERE NOT EXISTS (SELECT 1 FROM clinical_case_categories WHERE value = 'Minor Case');

INSERT INTO clinical_case_categories (value, label)
SELECT 'Handled Cases', 'Handled Case'
WHERE NOT EXISTS (SELECT 1 FROM clinical_case_categories WHERE value = 'Handled Cases');

INSERT INTO clinical_case_categories (value, label)
SELECT 'Assisted Case', 'Assisted Case'
WHERE NOT EXISTS (SELECT 1 FROM clinical_case_categories WHERE value = 'Assisted Case');

INSERT INTO clinical_case_categories (value, label)
SELECT 'Newborn Care', 'Newborn Care'
WHERE NOT EXISTS (SELECT 1 FROM clinical_case_categories WHERE value = 'Newborn Care');

INSERT INTO clinical_case_categories (value, label)
SELECT 'Labor Watch', 'Labor Watch'
WHERE NOT EXISTS (SELECT 1 FROM clinical_case_categories WHERE value = 'Labor Watch');

INSERT INTO users (school_id, full_name, email, mobile_number, password_hash, role, section_info, status, created_at, updated_at)
SELECT '23-0509-324', 'Jay Yan C. Tiongzon', 'jayyan.tiongzon@cit.edu', '+63 917 050 9324', 'NurseTrack123', 'STUDENT', 'BSN 3A', 'ACTIVE', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE school_id = '23-0509-324');

UPDATE users
SET full_name = 'Jay Yan C. Tiongzon',
    role = 'STUDENT',
    section_info = 'BSN 3A',
    status = 'ACTIVE',
    updated_at = NOW()
WHERE school_id = '23-0509-324';

INSERT INTO users (school_id, full_name, email, mobile_number, password_hash, role, section_info, status, created_at, updated_at)
SELECT '23-0509-234', 'Clinical Instructor Test', 'clinical.instructor.234@cit.edu', '+63 917 050 9234', 'NurseTrack123', 'INSTRUCTOR', 'Clinical Instructor - BSN 3A', 'ACTIVE', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE school_id = '23-0509-234');

UPDATE users
SET role = 'INSTRUCTOR',
    section_info = 'Clinical Instructor - BSN 3A',
    status = 'ACTIVE',
    updated_at = NOW()
WHERE school_id = '23-0509-234';

UPDATE users
SET full_name = 'Clinical Instructor Test',
    email = 'clinical.instructor.234@cit.edu',
    updated_at = NOW()
WHERE school_id = '23-0509-234'
AND full_name = 'Patricia Reyes'
AND email = 'patricia.reyes@cit.edu';

UPDATE schedules sc
JOIN users s ON sc.student_id = s.id
JOIN users i ON i.school_id = '23-0509-234'
SET sc.instructor_id = i.id
WHERE s.school_id = '23-0509-324';

UPDATE clinical_cases cc
JOIN users s ON cc.student_id = s.id
JOIN users i ON i.school_id = '23-0509-234'
SET cc.instructor_id = i.id
WHERE s.school_id = '23-0509-324';

UPDATE duty_records dr
JOIN users s ON dr.student_id = s.id
JOIN users i ON i.school_id = '23-0509-234'
SET dr.instructor_id = i.id
WHERE s.school_id = '23-0509-324';

UPDATE student_appeals sa
JOIN users s ON sa.student_id = s.id
JOIN users i ON i.school_id = '23-0509-234'
SET sa.instructor_id = i.id
WHERE s.school_id = '23-0509-324';

INSERT INTO hospitals (name, full_name, label, address)
SELECT 'VSMMC', 'Vicente Sotto Memorial Medical Center', 'Hospital / Medical Center', 'Vicente Sotto Memorial Medical Center'
WHERE NOT EXISTS (SELECT 1 FROM hospitals WHERE name = 'VSMMC');

INSERT INTO hospitals (name, full_name, label, address)
SELECT 'LCH', 'Lapu-Lapu City Hospital', 'Hospital', 'Lapu-Lapu City Hospital'
WHERE NOT EXISTS (SELECT 1 FROM hospitals WHERE name = 'LCH');

INSERT INTO hospitals (name, full_name, label, address)
SELECT 'PSH', 'Perpetual Succour Hospital', 'Hospital', 'Perpetual Succour Hospital'
WHERE NOT EXISTS (SELECT 1 FROM hospitals WHERE name = 'PSH');

INSERT INTO hospitals (name, full_name, label, address)
SELECT 'CCMC', 'Cebu City Medical Center', 'Hospital / Medical Center', 'Cebu City Medical Center'
WHERE NOT EXISTS (SELECT 1 FROM hospitals WHERE name = 'CCMC');

INSERT INTO hospitals (name, full_name, label, address)
SELECT 'CBS', 'Center for Behavioral Sciences', 'Clinical Area / Behavioral Health Area', 'Center for Behavioral Sciences'
WHERE NOT EXISTS (SELECT 1 FROM hospitals WHERE name = 'CBS');

INSERT INTO hospitals (name, full_name, label, address)
SELECT 'SAMCH', 'St. Anthony Mother and Child Hospital', 'Hospital', 'St. Anthony Mother and Child Hospital'
WHERE NOT EXISTS (SELECT 1 FROM hospitals WHERE name = 'SAMCH');

INSERT INTO hospitals (name, full_name, label, address)
SELECT 'MMC', 'Mactan Medical Hospital', 'Hospital', 'Mactan Medical Hospital'
WHERE NOT EXISTS (SELECT 1 FROM hospitals WHERE name = 'MMC');

INSERT INTO hospitals (name, full_name, label, address)
SELECT 'VMH', 'VisayasMed Hospital', 'Hospital', 'VisayasMed Hospital'
WHERE NOT EXISTS (SELECT 1 FROM hospitals WHERE name = 'VMH');

INSERT INTO hospitals (name, full_name, label, address)
SELECT 'VMCH', 'Vicente Mendiola Center for Health', 'Clinical Area / Health Facility', 'Vicente Mendiola Center for Health'
WHERE NOT EXISTS (SELECT 1 FROM hospitals WHERE name = 'VMCH');

INSERT INTO hospitals (name, full_name, label, address)
SELECT 'CSMC', 'Cebu South Medical Center', 'Hospital / Medical Center', 'Cebu South Medical Center'
WHERE NOT EXISTS (SELECT 1 FROM hospitals WHERE name = 'CSMC');

INSERT INTO hospitals (name, full_name, label, address)
SELECT 'ECS', 'Eversley Childs Sanitarium and General Hospital', 'Hospital / Specialty Hospital', 'Eversley Childs Sanitarium and General Hospital'
WHERE NOT EXISTS (SELECT 1 FROM hospitals WHERE name = 'ECS');

INSERT INTO hospitals (name, full_name, label, address)
SELECT 'CCHD', 'Cebu City Health Department', 'Community Exposure Area / Public Health Office', 'Cebu City Health Department'
WHERE NOT EXISTS (SELECT 1 FROM hospitals WHERE name = 'CCHD');

INSERT INTO hospitals (name, full_name, label, address)
SELECT 'SHN', 'School Health Nursing', 'Community Exposure Area / School/Barangay Health Nursing', 'School Health Nursing'
WHERE NOT EXISTS (SELECT 1 FROM hospitals WHERE name = 'SHN');

INSERT INTO hospitals (name, full_name, label, address)
SELECT 'CHN', 'Community Health Nursing', 'Community Exposure Area / Barangay Health Exposure', 'Community Health Nursing'
WHERE NOT EXISTS (SELECT 1 FROM hospitals WHERE name = 'CHN');

INSERT INTO hospitals (name, full_name, label, address)
SELECT 'MMH', 'Mactan Medical Hospital', 'Hospital', 'Mactan Medical Hospital'
WHERE NOT EXISTS (SELECT 1 FROM hospitals WHERE name = 'MMH');

INSERT INTO hospitals (name, full_name, label, address)
SELECT 'VMCHI', 'Vicente Mendiola Center for Health Infirmary', 'Clinical Area / Infirmary', 'Vicente Mendiola Center for Health Infirmary'
WHERE NOT EXISTS (SELECT 1 FROM hospitals WHERE name = 'VMCHI');

INSERT INTO hospitals (name, full_name, label, address)
SELECT 'HHDC', 'Healing Hands Dialysis Center', 'Clinical Area / Dialysis Center', 'Healing Hands Dialysis Center'
WHERE NOT EXISTS (SELECT 1 FROM hospitals WHERE name = 'HHDC');

INSERT INTO hospitals (name, full_name, label, address)
SELECT 'MBC', 'Mabolo Birthing Center', 'Clinical Area / Birthing Center', 'Mabolo Birthing Center'
WHERE NOT EXISTS (SELECT 1 FROM hospitals WHERE name = 'MBC');

INSERT INTO hospitals (name, full_name, label, address)
SELECT 'IBC', 'Inayawan Birthing Center', 'Clinical Area / Birthing Center', 'Inayawan Birthing Center'
WHERE NOT EXISTS (SELECT 1 FROM hospitals WHERE name = 'IBC');

INSERT INTO hospitals (name, full_name, label, address)
SELECT 'QBC', 'Quiot Birthing Center', 'Clinical Area / Birthing Center', 'Quiot Birthing Center'
WHERE NOT EXISTS (SELECT 1 FROM hospitals WHERE name = 'QBC');

INSERT INTO hospitals (name, full_name, label, address)
SELECT 'TBC', 'Tejero Birthing Center', 'Clinical Area / Birthing Center', 'Tejero Birthing Center'
WHERE NOT EXISTS (SELECT 1 FROM hospitals WHERE name = 'TBC');

INSERT INTO hospitals (name, full_name, label, address)
SELECT 'PPBL', 'Preventive Promotive Brgy. Lagtang', 'Community Exposure Area / Preventive-Promotive Barangay Area', 'Preventive Promotive Brgy. Lagtang'
WHERE NOT EXISTS (SELECT 1 FROM hospitals WHERE name = 'PPBL');

UPDATE hospitals SET full_name = 'Vicente Sotto Memorial Medical Center', label = 'Hospital / Medical Center', address = 'Vicente Sotto Memorial Medical Center' WHERE name = 'VSMMC';
UPDATE hospitals SET full_name = 'Cebu City Medical Center', label = 'Hospital / Medical Center', address = 'Cebu City Medical Center' WHERE name = 'CCMC';

DELETE hw FROM hospital_wards hw
JOIN hospitals h ON hw.hospital_id = h.id
LEFT JOIN (
    SELECT 'VSMMC' AS hospital_name, 'Emergency Room' AS ward_name UNION ALL
    SELECT 'VSMMC', 'Medical Ward' UNION ALL
    SELECT 'VSMMC', 'Surgical Ward' UNION ALL
    SELECT 'VSMMC', 'ICU' UNION ALL
    SELECT 'VSMMC', 'Operating Room' UNION ALL
    SELECT 'VSMMC', 'Pedia Pulmo Ward' UNION ALL
    SELECT 'VSMMC', 'SP St 201' UNION ALL
    SELECT 'LCH', 'OB-Gyne' UNION ALL
    SELECT 'LCH', 'Pedia' UNION ALL
    SELECT 'LCH', 'Delivery Room' UNION ALL
    SELECT 'LCH', 'Emergency Room' UNION ALL
    SELECT 'LCH', 'Operating Room' UNION ALL
    SELECT 'PSH', 'Emergency Room' UNION ALL
    SELECT 'PSH', 'Operating Room' UNION ALL
    SELECT 'CCMC', 'Emergency Room' UNION ALL
    SELECT 'CCMC', 'Delivery Room' UNION ALL
    SELECT 'CCMC', 'Operating Room' UNION ALL
    SELECT 'CCMC', 'Medical Ward' UNION ALL
    SELECT 'CCMC', 'Surgical Ward' UNION ALL
    SELECT 'CCHD', 'Community Health Nursing Area' UNION ALL
    SELECT 'CCHD', 'Community Assessment' UNION ALL
    SELECT 'SHN', 'Community Health Nursing Area' UNION ALL
    SELECT 'CHN', 'Community Health Nursing Area' UNION ALL
    SELECT 'PPBL', 'Community Health Nursing Area' UNION ALL
    SELECT 'MBC', 'Delivery Room' UNION ALL
    SELECT 'IBC', 'Delivery Room' UNION ALL
    SELECT 'QBC', 'Delivery Room' UNION ALL
    SELECT 'TBC', 'Delivery Room'
) allowed ON allowed.hospital_name = h.name AND allowed.ward_name = hw.ward_name
WHERE hw.ward_name IN ('Emergency Room', 'Delivery Room', 'Operating Room', 'Pedia Pulmo Ward', 'SP St 201', 'Medical Ward', 'Surgical Ward', 'ICU', 'OB-Gyne', 'Pedia', 'Community Health Nursing Area', 'Community Assessment')
AND allowed.hospital_name IS NULL;

INSERT INTO hospital_wards (hospital_id, ward_name)
SELECT h.id, allowed.ward_name
FROM hospitals h
JOIN (
    SELECT 'VSMMC' AS hospital_name, 'Emergency Room' AS ward_name UNION ALL
    SELECT 'VSMMC', 'Medical Ward' UNION ALL
    SELECT 'VSMMC', 'Surgical Ward' UNION ALL
    SELECT 'VSMMC', 'ICU' UNION ALL
    SELECT 'VSMMC', 'Operating Room' UNION ALL
    SELECT 'VSMMC', 'Pedia Pulmo Ward' UNION ALL
    SELECT 'VSMMC', 'SP St 201' UNION ALL
    SELECT 'LCH', 'OB-Gyne' UNION ALL
    SELECT 'LCH', 'Pedia' UNION ALL
    SELECT 'LCH', 'Delivery Room' UNION ALL
    SELECT 'LCH', 'Emergency Room' UNION ALL
    SELECT 'LCH', 'Operating Room' UNION ALL
    SELECT 'PSH', 'Emergency Room' UNION ALL
    SELECT 'PSH', 'Operating Room' UNION ALL
    SELECT 'CCMC', 'Emergency Room' UNION ALL
    SELECT 'CCMC', 'Delivery Room' UNION ALL
    SELECT 'CCMC', 'Operating Room' UNION ALL
    SELECT 'CCMC', 'Medical Ward' UNION ALL
    SELECT 'CCMC', 'Surgical Ward' UNION ALL
    SELECT 'CCHD', 'Community Health Nursing Area' UNION ALL
    SELECT 'CCHD', 'Community Assessment' UNION ALL
    SELECT 'SHN', 'Community Health Nursing Area' UNION ALL
    SELECT 'CHN', 'Community Health Nursing Area' UNION ALL
    SELECT 'PPBL', 'Community Health Nursing Area' UNION ALL
    SELECT 'MBC', 'Delivery Room' UNION ALL
    SELECT 'IBC', 'Delivery Room' UNION ALL
    SELECT 'QBC', 'Delivery Room' UNION ALL
    SELECT 'TBC', 'Delivery Room'
) allowed ON allowed.hospital_name = h.name
WHERE NOT EXISTS (SELECT 1 FROM hospital_wards hw WHERE hw.hospital_id = h.id AND hw.ward_name = allowed.ward_name);

INSERT INTO schedules (student_id, instructor_id, hospital, ward, shift_date, start_time, end_time, created_at, updated_at)
SELECT s.id, i.id, 'CCMC', 'Medical Ward', DATE_SUB(CURDATE(), INTERVAL 1 DAY), '07:00:00', '15:00:00', NOW(), NOW()
FROM users s
JOIN users i ON i.school_id = '23-0509-234'
WHERE s.school_id = '23-0509-324'
AND NOT EXISTS (
    SELECT 1 FROM schedules sc
    WHERE sc.student_id = s.id AND sc.shift_date = DATE_SUB(CURDATE(), INTERVAL 1 DAY) AND sc.ward = 'Medical Ward'
);

INSERT INTO clinical_cases (student_id, instructor_id, case_type, patient_initials, patient_age, category, hospital, duty_area, shift_time, case_date, diagnosis, procedure_details, student_reflection, status, created_at, updated_at)
SELECT s.id, i.id, 'DELIVERY_ROOM', 'N.C.', 0, 'Newborn Care', 'CCMC', 'Delivery Room', '7:00 AM - 3:00 PM', DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'Newborn Assessment', 'Completed newborn assessment and vital signs documentation under CI supervision.', 'I practiced focused newborn assessment and safe clinical documentation.', 'PENDING', NOW(), NOW()
FROM users s
JOIN users i ON i.school_id = '23-0509-234'
WHERE s.school_id = '23-0509-324'
AND NOT EXISTS (
    SELECT 1 FROM clinical_cases cc
    WHERE cc.student_id = s.id AND cc.case_date = DATE_SUB(CURDATE(), INTERVAL 1 DAY) AND cc.duty_area = 'Delivery Room'
);

UPDATE clinical_cases cc
JOIN users s ON cc.student_id = s.id
SET cc.case_type = 'DELIVERY_ROOM',
    cc.patient_initials = 'N.C.',
    cc.patient_age = 0,
    cc.category = 'Newborn Care',
    cc.hospital = 'CCMC',
    cc.duty_area = 'Delivery Room',
    cc.diagnosis = 'Newborn Assessment',
    cc.procedure_details = 'Completed newborn assessment and vital signs documentation under CI supervision.',
    cc.student_reflection = 'I practiced focused newborn assessment and safe clinical documentation.',
    cc.updated_at = NOW()
WHERE s.school_id = '23-0509-324'
AND cc.case_date = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
AND cc.category = 'Medical Ward Case';

INSERT INTO schedules (student_id, instructor_id, hospital, ward, shift_date, start_time, end_time, created_at, updated_at)
SELECT s.id, i.id, 'CCMC', 'Delivery Room', DATE_SUB(CURDATE(), INTERVAL 3 DAY), '07:00:00', '15:00:00', NOW(), NOW()
FROM users s
JOIN users i ON i.school_id = '23-0509-234'
WHERE s.school_id = '23-0509-324'
AND NOT EXISTS (
    SELECT 1 FROM schedules sc
    WHERE sc.student_id = s.id AND sc.shift_date = DATE_SUB(CURDATE(), INTERVAL 3 DAY) AND sc.ward = 'Delivery Room'
);

INSERT INTO schedules (student_id, instructor_id, hospital, ward, shift_date, start_time, end_time, created_at, updated_at)
SELECT s.id, i.id, 'CCMC', 'Delivery Room', DATE_SUB(CURDATE(), INTERVAL 2 DAY), '07:00:00', '15:00:00', NOW(), NOW()
FROM users s
JOIN users i ON i.school_id = '23-0509-234'
WHERE s.school_id = '23-0509-324'
AND NOT EXISTS (
    SELECT 1 FROM schedules sc
    WHERE sc.student_id = s.id AND sc.shift_date = DATE_SUB(CURDATE(), INTERVAL 2 DAY) AND sc.ward = 'Delivery Room'
);

INSERT INTO schedules (student_id, instructor_id, hospital, ward, shift_date, start_time, end_time, created_at, updated_at)
SELECT s.id, i.id, 'VSMMC', 'Operating Room', DATE_SUB(CURDATE(), INTERVAL 1 DAY), '07:00:00', '15:00:00', NOW(), NOW()
FROM users s
JOIN users i ON i.school_id = '23-0509-234'
WHERE s.school_id = '23-0509-324'
AND NOT EXISTS (
    SELECT 1 FROM schedules sc
    WHERE sc.student_id = s.id AND sc.shift_date = DATE_SUB(CURDATE(), INTERVAL 1 DAY) AND sc.ward = 'Operating Room'
);

INSERT INTO clinical_cases (student_id, instructor_id, case_type, patient_initials, patient_age, category, hospital, duty_area, shift_time, case_date, diagnosis, procedure_details, student_reflection, status, created_at, updated_at)
SELECT s.id, i.id, 'DELIVERY_ROOM', 'D.R.', 30, 'Assisted Case', 'CCMC', 'Delivery Room', '7:00 AM - 3:00 PM', DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'Labor Assistance', 'Assisted with delivery room preparation and maternal assessment.', 'I practiced safe preparation and CI-guided maternal care.', 'APPROVED', NOW(), NOW()
FROM users s
JOIN users i ON i.school_id = '23-0509-234'
WHERE s.school_id = '23-0509-324'
AND NOT EXISTS (
    SELECT 1 FROM clinical_cases cc
    WHERE cc.student_id = s.id AND cc.case_date = DATE_SUB(CURDATE(), INTERVAL 3 DAY) AND cc.patient_initials = 'D.R.'
);

INSERT INTO clinical_cases (student_id, instructor_id, case_type, patient_initials, patient_age, category, hospital, duty_area, shift_time, case_date, diagnosis, procedure_details, student_reflection, status, created_at, updated_at)
SELECT s.id, i.id, 'DELIVERY_ROOM', 'P.A.', 28, 'Handled Cases', 'CCMC', 'Delivery Room', '7:00 AM - 3:00 PM', DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'Normal Spontaneous Delivery', 'Assisted with delivery room preparation and newborn assessment.', 'I practiced safe documentation and CI-supervised patient care.', 'APPROVED', NOW(), NOW()
FROM users s
JOIN users i ON i.school_id = '23-0509-234'
WHERE s.school_id = '23-0509-324'
AND NOT EXISTS (
    SELECT 1 FROM clinical_cases cc
    WHERE cc.student_id = s.id AND cc.case_date = DATE_SUB(CURDATE(), INTERVAL 2 DAY) AND cc.category = 'Handled Cases'
);

INSERT INTO clinical_cases (student_id, instructor_id, case_type, patient_initials, patient_age, category, hospital, duty_area, shift_time, case_date, diagnosis, procedure_details, student_reflection, status, created_at, updated_at)
SELECT s.id, i.id, 'DELIVERY_ROOM', 'N.B.', 0, 'Newborn Care', 'CCMC', 'Delivery Room', '7:00 AM - 3:00 PM', DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'Newborn Assessment', 'Completed initial newborn vital signs and cord care observation.', 'I learned the importance of accurate newborn assessment and infection control.', 'PENDING', NOW(), NOW()
FROM users s
JOIN users i ON i.school_id = '23-0509-234'
WHERE s.school_id = '23-0509-324'
AND NOT EXISTS (
    SELECT 1 FROM clinical_cases cc
    WHERE cc.student_id = s.id AND cc.case_date = DATE_SUB(CURDATE(), INTERVAL 2 DAY) AND cc.category = 'Newborn Care'
);

INSERT INTO clinical_cases (student_id, instructor_id, case_type, patient_initials, patient_age, category, hospital, duty_area, shift_time, case_date, diagnosis, procedure_details, student_reflection, status, created_at, updated_at)
SELECT s.id, i.id, 'OPERATING_ROOM', 'O.R.', 35, 'Major Cases - Scrub', 'VSMMC', 'Operating Room', '7:00 AM - 3:00 PM', DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'Appendectomy', 'Observed scrub nurse workflow and sterile field maintenance.', 'I learned how to maintain sterile technique during an OR procedure.', 'APPROVED', NOW(), NOW()
FROM users s
JOIN users i ON i.school_id = '23-0509-234'
WHERE s.school_id = '23-0509-324'
AND NOT EXISTS (
    SELECT 1 FROM clinical_cases cc
    WHERE cc.student_id = s.id AND cc.case_date = DATE_SUB(CURDATE(), INTERVAL 1 DAY) AND cc.category = 'Major Cases - Scrub'
);

INSERT INTO clinical_cases (student_id, instructor_id, case_type, patient_initials, patient_age, category, hospital, duty_area, shift_time, case_date, diagnosis, procedure_details, student_reflection, status, created_at, updated_at)
SELECT s.id, i.id, 'OPERATING_ROOM', 'M.S.', 42, 'Major Cases - Circulating', 'VSMMC', 'Operating Room', '7:00 AM - 3:00 PM', DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'Cesarean Section', 'Assisted with circulating nurse documentation and supply preparation.', 'I understood the importance of teamwork and accurate counts in the OR.', 'PENDING', NOW(), NOW()
FROM users s
JOIN users i ON i.school_id = '23-0509-234'
WHERE s.school_id = '23-0509-324'
AND NOT EXISTS (
    SELECT 1 FROM clinical_cases cc
    WHERE cc.student_id = s.id AND cc.case_date = DATE_SUB(CURDATE(), INTERVAL 1 DAY) AND cc.category = 'Major Cases - Circulating'
);

INSERT INTO duty_records (student_id, instructor_id, hospital, ward, time_in, time_out, total_hours, status, created_at, updated_at)
SELECT s.id, i.id, 'CCMC', 'Delivery Room', CONCAT(DATE_SUB(CURDATE(), INTERVAL 3 DAY), ' 07:00:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 3 DAY), ' 15:00:00'), 8.0, 'VERIFIED', NOW(), NOW()
FROM users s
JOIN users i ON i.school_id = '23-0509-234'
WHERE s.school_id = '23-0509-324'
AND NOT EXISTS (
    SELECT 1 FROM duty_records dr
    WHERE dr.student_id = s.id AND dr.time_in = CONCAT(DATE_SUB(CURDATE(), INTERVAL 3 DAY), ' 07:00:00')
);

INSERT INTO duty_records (student_id, instructor_id, hospital, ward, time_in, time_out, total_hours, status, created_at, updated_at)
SELECT s.id, i.id, 'CCMC', 'Delivery Room', CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 07:00:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 16:30:00'), 9.5, 'VERIFIED', NOW(), NOW()
FROM users s
JOIN users i ON i.school_id = '23-0509-234'
WHERE s.school_id = '23-0509-324'
AND NOT EXISTS (
    SELECT 1 FROM duty_records dr
    WHERE dr.student_id = s.id AND dr.time_in = CONCAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), ' 07:00:00')
);

INSERT INTO duty_records (student_id, instructor_id, hospital, ward, time_in, time_out, total_hours, status, created_at, updated_at)
SELECT s.id, i.id, 'VSMMC', 'Operating Room', CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 07:00:00'), CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 15:00:00'), 8.0, 'VERIFIED', NOW(), NOW()
FROM users s
JOIN users i ON i.school_id = '23-0509-234'
WHERE s.school_id = '23-0509-324'
AND NOT EXISTS (
    SELECT 1 FROM duty_records dr
    WHERE dr.student_id = s.id AND dr.time_in = CONCAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), ' 07:00:00')
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

INSERT INTO notifications (user_id, title, message, type, is_read, action_url, created_at)
SELECT i.id, 'Clinical Case Pending', 'Jay Yan C. Tiongzon submitted clinical cases for validation.', 'REMINDER', false, '/clinical-instructor/clinical-cases', NOW()
FROM users i
WHERE i.school_id = '23-0509-234'
AND NOT EXISTS (
    SELECT 1 FROM notifications n
    WHERE n.user_id = i.id AND n.title = 'Clinical Case Pending'
);

INSERT INTO notifications (user_id, title, message, type, is_read, action_url, created_at)
SELECT i.id, 'Student Appeal Pending', 'Jay Yan C. Tiongzon submitted an appeal for CI recommendation.', 'REMINDER', false, '/clinical-instructor/ci-recommendations', NOW()
FROM users i
WHERE i.school_id = '23-0509-234'
AND NOT EXISTS (
    SELECT 1 FROM notifications n
    WHERE n.user_id = i.id AND n.title = 'Student Appeal Pending'
);

INSERT INTO student_appeals (student_id, instructor_id, appeal_type, related_duty_date, clinical_site, duty_area, title, student_reason, evidence_notes, supporting_files, status, created_at, updated_at)
SELECT s.id, i.id, 'Attendance', '2026-05-21', 'CCMC', 'Delivery Room', 'Late arrival due to transport delay', 'Public transportation was delayed during the route to the clinical site.', 'Transport advisory and arrival timestamp are available.', '', 'PENDING', NOW(), NOW()
FROM users s
JOIN users i ON i.school_id = '23-0509-234'
WHERE s.school_id = '23-0509-324'
AND NOT EXISTS (
    SELECT 1 FROM student_appeals sa
    WHERE sa.student_id = s.id AND sa.title = 'Late arrival due to transport delay'
);

INSERT INTO student_appeals (student_id, instructor_id, appeal_type, related_duty_date, clinical_site, duty_area, title, student_reason, evidence_notes, supporting_files, status, created_at, updated_at)
SELECT s.id, i.id, 'Clinical Case', '2026-05-22', 'VSMMC', 'Operating Room', 'Case documentation clarification', 'I would like to clarify the required supporting note for my OR case.', 'Awaiting CI recommendation.', '', 'ACCEPTED', NOW(), NOW()
FROM users s
JOIN users i ON i.school_id = '23-0509-234'
WHERE s.school_id = '23-0509-324'
AND NOT EXISTS (
    SELECT 1 FROM student_appeals sa
    WHERE sa.student_id = s.id AND sa.title = 'Case documentation clarification'
);
