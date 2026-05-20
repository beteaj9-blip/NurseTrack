-- Minimal baseline data for a fresh NurseTracker database.
-- Includes only hospitals, duty areas, clinical case categories, and clearance settings.

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS appeal_types;
SET FOREIGN_KEY_CHECKS = 1;

UPDATE users u
SET level = (
    SELECT GROUP_CONCAT(ual.assigned_level ORDER BY ual.assigned_level SEPARATOR ',')
    FROM user_assigned_levels ual
    WHERE ual.user_id = u.id
)
WHERE EXISTS (SELECT 1 FROM user_assigned_levels ual WHERE ual.user_id = u.id);

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

ALTER TABLE hospitals MODIFY COLUMN active BIT(1) NOT NULL DEFAULT b'1';

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

UPDATE hospitals
SET active = b'1'
WHERE name IN ('VSMMC', 'LCH', 'PSH', 'CCMC', 'CBS', 'SAMCH', 'MMC', 'VMH', 'VMCH', 'CSMC', 'ECS', 'CCHD', 'SHN', 'CHN', 'MMH', 'VMCHI', 'HHDC', 'MBC', 'IBC', 'QBC', 'TBC', 'PPBL')
AND NOT EXISTS (
    SELECT 1
    FROM (SELECT id FROM hospitals WHERE active = b'1' LIMIT 1) active_hospitals
);

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

INSERT INTO clearance_settings (id, enabled, updated_at)
SELECT 1, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM clearance_settings WHERE id = 1);
