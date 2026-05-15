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

import java.util.List;
import java.util.Arrays;
import java.util.Date;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final HospitalRepository hospitalRepository;
    private final ChecklistItemRepository checklistItemRepository;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            System.out.println("Seeding database with default users...");
            List<User> users = userRepository.saveAll(List.of(
                User.builder().schoolId("12-3456-789").fullName("Maria Cruz").email("maria.cruz@cit.edu").passwordHash("NurseTrack123").role(UserRole.STUDENT).sectionInfo("BSN 3A").status(UserStatus.ACTIVE).build(),
                User.builder().schoolId("CI-1002").fullName("Patricia Reyes").email("reyes@cit.edu").passwordHash("NurseTrack123").role(UserRole.INSTRUCTOR).sectionInfo("Clinical Instructor").status(UserStatus.ACTIVE).build(),
                User.builder().schoolId("CH-1001").fullName("Chair Reyes").email("chair.reyes@cit.edu").passwordHash("NurseTrack123").role(UserRole.CHAIR).sectionInfo("Chair").status(UserStatus.ACTIVE).build(),
                User.builder().schoolId("AD-1001").fullName("Admin Santos").email("admin.santos@cit.edu").passwordHash("NurseTrack123").role(UserRole.ADMIN).sectionInfo("Admin").status(UserStatus.ACTIVE).build(),
                User.builder().schoolId("CO-1001").fullName("Coordinator Lim").email("coordinator.lim@cit.edu").passwordHash("NurseTrack123").role(UserRole.COORDINATOR).sectionInfo("Coordinator").status(UserStatus.ACTIVE).build(),
                User.builder().schoolId("EN-1001").fullName("Enrollment Team").email("enrollment.team@cit.edu").passwordHash("NurseTrack123").role(UserRole.ENROLLMENT).sectionInfo("Enrollment").status(UserStatus.ACTIVE).build(),
                User.builder().schoolId("AS-1001").fullName("Assistant Garcia").email("assistant.garcia@cit.edu").passwordHash("NurseTrack123").role(UserRole.ASSISTANT).sectionInfo("Assistant").status(UserStatus.ACTIVE).build()
            ));

            System.out.println("Seeding default hospitals...");
            hospitalRepository.saveAll(List.of(
                new Hospital(null, "CCMC", "Cebu City Medical Center, Osmeña Blvd, Cebu City", Arrays.asList("Emergency Room", "Medical Ward", "Surgical Ward", "ICU")),
                new Hospital(null, "VSMMC", "Vicente Sotto Memorial Medical Center, B. Rodriguez St", Arrays.asList("OB-Gyne", "Pedia", "Delivery Room", "Emergency Room")),
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
    }
}
