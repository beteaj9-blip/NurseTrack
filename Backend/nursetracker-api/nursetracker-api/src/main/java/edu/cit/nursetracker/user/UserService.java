package edu.cit.nursetracker.user;

import lombok.RequiredArgsConstructor;
import edu.cit.nursetracker.academicterm.AcademicTerm;
import edu.cit.nursetracker.academicterm.AcademicTermRepository;
import edu.cit.nursetracker.hospital.Hospital;
import edu.cit.nursetracker.hospital.HospitalRepository;
import edu.cit.nursetracker.schedule.Schedule;
import edu.cit.nursetracker.schedule.ScheduleRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.Month;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.LinkedHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.IntStream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import javax.xml.parsers.DocumentBuilderFactory;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final ScheduleRepository scheduleRepository;
    private final HospitalRepository hospitalRepository;
    private final AcademicTermRepository academicTermRepository;

    public User createUser(User user) {
        if (user.getStatus() == null) {
            user.setStatus(UserStatus.PENDING);
        }
        // Here you would normally hash the password before saving
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<User> getUsersVisibleTo(Long viewerId) {
        return getUserById(viewerId)
                .map(viewer -> getAllUsers().stream().filter(user -> AccessScope.canViewUser(viewer, user)).toList())
                .orElse(List.of());
    }
    
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public List<User> getUsersByRole(UserRole role) {
        if (role == UserRole.INSTRUCTOR) {
            return userRepository.findByRoleNot(UserRole.STUDENT);
        }
        return userRepository.findByRole(role);
    }

    public String getPasswordInitials(String fullName) {
        if (fullName == null || fullName.isBlank()) return "U";
        String[] parts = fullName.trim().split("\\s+");
        StringBuilder initials = new StringBuilder();
        for (String part : parts) {
            String clean = part.replaceAll("[^a-zA-Z]", "");
            if (!clean.isEmpty()) initials.append(Character.toUpperCase(clean.charAt(0)));
        }
        return initials.isEmpty() ? "U" : initials.toString();
    }

    public Optional<User> findByEmailOrSchoolId(String accountId) {
        Optional<User> byEmail = userRepository.findByEmail(accountId);
        if (byEmail.isPresent()) return byEmail;
        return userRepository.findBySchoolId(accountId);
    }

    public String resetPasswordToInitials(User user) {
        String password = getPasswordInitials(user.getFullName()) + "#" + user.getSchoolId();
        user.setPasswordHash(password);
        userRepository.save(user);
        return password;
    }

    public List<User> getUsersByRoleVisibleTo(UserRole role, Long viewerId) {
        return getUserById(viewerId)
                .map(viewer -> getUsersByRole(role).stream().filter(user -> AccessScope.canViewUser(viewer, user)).toList())
                .orElse(List.of());
    }

    public User updateUserStatus(Long id, UserStatus newStatus) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        user.setStatus(newStatus);
        return userRepository.save(user);
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    public boolean emailExists(String email) {
        return email != null && !email.isBlank() && userRepository.existsByEmailIgnoreCase(email.trim());
    }

    public boolean schoolIdExists(String schoolId) {
        return schoolId != null && !schoolId.isBlank() && userRepository.existsBySchoolId(schoolId.trim());
    }

    public boolean changePassword(Long id, String currentPassword, String newPassword) {
        User user = getUserById(id).orElse(null);
        if (user != null && user.getPasswordHash().equals(currentPassword)) {
            user.setPasswordHash(newPassword);
            userRepository.save(user);
            return true;
        }
        return false;
    }

    public Map<String, Integer> importSectionAssignments(MultipartFile file) {
        try {
            SectionImportPreview preview = previewSectionAssignments(file);
            SectionImportResult result = publishSectionAssignments(preview);
            Map<String, Integer> counters = new LinkedHashMap<>();
            counters.put("updated", result.updatedStudents());
            counters.put("skipped", result.skippedStudents());
            counters.put("studentsMatched", result.matchedStudents());
            counters.put("studentsSkipped", result.skippedStudents());
            counters.put("level", result.level() == null ? 0 : result.level());
            return counters;
        } catch (Exception e) {
            throw new RuntimeException("Unable to import section assignments", e);
        }
    }

    public SectionImportPreview previewSectionAssignments(MultipartFile file) {
        try {
            List<String[]> rows = readRows(file);
            int classRecordHeaderIndex = findClassRecordHeader(rows);
            if (classRecordHeaderIndex >= 0) return previewClassRecord(file.getOriginalFilename(), rows, classRecordHeaderIndex);
            int scheduleHeaderIndex = findScheduleTemplateHeader(rows);
            if (scheduleHeaderIndex >= 0) return previewScheduleSectionImport(file.getOriginalFilename(), rows, scheduleHeaderIndex);
            return previewSimpleSectionAssignments(file.getOriginalFilename(), rows);
        } catch (Exception e) {
            throw new RuntimeException("Unable to preview section assignments", e);
        }
    }

    public SectionImportResult publishSectionAssignments(SectionImportPreview preview) {
        if (preview.schoolYear() != null && !preview.schoolYear().isBlank() && preview.semester() != null && !preview.semester().isBlank()) {
            activateAcademicTerm(preview.schoolYear(), preview.semester());
        }
        int updated = 0;
        for (SectionImportStudent student : preview.students()) {
            if (student.schoolId() == null || student.schoolId().isBlank()) continue;
            Optional<User> user = userRepository.findBySchoolId(student.schoolId());
            if (user.isEmpty()) continue;
            User target = user.get();
            if (preview.section() != null && !preview.section().isBlank()) target.setSectionInfo(preview.section());
            Integer level = student.level() != null ? student.level() : preview.level();
            if (level != null) target.setAssignedLevels(new HashSet<>(Set.of(level)));
            userRepository.save(target);
            updated++;
        }
        return new SectionImportResult(
                preview.filename(),
                preview.schoolYear(),
                preview.semester(),
                preview.section(),
                preview.level(),
                preview.totalStudents(),
                preview.matchedStudents(),
                preview.skippedStudents(),
                updated,
                preview.students()
        );
    }

    private SectionImportPreview previewClassRecord(String filename, List<String[]> rows, int headerIndex) {
        String[] header = rows.get(headerIndex);
        int noIndex = findHeader(header, "no", "no.");
        int nameIndex = findHeader(header, "name of student");
        int schoolIdIndex = findHeader(header, "student no", "student no.", "school id", "student id");
        int courseYearIndex = findHeader(header, "course year", "course & year");
        String termText = findValueAboveLabel(rows, "term school year", "term & school year");
        String semester = parseSemester(termText);
        String schoolYear = parseSchoolYear(termText).orElseGet(() -> parseSchoolYear(filename).orElse(""));
        String section = findValueAboveLabel(rows, "section");
        List<User> students = userRepository.findByRole(UserRole.STUDENT);
        List<SectionImportStudent> records = new ArrayList<>();
        Integer defaultLevel = null;
        for (int i = headerIndex + 1; i < rows.size(); i++) {
            String[] row = rows.get(i);
            String studentNo = valueAt(row, noIndex);
            String name = valueAt(row, nameIndex);
            String schoolId = valueAt(row, schoolIdIndex);
            String courseYear = valueAt(row, courseYearIndex);
            if (name.isBlank() && schoolId.isBlank()) continue;
            if (!schoolId.matches(".*\\d.*")) continue;
            Integer level = parseLevel(courseYear);
            if (defaultLevel == null && level != null) defaultLevel = level;
            Optional<User> match = userRepository.findBySchoolId(schoolId);
            records.add(toSectionImportStudent(studentNo, name, schoolId, courseYear, level, match));
        }
        return buildSectionPreview(filename, schoolYear, semester, section, defaultLevel, records);
    }

    private SectionImportPreview previewSimpleSectionAssignments(String filename, List<String[]> rows) {
        if (rows.isEmpty()) return buildSectionPreview(filename, "", "", "", null, List.of());
        String[] headers = rows.get(0);
        int schoolIdIndex = findHeader(headers, "school id", "student id", "student no", "student no.", "id");
        int nameIndex = findHeader(headers, "name", "student name", "name of student");
        int sectionIndex = findHeader(headers, "section", "section info");
        int levelIndex = findHeader(headers, "year level", "level", "assigned level", "course year", "course & year");
        List<SectionImportStudent> records = new ArrayList<>();
        String section = "";
        Integer defaultLevel = null;
        for (int i = 1; i < rows.size(); i++) {
            String[] row = rows.get(i);
            String schoolId = valueAt(row, schoolIdIndex);
            String name = valueAt(row, nameIndex);
            String rowSection = valueAt(row, sectionIndex);
            String levelValue = valueAt(row, levelIndex);
            if (schoolId.isBlank() && name.isBlank()) continue;
            if (section.isBlank() && !rowSection.isBlank()) section = rowSection;
            Integer level = parseLevel(levelValue.isBlank() ? rowSection : levelValue);
            if (defaultLevel == null && level != null) defaultLevel = level;
            Optional<User> match = schoolId.isBlank() ? resolveUserByName(name, userRepository.findByRole(UserRole.STUDENT)) : userRepository.findBySchoolId(schoolId);
            records.add(toSectionImportStudent(String.valueOf(i), name, schoolId, levelValue, level, match));
        }
        return buildSectionPreview(filename, "", "", section, defaultLevel, records);
    }

    private SectionImportPreview previewScheduleSectionImport(String filename, List<String[]> rows, int headerIndex) {
        String[] header = rows.get(headerIndex);
        int sectionIndex = findHeader(header, "section group", "section/group");
        int studentIndex = findHeader(header, "name of students");
        Integer level = findImportLevel(rows, headerIndex);
        String section = "";
        List<User> students = userRepository.findByRole(UserRole.STUDENT);
        List<SectionImportStudent> records = new ArrayList<>();
        for (int i = headerIndex + 1; i < rows.size(); i++) {
            String[] row = rows.get(i);
            String rowSection = valueAt(row, sectionIndex);
            if (!rowSection.isBlank() && section.isBlank()) section = rowSection;
            String name = stripStudentNumber(valueAt(row, studentIndex));
            if (name.isBlank()) continue;
            Optional<User> match = resolveUserByName(name, students);
            records.add(toSectionImportStudent(String.valueOf(records.size() + 1), name, match.map(User::getSchoolId).orElse(""), "", level, match));
        }
        return buildSectionPreview(filename, "", "", section, level, records);
    }

    private SectionImportPreview buildSectionPreview(String filename, String schoolYear, String semester, String section, Integer level, List<SectionImportStudent> records) {
        int matched = (int) records.stream().filter(SectionImportStudent::matched).count();
        return new SectionImportPreview(
                filename == null ? "" : filename,
                schoolYear == null ? "" : schoolYear,
                semester == null ? "" : semester,
                section == null ? "" : section,
                level,
                records.size(),
                matched,
                records.size() - matched,
                records
        );
    }

    private SectionImportStudent toSectionImportStudent(String studentNo, String name, String schoolId, String courseYear, Integer level, Optional<User> match) {
        return new SectionImportStudent(
                studentNo == null ? "" : studentNo,
                name == null ? "" : name,
                schoolId == null ? "" : schoolId,
                courseYear == null ? "" : courseYear,
                level,
                match.isPresent(),
                match.map(User::getId).orElse(null),
                match.map(User::getFullName).orElse(""),
                match.map(user -> user.getSectionInfo() == null ? "" : user.getSectionInfo()).orElse(""),
                match.map(user -> user.getProfileImageUrl() == null ? "" : user.getProfileImageUrl()).orElse("")
        );
    }

    private void activateAcademicTerm(String schoolYear, String semester) {
        academicTermRepository.findAll().forEach(term -> {
            if (term.isActive()) {
                term.setActive(false);
                academicTermRepository.save(term);
            }
        });
        AcademicTerm term = academicTermRepository.findFirstBySchoolYearIgnoreCaseAndSemesterIgnoreCase(schoolYear, semester)
                .orElseGet(() -> AcademicTerm.builder().schoolYear(schoolYear).semester(semester).build());
        term.setActive(true);
        academicTermRepository.save(term);
    }

    private Map<String, Integer> importSimpleSectionAssignments(List<String[]> rows) {
        int updated = 0;
        int skipped = 0;
        if (rows.isEmpty()) return Map.of("updated", 0, "skipped", 0);
        String[] headers = rows.get(0);
        int schoolIdIndex = findHeader(headers, "school id", "student id", "id");
        int sectionIndex = findHeader(headers, "section", "section info");
        int levelIndex = findHeader(headers, "year level", "level", "assigned level");
        for (int i = 1; i < rows.size(); i++) {
            String[] values = rows.get(i);
            String schoolId = valueAt(values, schoolIdIndex);
            String section = valueAt(values, sectionIndex);
            String levelValue = valueAt(values, levelIndex);
            Optional<User> user = userRepository.findBySchoolId(schoolId);
            if (user.isEmpty() || section.isBlank()) {
                skipped++;
                continue;
            }
            User target = user.get();
            target.setSectionInfo(section);
            Integer level = parseLevel(levelValue.isBlank() ? section : levelValue);
            if (level != null) target.setAssignedLevels(new HashSet<>(Set.of(level)));
            userRepository.save(target);
            updated++;
        }
        return Map.of("updated", updated, "skipped", skipped);
    }

    private Map<String, Integer> importScheduleTemplate(List<String[]> rows, int headerIndex) {
        String[] header = rows.get(headerIndex);
        int sectionIndex = findHeader(header, "section group", "section/group");
        int datesIndex = findHeader(header, "inclusive dates");
        int areaIndex = findHeader(header, "area shift", "area/shift");
        int studentIndex = findHeader(header, "name of students");
        int instructorIndex = findHeader(header, "clinical instructor");
        Integer level = findImportLevel(rows, headerIndex);
        List<Hospital> hospitals = hospitalRepository.findAll();
        List<User> students = userRepository.findByRole(UserRole.STUDENT);
        List<User> instructors = userRepository.findByRole(UserRole.INSTRUCTOR);
        ImportCounters counters = new ImportCounters(level == null ? 0 : level);
        DutyBlock current = null;
        String lastSection = "";
        String lastDateText = "";
        String lastInstructorText = "";
        for (int i = headerIndex + 1; i < rows.size(); i++) {
            String[] row = rows.get(i);
            if (isBlankRow(row) || isScheduleHeaderRow(row)) continue;
            String section = valueAt(row, sectionIndex);
            String dates = valueAt(row, datesIndex);
            String areaShift = valueAt(row, areaIndex);
            String studentName = stripStudentNumber(valueAt(row, studentIndex));
            String instructor = valueAt(row, instructorIndex);
            Optional<Hospital> hospitalMatch = resolveHospital(areaShift, hospitals);
            if (current != null && current.hasStudents() && hospitalMatch.isPresent()) {
                lastInstructorText = finalizeDutyBlock(current, level, hospitals, students, instructors, counters);
                current = null;
            }
            if (current == null) current = new DutyBlock(lastSection, lastDateText, lastInstructorText);
            if (!section.isBlank()) {
                current.section = section;
                lastSection = section;
            }
            if (!dates.isBlank()) {
                current.dateParts.add(dates);
                lastDateText = current.dateText();
            }
            if (!areaShift.isBlank()) {
                if (hospitalMatch.isPresent()) current.hospital = hospitalMatch.get();
                else {
                    Optional<TimeRange> timeRange = parseTimeRange(areaShift);
                    if (timeRange.isPresent()) {
                        current.startTime = timeRange.get().start();
                        current.endTime = timeRange.get().end();
                    } else {
                        Optional<String> ward = resolveWard(areaShift, current.hospital, hospitals);
                        if (ward.isPresent()) current.ward = ward.get();
                    }
                }
            }
            if (!instructor.isBlank()) current.instructorParts.add(instructor);
            if (!studentName.isBlank()) current.studentNames.add(studentName);
        }
        if (current != null) finalizeDutyBlock(current, level, hospitals, students, instructors, counters);
        Map<String, Integer> result = new LinkedHashMap<>();
        result.put("updated", counters.createdSchedules);
        result.put("skipped", counters.skippedStudents + counters.skippedBlocks);
        result.put("schedulesCreated", counters.createdSchedules);
        result.put("duplicateSchedules", counters.duplicateSchedules);
        result.put("studentsMatched", counters.matchedStudents);
        result.put("studentsSkipped", counters.skippedStudents);
        result.put("blocksImported", counters.importedBlocks);
        result.put("blocksSkipped", counters.skippedBlocks);
        result.put("level", counters.level);
        return result;
    }

    private String finalizeDutyBlock(DutyBlock block, Integer level, List<Hospital> hospitals, List<User> students, List<User> instructors, ImportCounters counters) {
        if (!block.hasStudents()) return block.instructorText();
        Optional<DateRange> dateRange = parseDateRange(block.dateText());
        Optional<TimeRange> timeRange = block.hasTime() ? Optional.of(new TimeRange(block.startTime, block.endTime)) : Optional.empty();
        Optional<String> ward = resolveWard(block.ward, block.hospital, hospitals);
        Optional<User> instructor = resolveUserByName(block.instructorText(), instructors);
        if (level == null || block.section.isBlank() || block.hospital == null || ward.isEmpty() || dateRange.isEmpty() || timeRange.isEmpty() || instructor.isEmpty()) {
            counters.skippedBlocks++;
            counters.skippedStudents += block.studentNames.size();
            return block.instructorText();
        }
        User ci = instructor.get();
        if (ci.getAssignedLevels() == null || !ci.getAssignedLevels().equals(Set.of(level))) {
            ci.setAssignedLevels(new HashSet<>(Set.of(level)));
            userRepository.save(ci);
        }
        int blockCreated = 0;
        for (String studentName : block.studentNames) {
            Optional<User> student = resolveUserByName(studentName, students);
            if (student.isEmpty()) {
                counters.skippedStudents++;
                continue;
            }
            User target = student.get();
            target.setSectionInfo(block.section);
            target.setAssignedLevels(new HashSet<>(Set.of(level)));
            userRepository.save(target);
            counters.matchedStudents++;
            LocalDate date = dateRange.get().start();
            while (!date.isAfter(dateRange.get().end())) {
                boolean exists = scheduleRepository.existsByStudentIdAndInstructorIdAndHospitalIgnoreCaseAndWardIgnoreCaseAndShiftDateAndStartTimeAndEndTime(
                        target.getId(), ci.getId(), block.hospital.getName(), ward.get(), date, timeRange.get().start(), timeRange.get().end()
                );
                if (exists) counters.duplicateSchedules++;
                else {
                    scheduleRepository.save(Schedule.builder()
                            .student(target)
                            .instructor(ci)
                            .hospital(block.hospital.getName())
                            .ward(ward.get())
                            .shiftDate(date)
                            .startTime(timeRange.get().start())
                            .endTime(timeRange.get().end())
                            .build());
                    counters.createdSchedules++;
                    blockCreated++;
                }
                date = date.plusDays(1);
            }
        }
        if (blockCreated > 0) counters.importedBlocks++;
        return block.instructorText();
    }

    private List<String[]> readRows(MultipartFile file) throws Exception {
        byte[] bytes = file.getBytes();
        String filename = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase();
        if (filename.endsWith(".xlsx") || isZip(bytes)) return readXlsxRows(bytes);
        List<String[]> rows = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(new ByteArrayInputStream(bytes), StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) rows.add(splitDelimited(line));
        }
        return rows;
    }

    private boolean isZip(byte[] bytes) {
        return bytes.length > 3 && bytes[0] == 'P' && bytes[1] == 'K';
    }

    private List<String[]> readXlsxRows(byte[] bytes) throws Exception {
        Map<String, byte[]> entries = new java.util.HashMap<>();
        try (ZipInputStream zip = new ZipInputStream(new ByteArrayInputStream(bytes))) {
            ZipEntry entry;
            while ((entry = zip.getNextEntry()) != null) {
                ByteArrayOutputStream output = new ByteArrayOutputStream();
                zip.transferTo(output);
                entries.put(entry.getName(), output.toByteArray());
            }
        }
        List<String> sharedStrings = parseSharedStrings(entries.get("xl/sharedStrings.xml"));
        String sheetName = entries.keySet().stream()
                .filter(name -> name.matches("xl/worksheets/sheet\\d+\\.xml"))
                .sorted()
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Workbook sheet not found."));
        return parseSheet(entries.get(sheetName), sharedStrings);
    }

    private List<String> parseSharedStrings(byte[] xml) throws Exception {
        List<String> values = new ArrayList<>();
        if (xml == null) return values;
        Document document = parseXml(xml);
        NodeList items = document.getElementsByTagName("si");
        for (int i = 0; i < items.getLength(); i++) {
            Element item = (Element) items.item(i);
            NodeList texts = item.getElementsByTagName("t");
            StringBuilder value = new StringBuilder();
            for (int j = 0; j < texts.getLength(); j++) value.append(texts.item(j).getTextContent());
            values.add(value.toString());
        }
        return values;
    }

    private List<String[]> parseSheet(byte[] xml, List<String> sharedStrings) throws Exception {
        List<String[]> rows = new ArrayList<>();
        Document document = parseXml(xml);
        NodeList rowNodes = document.getElementsByTagName("row");
        for (int i = 0; i < rowNodes.getLength(); i++) {
            Element row = (Element) rowNodes.item(i);
            List<String> cells = new ArrayList<>();
            NodeList cellNodes = row.getElementsByTagName("c");
            for (int j = 0; j < cellNodes.getLength(); j++) {
                Element cell = (Element) cellNodes.item(j);
                int index = columnIndex(cell.getAttribute("r"));
                while (cells.size() <= index) cells.add("");
                cells.set(index, cellValue(cell, sharedStrings));
            }
            rows.add(cells.toArray(String[]::new));
        }
        return rows;
    }

    private Document parseXml(byte[] xml) throws Exception {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.setNamespaceAware(false);
        return factory.newDocumentBuilder().parse(new ByteArrayInputStream(xml));
    }

    private String cellValue(Element cell, List<String> sharedStrings) {
        String type = cell.getAttribute("t");
        if ("inlineStr".equals(type)) {
            NodeList texts = cell.getElementsByTagName("t");
            return texts.getLength() == 0 ? "" : texts.item(0).getTextContent().trim();
        }
        NodeList values = cell.getElementsByTagName("v");
        if (values.getLength() == 0) return "";
        String value = values.item(0).getTextContent().trim();
        if ("s".equals(type)) {
            int index = Integer.parseInt(value);
            return index >= 0 && index < sharedStrings.size() ? sharedStrings.get(index).trim() : "";
        }
        return value;
    }

    private int columnIndex(String reference) {
        int index = 0;
        for (int i = 0; i < reference.length(); i++) {
            char ch = reference.charAt(i);
            if (!Character.isLetter(ch)) break;
            index = index * 26 + (Character.toUpperCase(ch) - 'A' + 1);
        }
        return Math.max(0, index - 1);
    }

    private String[] splitDelimited(String line) {
        String clean = line.replace("\uFEFF", "");
        String[] csv = clean.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)", -1);
        if (csv.length <= 1 && clean.contains("\t")) return clean.split("\t", -1);
        return csv;
    }

    private int findScheduleTemplateHeader(List<String[]> rows) {
        return IntStream.range(0, rows.size()).filter(index -> isScheduleHeaderRow(rows.get(index))).findFirst().orElse(-1);
    }

    private int findClassRecordHeader(List<String[]> rows) {
        return IntStream.range(0, rows.size()).filter(index -> isClassRecordHeaderRow(rows.get(index))).findFirst().orElse(-1);
    }

    private boolean isClassRecordHeaderRow(String[] row) {
        String joined = normalizeKey(String.join(" ", row));
        return joined.contains("name of student") && joined.contains("student no") && joined.contains("course year");
    }

    private boolean isScheduleHeaderRow(String[] row) {
        String joined = normalizeKey(String.join(" ", row));
        return joined.contains("section group") && joined.contains("inclusive dates") && joined.contains("area shift") && joined.contains("name of students") && joined.contains("clinical instructor");
    }

    private int findHeader(String[] headers, String... names) {
        return IntStream.range(0, headers.length)
                .filter(index -> {
                    String normalized = normalizeKey(headers[index]);
                    return List.of(names).stream().map(this::normalizeKey).anyMatch(normalized::equals);
                })
                .findFirst()
                .orElse(-1);
    }

    private String findValueAboveLabel(List<String[]> rows, String... labels) {
        for (int rowIndex = 1; rowIndex < rows.size(); rowIndex++) {
            String[] row = rows.get(rowIndex);
            for (int columnIndex = 0; columnIndex < row.length; columnIndex++) {
                String normalized = normalizeKey(row[columnIndex]);
                boolean matches = List.of(labels).stream().map(this::normalizeKey).anyMatch(normalized::equals);
                if (matches) return valueAt(rows.get(rowIndex - 1), columnIndex);
            }
        }
        return "";
    }

    private String parseSemester(String value) {
        String text = value == null ? "" : value.trim();
        if (text.isBlank()) return "";
        String firstPart = text.split(",")[0].trim();
        return firstPart.isBlank() ? text : firstPart;
    }

    private Optional<String> parseSchoolYear(String value) {
        Matcher matcher = Pattern.compile("(20\\d{2})\s*[-–—]\s*(20\\d{2})").matcher(value == null ? "" : value);
        if (!matcher.find()) return Optional.empty();
        return Optional.of(matcher.group(1) + "-" + matcher.group(2));
    }

    private Integer findImportLevel(List<String[]> rows, int headerIndex) {
        for (int i = 0; i < headerIndex; i++) {
            for (String cell : rows.get(i)) {
                Integer level = parseLevel(cell);
                if (level != null) return level;
            }
        }
        return null;
    }

    private String valueAt(String[] values, int index) {
        if (index < 0 || index >= values.length) return "";
        return values[index].replace("\"", "").trim();
    }

    private boolean isBlankRow(String[] values) {
        return List.of(values).stream().allMatch(value -> valueAt(new String[]{value}, 0).isBlank());
    }

    private Integer parseLevel(String value) {
        String normalized = normalizeKey(value);
        Matcher labeledDigit = Pattern.compile("(?:level|bsn)\\s*(\\d)").matcher(normalized);
        if (labeledDigit.find()) return Integer.parseInt(labeledDigit.group(1));
        if (normalized.matches("\\d")) return Integer.parseInt(normalized);
        if (normalized.contains("level iii") || normalized.matches("iii")) return 3;
        if (normalized.contains("level iv") || normalized.matches("iv")) return 4;
        if (normalized.contains("level ii") || normalized.matches("ii")) return 2;
        if (normalized.contains("level i") || normalized.matches("i")) return 1;
        return null;
    }

    private String stripStudentNumber(String value) {
        return value.replaceFirst("^\\s*\\d+\\s*[.)-]?\\s*", "").trim();
    }

    private Optional<Hospital> resolveHospital(String value, List<Hospital> hospitals) {
        String normalized = normalizeName(value);
        if (normalized.isBlank()) return Optional.empty();
        return hospitals.stream()
                .filter(hospital -> java.util.stream.Stream.of(hospital.getName(), hospital.getFullName(), hospital.getLabel())
                        .filter(item -> item != null && !item.isBlank())
                        .map(this::normalizeName)
                        .anyMatch(normalized::equals))
                .findFirst();
    }

    private Optional<String> resolveWard(String value, Hospital hospital, List<Hospital> hospitals) {
        String normalized = normalizeName(value);
        if (normalized.isBlank()) return Optional.empty();
        List<String> wards = hospital != null && hospital.getWards() != null
                ? hospital.getWards()
                : hospitals.stream().flatMap(item -> item.getWards() == null ? java.util.stream.Stream.empty() : item.getWards().stream()).toList();
        return wards.stream().filter(ward -> normalizeName(ward).equals(normalized)).findFirst();
    }

    private Optional<User> resolveUserByName(String value, List<User> users) {
        String normalized = normalizePersonName(value);
        if (normalized.isBlank()) return Optional.empty();
        List<String> tokens = List.of(normalized.split(" ")).stream().filter(token -> token.length() > 1).toList();
        List<Map.Entry<User, Integer>> matches = users.stream()
                .map(user -> Map.entry(user, matchScore(tokens, normalized, normalizePersonName(user.getFullName()))))
                .filter(entry -> entry.getValue() > 0)
                .sorted(Map.Entry.<User, Integer>comparingByValue(Comparator.reverseOrder()))
                .toList();
        if (matches.isEmpty()) return Optional.empty();
        if (matches.size() > 1 && matches.get(0).getValue().equals(matches.get(1).getValue())) return Optional.empty();
        return Optional.of(matches.get(0).getKey());
    }

    private int matchScore(List<String> importTokens, String importName, String userName) {
        if (userName.equals(importName)) return 100;
        Set<String> importSet = new HashSet<>(importTokens);
        Set<String> userSet = new HashSet<>(List.of(userName.split(" ")).stream().filter(token -> token.length() > 1).toList());
        if (!importSet.isEmpty() && importSet.equals(userSet)) return 90;
        if (!importSet.isEmpty() && userSet.containsAll(importSet)) return 80;
        if (!userSet.isEmpty() && importSet.containsAll(userSet)) return 70;
        return 0;
    }

    private Optional<DateRange> parseDateRange(String value) {
        String text = value.replace('–', '-').replace('—', '-').replaceAll("\\s+", " ").trim();
        Pattern pattern = Pattern.compile("(?i)\\b([a-z]{3,9})\\.?\\s+(\\d{1,2})\\s*(?:-|to)?\\s*(?:([a-z]{3,9})\\.?\\s*)?(\\d{1,2})?,?\\s*(\\d{4})");
        Matcher matcher = pattern.matcher(text);
        if (!matcher.find()) return Optional.empty();
        Month startMonth = parseMonth(matcher.group(1));
        Month endMonth = matcher.group(3) == null ? startMonth : parseMonth(matcher.group(3));
        int startDay = Integer.parseInt(matcher.group(2));
        int endDay = matcher.group(4) == null ? startDay : Integer.parseInt(matcher.group(4));
        int year = Integer.parseInt(matcher.group(5));
        return Optional.of(new DateRange(LocalDate.of(year, startMonth, startDay), LocalDate.of(year, endMonth, endDay)));
    }

    private Month parseMonth(String value) {
        return switch (value.toLowerCase().substring(0, 3)) {
            case "jan" -> Month.JANUARY;
            case "feb" -> Month.FEBRUARY;
            case "mar" -> Month.MARCH;
            case "apr" -> Month.APRIL;
            case "may" -> Month.MAY;
            case "jun" -> Month.JUNE;
            case "jul" -> Month.JULY;
            case "aug" -> Month.AUGUST;
            case "sep" -> Month.SEPTEMBER;
            case "oct" -> Month.OCTOBER;
            case "nov" -> Month.NOVEMBER;
            case "dec" -> Month.DECEMBER;
            default -> throw new IllegalArgumentException("Unknown month: " + value);
        };
    }

    private Optional<TimeRange> parseTimeRange(String value) {
        String text = value.toLowerCase().replace('–', '-').replace('—', '-').replaceAll("\\s+", " ").trim();
        Matcher matcher = Pattern.compile("(\\d{1,2})(?::(\\d{2}))?\\s*(am|pm)\\s*(?:-|to)\\s*(\\d{1,2})(?::(\\d{2}))?\\s*(am|pm)").matcher(text);
        if (!matcher.find()) return Optional.empty();
        return Optional.of(new TimeRange(toLocalTime(matcher.group(1), matcher.group(2), matcher.group(3)), toLocalTime(matcher.group(4), matcher.group(5), matcher.group(6))));
    }

    private LocalTime toLocalTime(String hourText, String minuteText, String period) {
        int hour = Integer.parseInt(hourText);
        int minute = minuteText == null ? 0 : Integer.parseInt(minuteText);
        if (period.equalsIgnoreCase("pm") && hour != 12) hour += 12;
        if (period.equalsIgnoreCase("am") && hour == 12) hour = 0;
        return LocalTime.of(hour, minute);
    }

    private String normalizeKey(String value) {
        return normalizeName(value).replace("/", " ").replaceAll("\\s+", " ").trim();
    }

    private String normalizePersonName(String value) {
        return normalizeName(value).replaceAll("\\b(mr|mrs|ms|dr|prof)\\b", "").replaceAll("\\s+", " ").trim();
    }

    private String normalizeName(String value) {
        String normalized = Normalizer.normalize(value == null ? "" : value, Normalizer.Form.NFD).replaceAll("\\p{M}+", "");
        return normalized.toLowerCase().replaceAll("[^a-z0-9/]+", " ").trim().replaceAll("\\s+", " ");
    }

    private record DateRange(LocalDate start, LocalDate end) {}
    private record TimeRange(LocalTime start, LocalTime end) {}

    private static class DutyBlock {
        private String section;
        private final List<String> dateParts = new ArrayList<>();
        private Hospital hospital;
        private String ward = "";
        private LocalTime startTime;
        private LocalTime endTime;
        private final List<String> instructorParts = new ArrayList<>();
        private final List<String> studentNames = new ArrayList<>();
        private DutyBlock(String section, String dateText, String instructorText) {
            this.section = section == null ? "" : section;
            if (dateText != null && !dateText.isBlank()) this.dateParts.add(dateText);
            if (instructorText != null && !instructorText.isBlank()) this.instructorParts.add(instructorText);
        }
        private boolean hasStudents() { return !studentNames.isEmpty(); }
        private boolean hasTime() { return startTime != null && endTime != null; }
        private String dateText() { return String.join(" ", dateParts).trim(); }
        private String instructorText() { return String.join(" ", instructorParts).trim(); }
    }

    private static class ImportCounters {
        private final int level;
        private int createdSchedules;
        private int duplicateSchedules;
        private int matchedStudents;
        private int skippedStudents;
        private int importedBlocks;
        private int skippedBlocks;
        private ImportCounters(int level) { this.level = level; }
    }
}
