package edu.cit.nursetracker.config;

import edu.cit.nursetracker.user.User;
import edu.cit.nursetracker.user.UserRepository;
import edu.cit.nursetracker.user.UserRole;
import edu.cit.nursetracker.user.UserStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import edu.cit.nursetracker.hospital.Hospital;
import edu.cit.nursetracker.hospital.HospitalRepository;
import edu.cit.nursetracker.checklist.ChecklistItem;
import edu.cit.nursetracker.checklist.ChecklistItemRepository;
import edu.cit.nursetracker.schedule.Schedule;
import edu.cit.nursetracker.schedule.ScheduleRepository;
import edu.cit.nursetracker.clinicalcase.CaseStatus;
import edu.cit.nursetracker.clinicalcase.CaseType;
import edu.cit.nursetracker.clinicalcase.ClinicalCase;
import edu.cit.nursetracker.clinicalcase.ClinicalCaseRepository;
import edu.cit.nursetracker.duty.DutyRecord;
import edu.cit.nursetracker.duty.DutyRepository;
import edu.cit.nursetracker.duty.DutyStatus;
import edu.cit.nursetracker.notification.Notification;
import edu.cit.nursetracker.notification.NotificationRepository;
import edu.cit.nursetracker.notification.NotificationType;
import edu.cit.nursetracker.appeal.AppealStatus;
import edu.cit.nursetracker.appeal.StudentAppeal;
import edu.cit.nursetracker.appeal.StudentAppealRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Arrays;
import java.util.Date;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final HospitalRepository hospitalRepository;
    private final ChecklistItemRepository checklistItemRepository;
    private final ScheduleRepository scheduleRepository;
    private final ClinicalCaseRepository clinicalCaseRepository;
    private final DutyRepository dutyRepository;
    private final NotificationRepository notificationRepository;
    private final StudentAppealRepository studentAppealRepository;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            System.out.println("Seeding database with default users...");
            List<User> users = userRepository.saveAll(List.of(
                User.builder().schoolId("12-3456-789").fullName("Maria Cruz").email("maria.cruz@cit.edu").mobileNumber("+63 917 000 1234").passwordHash("NurseTrack123").role(UserRole.STUDENT).sectionInfo("BSN 3A").status(UserStatus.ACTIVE).build(),
                User.builder().schoolId("CI-1002").fullName("Patricia Reyes").email("reyes@cit.edu").passwordHash("NurseTrack123").role(UserRole.INSTRUCTOR).sectionInfo("Clinical Instructor").status(UserStatus.ACTIVE).build(),
                User.builder().schoolId("CH-1001").fullName("Chair Reyes").email("chair.reyes@cit.edu").passwordHash("NurseTrack123").role(UserRole.CHAIR).sectionInfo("Chair").status(UserStatus.ACTIVE).build(),
                User.builder().schoolId("AD-1001").fullName("Admin Santos").email("admin.santos@cit.edu").passwordHash("NurseTrack123").role(UserRole.ADMIN).sectionInfo("Admin").status(UserStatus.ACTIVE).build(),
                User.builder().schoolId("CO-1001").fullName("Coordinator Lim").email("coordinator.lim@cit.edu").passwordHash("NurseTrack123").role(UserRole.COORDINATOR).sectionInfo("Coordinator").status(UserStatus.ACTIVE).build(),
                User.builder().schoolId("EN-1001").fullName("Enrollment Team").email("enrollment.team@cit.edu").passwordHash("NurseTrack123").role(UserRole.ENROLLMENT).sectionInfo("Enrollment").status(UserStatus.ACTIVE).build(),
                User.builder().schoolId("AS-1001").fullName("Assistant Garcia").email("assistant.garcia@cit.edu").passwordHash("NurseTrack123").role(UserRole.ASSISTANT).sectionInfo("Assistant").status(UserStatus.ACTIVE).build()
            ));

            System.out.println("Seeding default hospitals...");
            hospitalRepository.saveAll(List.of(
                new Hospital(null, "CCMC", "Cebu City Medical Center, Osmeña Blvd, Cebu City", Arrays.asList("Emergency Room", "Medical Ward", "Surgical Ward", "ICU", "Delivery Room", "Operating Room")),
                new Hospital(null, "VSMMC", "Vicente Sotto Memorial Medical Center, B. Rodriguez St", Arrays.asList("OB-Gyne", "Pedia", "Delivery Room", "Emergency Room", "Operating Room")),
                new Hospital(null, "CHN Brgy. Dumlog", "Community Health Nursing Area, Barangay Dumlog", Arrays.asList("Community Health Nursing Area", "Community Assessment")),
                new Hospital(null, "CSMC", "Cebu South Medical Center, Talisay City", Arrays.asList("Medical Ward", "Surgical Ward", "Emergency Room"))
            ));

            System.out.println("Seeding default checklist items for students...");
            for (User u : users) {
                if (u.getRole() == UserRole.STUDENT) {
                    checklistItemRepository.saveAll(List.of(
                        new ChecklistItem(null, u.getId(), "Delivery Room - Cord Care", "COMPLETED", new Date()),
                        new ChecklistItem(null, u.getId(), "Delivery Room - Handwashing", "COMPLETED", new Date()),
                        new ChecklistItem(null, u.getId(), "Operating Room - Scrubbing", "PENDING", null),
                        new ChecklistItem(null, u.getId(), "Operating Room - Gowning & Gloving", "PENDING", null),
                        new ChecklistItem(null, u.getId(), "Ward - IV Insertion", "COMPLETED", new Date()),
                        new ChecklistItem(null, u.getId(), "Ward - NGT Feeding", "PENDING", null)
                    ));
                }
            }
        }

        if (hospitalRepository.count() == 0) {
            System.out.println("Seeding default hospitals...");
            hospitalRepository.saveAll(List.of(
                new Hospital(null, "CCMC", "Cebu City Medical Center, Osme帽a Blvd, Cebu City", Arrays.asList("Emergency Room", "Medical Ward", "Surgical Ward", "ICU", "Delivery Room", "Operating Room")),
                new Hospital(null, "VSMMC", "Vicente Sotto Memorial Medical Center, B. Rodriguez St", Arrays.asList("OB-Gyne", "Pedia", "Delivery Room", "Emergency Room", "Operating Room")),
                new Hospital(null, "CHN Brgy. Dumlog", "Community Health Nursing Area, Barangay Dumlog", Arrays.asList("Community Health Nursing Area", "Community Assessment")),
                new Hospital(null, "CSMC", "Cebu South Medical Center, Talisay City", Arrays.asList("Medical Ward", "Surgical Ward", "Emergency Room"))
            ));
        }

        User maria = userRepository.findBySchoolId("12-3456-789").orElse(null);
        User instructor = userRepository.findBySchoolId("CI-1002").orElse(null);

        if (maria != null && instructor != null) {
            if (checklistItemRepository.findByStudentId(maria.getId()).isEmpty()) {
                checklistItemRepository.saveAll(List.of(
                    new ChecklistItem(null, maria.getId(), "Delivery Room - Cord Care", "COMPLETED", new Date()),
                    new ChecklistItem(null, maria.getId(), "Delivery Room - Handwashing", "COMPLETED", new Date()),
                    new ChecklistItem(null, maria.getId(), "Operating Room - Scrubbing", "PENDING", null),
                    new ChecklistItem(null, maria.getId(), "Operating Room - Gowning & Gloving", "PENDING", null),
                    new ChecklistItem(null, maria.getId(), "Ward - IV Insertion", "COMPLETED", new Date()),
                    new ChecklistItem(null, maria.getId(), "Ward - NGT Feeding", "PENDING", null)
                ));
            }

            if (scheduleRepository.findByStudentIdOrderByShiftDateAsc(maria.getId()).isEmpty()) {
                scheduleRepository.saveAll(List.of(
                    Schedule.builder().student(maria).instructor(instructor).hospital("CCMC").ward("Emergency Room").shiftDate(LocalDate.of(2026, 4, 20)).startTime(LocalTime.of(7, 0)).endTime(LocalTime.of(15, 0)).build(),
                    Schedule.builder().student(maria).instructor(instructor).hospital("CCMC").ward("Emergency Room").shiftDate(LocalDate.of(2026, 4, 21)).startTime(LocalTime.of(7, 0)).endTime(LocalTime.of(16, 30)).build(),
                    Schedule.builder().student(maria).instructor(instructor).hospital("VSMMC").ward("Operating Room").shiftDate(LocalDate.of(2026, 4, 23)).startTime(LocalTime.of(7, 0)).endTime(LocalTime.of(15, 0)).build(),
                    Schedule.builder().student(maria).instructor(instructor).hospital("VSMMC").ward("Operating Room").shiftDate(LocalDate.of(2026, 4, 24)).startTime(LocalTime.of(7, 0)).endTime(LocalTime.of(17, 0)).build()
                ));
            }

            if (clinicalCaseRepository.findByStudentIdOrderByCaseDateDesc(maria.getId()).isEmpty()) {
                clinicalCaseRepository.saveAll(List.of(
                    buildCase(maria, instructor, "Handled Cases", CaseType.DELIVERY_ROOM, "CCMC", "Delivery Room", LocalDate.of(2026, 4, 20), "Normal Spontaneous Delivery", "Cord care and newborn assessment", CaseStatus.APPROVED),
                    buildCase(maria, instructor, "Handled Cases", CaseType.DELIVERY_ROOM, "CCMC", "Delivery Room", LocalDate.of(2026, 4, 21), "Normal Spontaneous Delivery", "Maternal vital signs monitoring", CaseStatus.APPROVED),
                    buildCase(maria, instructor, "Handled Cases", CaseType.DELIVERY_ROOM, "CCMC", "Delivery Room", LocalDate.of(2026, 4, 22), "Normal Spontaneous Delivery", "Delivery room assistance", CaseStatus.APPROVED),
                    buildCase(maria, instructor, "Assisted Cases", CaseType.DELIVERY_ROOM, "CCMC", "Delivery Room", LocalDate.of(2026, 4, 23), "Labor Support", "Assisted bedside preparation", CaseStatus.APPROVED),
                    buildCase(maria, instructor, "Assisted Cases", CaseType.DELIVERY_ROOM, "CCMC", "Delivery Room", LocalDate.of(2026, 4, 24), "Postpartum Care", "Assisted postpartum assessment", CaseStatus.APPROVED),
                    buildCase(maria, instructor, "Newborn Care", CaseType.DELIVERY_ROOM, "CCMC", "Delivery Room", LocalDate.of(2026, 4, 25), "Newborn Assessment", "Initial newborn assessment", CaseStatus.PENDING),
                    buildCase(maria, instructor, "Minor Cases", CaseType.OPERATING_ROOM, "VSMMC", "Operating Room", LocalDate.of(2026, 4, 23), "Minor Surgery", "Sterile field preparation", CaseStatus.APPROVED),
                    buildCase(maria, instructor, "Minor Cases", CaseType.OPERATING_ROOM, "VSMMC", "Operating Room", LocalDate.of(2026, 4, 24), "Minor Surgery", "Post-procedure instrument count", CaseStatus.APPROVED),
                    buildCase(maria, instructor, "Minor Cases", CaseType.OPERATING_ROOM, "VSMMC", "Operating Room", LocalDate.of(2026, 4, 25), "Minor Surgery", "Circulating nurse assistance", CaseStatus.APPROVED),
                    buildCase(maria, instructor, "Major Cases - Scrub", CaseType.OPERATING_ROOM, "VSMMC", "Operating Room", LocalDate.of(2026, 4, 26), "Cesarean Section", "Scrub nurse observation", CaseStatus.APPROVED),
                    buildCase(maria, instructor, "Major Cases - Scrub", CaseType.OPERATING_ROOM, "VSMMC", "Operating Room", LocalDate.of(2026, 4, 27), "Appendectomy", "Scrub nurse assistance", CaseStatus.PENDING),
                    buildCase(maria, instructor, "Major Cases - Circulating", CaseType.OPERATING_ROOM, "VSMMC", "Operating Room", LocalDate.of(2026, 4, 28), "Laparoscopic Cholecystectomy", "Circulating nurse assistance", CaseStatus.APPROVED)
                ));
            }

            if (dutyRepository.findByStudentIdOrderByTimeInDesc(maria.getId()).isEmpty()) {
                dutyRepository.saveAll(List.of(
                    buildDuty(maria, instructor, "CCMC", "Emergency Room", LocalDateTime.of(2026, 4, 20, 7, 0), LocalDateTime.of(2026, 4, 20, 15, 0)),
                    buildDuty(maria, instructor, "CCMC", "Emergency Room", LocalDateTime.of(2026, 4, 21, 7, 0), LocalDateTime.of(2026, 4, 21, 16, 30)),
                    buildDuty(maria, instructor, "VSMMC", "Operating Room", LocalDateTime.of(2026, 4, 23, 7, 0), LocalDateTime.of(2026, 4, 23, 15, 0)),
                    buildDuty(maria, instructor, "VSMMC", "Operating Room", LocalDateTime.of(2026, 4, 24, 7, 0), LocalDateTime.of(2026, 4, 24, 17, 0))
                ));
            }

            if (notificationRepository.findByUserIdOrderByCreatedAtDesc(maria.getId()).isEmpty()) {
                notificationRepository.save(Notification.builder()
                    .user(maria)
                    .title("Duty Entry Verified")
                    .message("Your Emergency Room duty record was verified and added to your progress.")
                    .type(NotificationType.APPROVAL)
                    .isRead(false)
                    .build());
            }

            if (studentAppealRepository.findByStudentIdOrderByCreatedAtDesc(maria.getId()).isEmpty()) {
                studentAppealRepository.saveAll(List.of(
                    StudentAppeal.builder()
                        .student(maria)
                        .instructor(instructor)
                        .appealType("Attendance")
                        .relatedDutyDate(LocalDate.of(2026, 4, 29))
                        .clinicalSite("CCMC")
                        .dutyArea("Emergency Room")
                        .title("Late arrival due to bus delay")
                        .studentReason("CIT-U shuttle was delayed after traffic rerouting near the hospital entrance.")
                        .evidenceNotes("Transport advisory and timestamped arrival photo were attached.")
                        .supportingFiles("transport-advisory.pdf, arrival-photo.jpg")
                        .status(AppealStatus.PENDING)
                        .build(),
                    StudentAppeal.builder()
                        .student(maria)
                        .instructor(instructor)
                        .appealType("Attendance")
                        .relatedDutyDate(LocalDate.of(2026, 4, 12))
                        .clinicalSite("CCMC")
                        .dutyArea("Emergency Room")
                        .title("Excused tardiness request")
                        .studentReason("Submitted documentation for approved transport delay.")
                        .evidenceNotes("CI accepted the submitted supporting note.")
                        .supportingFiles("transport-note.pdf")
                        .status(AppealStatus.ACCEPTED)
                        .build()
                ));
            }
        }
    }

    private ClinicalCase buildCase(User student, User instructor, String category, CaseType caseType, String hospital, String dutyArea, LocalDate caseDate, String diagnosis, String procedureDetails, CaseStatus status) {
        return ClinicalCase.builder()
            .student(student)
            .instructor(instructor)
            .caseType(caseType)
            .patientInitials("M.C.")
            .patientAge(29)
            .category(category)
            .hospital(hospital)
            .dutyArea(dutyArea)
            .shiftTime("7:00 AM - 3:00 PM")
            .caseDate(caseDate)
            .diagnosis(diagnosis)
            .procedureDetails(procedureDetails)
            .studentReflection("Completed with CI supervision.")
            .status(status)
            .build();
    }

    private DutyRecord buildDuty(User student, User instructor, String hospital, String ward, LocalDateTime timeIn, LocalDateTime timeOut) {
        double totalHours = java.time.Duration.between(timeIn, timeOut).toMinutes() / 60.0;
        return DutyRecord.builder()
            .student(student)
            .instructor(instructor)
            .hospital(hospital)
            .ward(ward)
            .timeIn(timeIn)
            .timeOut(timeOut)
            .totalHours(totalHours)
            .status(DutyStatus.VERIFIED)
            .build();
    }
}
