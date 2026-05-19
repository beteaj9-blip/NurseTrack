package edu.cit.nursetracker.schedule;

import edu.cit.nursetracker.hospital.Hospital;
import edu.cit.nursetracker.hospital.HospitalRepository;
import edu.cit.nursetracker.user.User;
import edu.cit.nursetracker.user.UserRepository;
import edu.cit.nursetracker.user.UserRole;
import lombok.RequiredArgsConstructor;
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
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.IntStream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import javax.xml.parsers.DocumentBuilderFactory;

@Service
@RequiredArgsConstructor
public class ScheduleImportService {
    private final ScheduleRepository scheduleRepository;
    private final UserRepository userRepository;
    private final HospitalRepository hospitalRepository;

    public ScheduleImportPreview preview(MultipartFile file) {
        try {
            List<String[]> rows = readRows(file);
            int headerIndex = findHeaderIndex(rows);
            if (headerIndex < 0) throw new IllegalArgumentException("Schedule header not found.");
            int level = findLevel(rows, headerIndex).orElse(0);
            List<Hospital> hospitals = hospitalRepository.findAll();
            List<User> students = userRepository.findByRole(UserRole.STUDENT);
            List<User> instructors = userRepository.findByRole(UserRole.INSTRUCTOR);
            List<RawGroup> rawGroups = parseRawGroups(rows, headerIndex, hospitals);
            List<ScheduleImportGroup> groups = rawGroups.stream()
                    .map(raw -> toPreviewGroup(raw, level, hospitals, students, instructors))
                    .toList();
            int totalStudents = groups.stream().mapToInt(group -> group.students().size()).sum();
            int matchedStudents = groups.stream().mapToInt(ScheduleImportGroup::matchedStudents).sum();
            int skippedStudents = groups.stream().mapToInt(ScheduleImportGroup::skippedStudents).sum();
            return new ScheduleImportPreview(file.getOriginalFilename(), level, groups, totalStudents, matchedStudents, skippedStudents);
        } catch (Exception e) {
            throw new RuntimeException("Unable to preview schedule import", e);
        }
    }

    public ScheduleImportResult publish(ScheduleImportPreview preview) {
        List<Hospital> hospitals = hospitalRepository.findAll();
        List<User> students = userRepository.findByRole(UserRole.STUDENT);
        List<User> instructors = userRepository.findByRole(UserRole.INSTRUCTOR);
        int created = 0;
        int duplicates = 0;
        int matched = 0;
        int skippedStudents = 0;
        int groupsPublished = 0;
        int groupsSkipped = 0;
        for (ScheduleImportGroup group : preview.groups()) {
            Optional<Location> location = resolveLocation(group.hospitalArea(), hospitals);
            Optional<User> instructor = resolveUser(group.instructor(), instructors);
            Optional<LocalDate> startDate = parseDate(group.startDate());
            Optional<LocalDate> endDate = parseDate(group.endDate());
            Optional<LocalTime> startTime = parseTimeInput(group.shiftStart());
            Optional<LocalTime> endTime = parseTimeInput(group.shiftEnd());
            if (preview.level() <= 0 || location.isEmpty() || instructor.isEmpty() || startDate.isEmpty() || endDate.isEmpty() || startTime.isEmpty() || endTime.isEmpty()) {
                groupsSkipped++;
                skippedStudents += group.students().size();
                continue;
            }
            User ci = instructor.get();
            Set<Integer> ciLevels = new HashSet<>(ci.getAssignedLevels() == null ? Set.of() : ci.getAssignedLevels());
            ciLevels.add(preview.level());
            ci.setAssignedLevels(ciLevels);
            userRepository.save(ci);

            int groupCreated = 0;
            Set<LocalDate> breaks = parseBreakDates(group.breakDates());
            for (String studentName : group.students()) {
                Optional<User> student = resolveUser(studentName, students);
                if (student.isEmpty()) {
                    skippedStudents++;
                    continue;
                }
                User target = student.get();
                target.setSectionInfo(importSection(group));
                target.setGroupInfo(importGroup(group));
                target.setAssignedLevels(new HashSet<>(Set.of(preview.level())));
                userRepository.save(target);
                matched++;
                LocalDate date = startDate.get();
                while (!date.isAfter(endDate.get())) {
                    if (!breaks.contains(date)) {
                        boolean exists = scheduleRepository.existsByStudentIdAndInstructorIdAndHospitalIgnoreCaseAndWardIgnoreCaseAndShiftDateAndStartTimeAndEndTime(
                                target.getId(), ci.getId(), location.get().hospital().getName(), location.get().ward(), date, startTime.get(), endTime.get());
                        if (exists) duplicates++;
                        else {
                            scheduleRepository.save(Schedule.builder()
                                    .student(target)
                                    .instructor(ci)
                                    .hospital(location.get().hospital().getName())
                                    .ward(location.get().ward())
                                    .shiftDate(date)
                                    .startTime(startTime.get())
                                    .endTime(endTime.get())
                                    .build());
                            created++;
                            groupCreated++;
                        }
                    }
                    date = date.plusDays(1);
                }
            }
            if (groupCreated > 0) groupsPublished++;
        }
        return new ScheduleImportResult(created, duplicates, matched, skippedStudents, groupsPublished, groupsSkipped, preview.level());
    }

    private ScheduleImportGroup toPreviewGroup(RawGroup raw, int level, List<Hospital> hospitals, List<User> students, List<User> instructors) {
        DateRange dateRange = parseDateRange(String.join(" ", raw.dateParts())).orElse(new DateRange("", ""));
        TimeRange timeRange = raw.areaParts().stream().map(this::parseTimeRange).filter(Optional::isPresent).map(Optional::get).findFirst().orElse(new TimeRange("", ""));
        String hospitalArea = hospitalArea(raw.areaParts());
        Optional<User> matchedInstructor = resolveUser(String.join(" ", raw.instructorParts()), instructors);
        SectionGroup sectionGroup = splitSectionGroup(raw.section());
        List<ScheduleImportStudent> studentRecords = raw.students().stream()
                .map(student -> {
                    String displayName = displayStudentName(student);
                    Optional<User> matchedStudent = resolveUser(displayName, students);
                    return matchedStudent
                            .map(user -> new ScheduleImportStudent(user.getFullName(), true, user.getSchoolId(), user.getSectionInfo(), user.getGroupInfo(), user.getAssignedLevels(), user.getProfileImageUrl()))
                            .orElseGet(() -> new ScheduleImportStudent(displayName, false, null, null, null, null, null));
                })
                .toList();
        List<String> studentNames = studentRecords.stream().map(ScheduleImportStudent::name).toList();
        int matchedStudents = (int) studentRecords.stream().filter(ScheduleImportStudent::matched).count();
        return new ScheduleImportGroup(
                UUID.randomUUID().toString(),
                sectionGroup.section(),
                sectionGroup.group(),
                dateRange.startDate(),
                dateRange.endDate(),
                List.of(),
                timeRange.start(),
                timeRange.end(),
                hospitalArea,
                "Regular",
                "",
                "",
                true,
                matchedInstructor.map(User::getFullName).orElseGet(() -> cleanPersonName(String.join(" ", raw.instructorParts()))),
                studentNames,
                studentRecords,
                matchedStudents,
                studentRecords.size() - matchedStudents,
                matchedInstructor.isPresent(),
                resolveLocation(hospitalArea, hospitals).isPresent()
        );
    }

    private List<RawGroup> parseRawGroups(List<String[]> rows, int headerIndex, List<Hospital> hospitals) {
        String[] header = rows.get(headerIndex);
        int sectionIndex = findColumn(header, "section group", "section/group");
        int dateIndex = findColumn(header, "inclusive dates");
        int areaIndex = findColumn(header, "area shift", "area/shift");
        int studentIndex = findColumn(header, "name of students");
        int instructorIndex = findColumn(header, "clinical instructor");
        List<RawGroup> groups = new ArrayList<>();
        RawBuilder current = null;
        String lastSection = "";
        List<String> lastDates = new ArrayList<>();
        List<String> lastInstructor = new ArrayList<>();
        for (int i = headerIndex + 1; i < rows.size(); i++) {
            String[] row = rows.get(i);
            if (isBlank(row) || isHeader(row)) continue;
            String area = valueAt(row, areaIndex);
            if (current != null && !current.students.isEmpty() && !current.areaParts.isEmpty() && resolveHospital(area, hospitals).isPresent()) {
                RawGroup group = current.build();
                groups.add(group);
                lastSection = group.section();
                lastDates = group.dateParts().isEmpty() ? lastDates : new ArrayList<>(group.dateParts());
                lastInstructor = group.instructorParts().isEmpty() ? lastInstructor : new ArrayList<>(group.instructorParts());
                current = null;
            }
            if (current == null) current = new RawBuilder(lastSection, lastDates, lastInstructor);
            String section = valueAt(row, sectionIndex);
            String date = valueAt(row, dateIndex);
            String student = studentAt(row, studentIndex, instructorIndex);
            String instructor = valueAt(row, instructorIndex);
            if (!section.isBlank()) current.section = section;
            if (!date.isBlank()) current.dateParts.add(date);
            if (!area.isBlank()) current.areaParts.add(area);
            if (!instructor.isBlank()) current.instructorParts.add(instructor);
            if (!student.isBlank()) current.students.add(student);
        }
        if (current != null && !current.students.isEmpty()) groups.add(current.build());
        return groups;
    }

    private List<String[]> readRows(MultipartFile file) throws Exception {
        byte[] bytes = file.getBytes();
        String name = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase();
        if (name.endsWith(".xlsx") || isZip(bytes)) return readXlsxRows(bytes);
        List<String[]> rows = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(new ByteArrayInputStream(bytes), StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) rows.add(split(line));
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

    private String importSection(ScheduleImportGroup group) {
        if (group.section() != null && !group.section().isBlank()) return group.section().trim();
        return splitSectionGroup(group.group()).section();
    }

    private String importGroup(ScheduleImportGroup group) {
        if (group.group() != null && !group.group().isBlank()) return group.group().trim();
        return splitSectionGroup(group.section()).group();
    }

    private SectionGroup splitSectionGroup(String value) {
        String text = value == null ? "" : value.trim().replaceAll("\\s+", " ");
        if (text.isBlank()) return new SectionGroup("", "");
        Matcher groupMatcher = Pattern.compile("(?i)\\b(g\\s*\\d+[a-z]?)\\b").matcher(text);
        String group = "";
        String section = text;
        if (groupMatcher.find()) {
            group = groupMatcher.group(1).replaceAll("\\s+", "").toUpperCase();
            section = text.replace(groupMatcher.group(0), "").replaceAll("[-–—]", " ").replaceAll("\\s+", " ").trim();
        }
        return new SectionGroup(section, group);
    }

    private String[] split(String line) {
        String clean = line.replace("\uFEFF", "");
        String[] csv = clean.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)", -1);
        if (csv.length <= 1 && clean.contains("\t")) return clean.split("\t", -1);
        return csv;
    }

    private int findHeaderIndex(List<String[]> rows) {
        return IntStream.range(0, rows.size()).filter(index -> isHeader(rows.get(index))).findFirst().orElse(-1);
    }

    private boolean isHeader(String[] row) {
        String joined = key(String.join(" ", row));
        return joined.contains("section group") && joined.contains("inclusive dates") && joined.contains("area shift") && joined.contains("name of students") && joined.contains("clinical instructor");
    }

    private int findColumn(String[] header, String... names) {
        return IntStream.range(0, header.length)
                .filter(index -> List.of(names).stream().map(this::key).anyMatch(key(header[index])::equals))
                .findFirst()
                .orElse(-1);
    }

    private Optional<Integer> findLevel(List<String[]> rows, int headerIndex) {
        for (int i = 0; i < headerIndex; i++) {
            for (String value : rows.get(i)) {
                Optional<Integer> level = parseLevel(value);
                if (level.isPresent()) return level;
            }
        }
        return Optional.empty();
    }

    private Optional<Integer> parseLevel(String value) {
        String normalized = key(value);
        Matcher digit = Pattern.compile("(?:level|bsn)\\s*(\\d)").matcher(normalized);
        if (digit.find()) return Optional.of(Integer.parseInt(digit.group(1)));
        if (normalized.contains("level iii") || normalized.equals("iii")) return Optional.of(3);
        if (normalized.contains("level iv") || normalized.equals("iv")) return Optional.of(4);
        if (normalized.contains("level ii") || normalized.equals("ii")) return Optional.of(2);
        if (normalized.contains("level i") || normalized.equals("i")) return Optional.of(1);
        return Optional.empty();
    }

    private Optional<DateRange> parseDateRange(String value) {
        Matcher matcher = value.replace('–', '-').replace('—', '-').replaceAll("\\s+", " ").trim()
                .matches(".*") ? Pattern.compile("(?i)([a-z]{3,9})\\.?\\s+(\\d{1,2})\\s*(?:-|to)?\\s*(?:([a-z]{3,9})\\.?\\s*)?(\\d{1,2})?,?\\s*(\\d{4})").matcher(value.replace('–', '-').replace('—', '-')) : null;
        if (matcher == null || !matcher.find()) return Optional.empty();
        Month startMonth = month(matcher.group(1));
        Month endMonth = matcher.group(3) == null ? startMonth : month(matcher.group(3));
        return Optional.of(new DateRange(
                LocalDate.of(Integer.parseInt(matcher.group(5)), startMonth, Integer.parseInt(matcher.group(2))).toString(),
                LocalDate.of(Integer.parseInt(matcher.group(5)), endMonth, Integer.parseInt(matcher.group(4) == null ? matcher.group(2) : matcher.group(4))).toString()
        ));
    }

    private Optional<TimeRange> parseTimeRange(String value) {
        Matcher matcher = Pattern.compile("(\\d{1,2})(?::(\\d{2}))?\\s*(am|pm)\\s*(?:-|to)\\s*(\\d{1,2})(?::(\\d{2}))?\\s*(am|pm)", Pattern.CASE_INSENSITIVE)
                .matcher(value.replace('–', '-').replace('—', '-'));
        if (!matcher.find()) return Optional.empty();
        return Optional.of(new TimeRange(displayTime(matcher.group(1), matcher.group(2), matcher.group(3)), displayTime(matcher.group(4), matcher.group(5), matcher.group(6))));
    }

    private String displayTime(String hour, String minute, String period) {
        return String.format("%02d:%s %s", Integer.parseInt(hour), minute == null ? "00" : minute, period.toUpperCase());
    }

    private Optional<LocalTime> parseTimeInput(String value) {
        if (value == null || value.isBlank()) return Optional.empty();
        Matcher matcher = Pattern.compile("(\\d{1,2})(?::(\\d{2}))?\\s*(am|pm)", Pattern.CASE_INSENSITIVE).matcher(value);
        if (!matcher.find()) return Optional.empty();
        int hour = Integer.parseInt(matcher.group(1));
        int minute = matcher.group(2) == null ? 0 : Integer.parseInt(matcher.group(2));
        String period = matcher.group(3).toLowerCase();
        if (period.equals("pm") && hour != 12) hour += 12;
        if (period.equals("am") && hour == 12) hour = 0;
        return Optional.of(LocalTime.of(hour, minute));
    }

    private Optional<LocalDate> parseDate(String value) {
        if (value == null || value.isBlank()) return Optional.empty();
        return Optional.of(LocalDate.parse(value, DateTimeFormatter.ISO_DATE));
    }

    private Set<LocalDate> parseBreakDates(List<String> values) {
        Set<LocalDate> dates = new HashSet<>();
        for (String value : values == null ? List.<String>of() : values) parseDate(value).ifPresent(dates::add);
        return dates;
    }

    private Optional<Hospital> resolveHospital(String value, List<Hospital> hospitals) {
        String normalized = name(value);
        if (normalized.isBlank()) return Optional.empty();
        return hospitals.stream().filter(hospital -> java.util.stream.Stream.of(hospital.getName(), hospital.getFullName(), hospital.getLabel())
                .filter(item -> item != null && !item.isBlank()).map(this::name).anyMatch(normalized::equals)).findFirst();
    }

    private Optional<Location> resolveLocation(String value, List<Hospital> hospitals) {
        String[] parts = value == null ? new String[0] : value.split("\\s+-\\s+", 2);
        Optional<Hospital> hospital = parts.length > 0 ? resolveHospital(parts[0], hospitals) : Optional.empty();
        if (hospital.isEmpty()) return Optional.empty();
        String wardValue = parts.length > 1 ? parts[1] : "";
        List<String> wards = hospital.get().getWards() == null ? List.of() : hospital.get().getWards();
        return wards.stream().filter(ward -> name(ward).equals(name(wardValue))).findFirst().map(ward -> new Location(hospital.get(), ward));
    }

    private String hospitalArea(List<String> areaParts) {
        return String.join(" - ", areaParts.stream().filter(part -> parseTimeRange(part).isEmpty()).toList());
    }

    private Optional<User> resolveUser(String value, List<User> users) {
        String normalized = person(value);
        if (normalized.isBlank()) return Optional.empty();
        List<String> tokens = List.of(normalized.split(" ")).stream().filter(token -> token.length() > 1).toList();
        List<Map.Entry<User, Integer>> matches = users.stream().map(user -> Map.entry(user, score(tokens, normalized, person(user.getFullName()))))
                .filter(entry -> entry.getValue() > 0).sorted(Map.Entry.<User, Integer>comparingByValue(Comparator.reverseOrder())).toList();
        if (matches.isEmpty()) return Optional.empty();
        if (matches.size() > 1 && matches.get(0).getValue().equals(matches.get(1).getValue())) return Optional.empty();
        return Optional.of(matches.get(0).getKey());
    }

    private String studentAt(String[] row, int studentIndex, int instructorIndex) {
        if (studentIndex < 0) return "";
        int end = instructorIndex > studentIndex ? instructorIndex : Math.min(row.length, studentIndex + 2);
        StringBuilder value = new StringBuilder();
        for (int i = studentIndex; i < end; i++) {
            String part = stripStudentNumber(valueAt(row, i));
            if (!part.isBlank()) {
                if (!value.isEmpty()) value.append(' ');
                value.append(part);
            }
        }
        return value.toString().trim();
    }

    private int score(List<String> importTokens, String importName, String userName) {
        if (userName.equals(importName)) return 100;
        Set<String> importSet = new HashSet<>(importTokens);
        Set<String> userSet = new HashSet<>(List.of(userName.split(" ")).stream().filter(token -> token.length() > 1).toList());
        if (!importSet.isEmpty() && importSet.equals(userSet)) return 90;
        if (!importSet.isEmpty() && userSet.containsAll(importSet)) return 80;
        if (!userSet.isEmpty() && importSet.containsAll(userSet)) return 70;
        return 0;
    }

    private String displayStudentName(String value) { return stripStudentNumber(value).replaceAll("[\\s\\u00A0]+", " ").trim(); }
    private String stripStudentNumber(String value) { return (value == null ? "" : value).replace('\u00A0', ' ').replaceFirst("^\\s*\\d+\\s*[.)-]?\\s*", "").replaceAll("\\s+", " ").trim(); }
    private String cleanPersonName(String value) { return (value == null ? "" : value).replace('\u00A0', ' ').replaceAll("(?i)\\b(mr|mrs|ms|dr|prof)\\.?\\b", "").replaceAll("\\s+", " ").trim(); }
    private boolean isBlank(String[] row) { return List.of(row).stream().allMatch(value -> value == null || value.trim().isBlank()); }
    private String valueAt(String[] row, int index) { return index >= 0 && index < row.length ? row[index].replace("\"", "").trim() : ""; }
    private String key(String value) { return name(value).replace("/", " ").replaceAll("\\s+", " ").trim(); }
    private String person(String value) { return name(value).replaceAll("\\b(mr|mrs|ms|dr|prof)\\b", "").trim().replaceAll("\\s+", " "); }
    private String name(String value) { return Normalizer.normalize(value == null ? "" : value, Normalizer.Form.NFD).replaceAll("\\p{M}+", "").toLowerCase().replaceAll("[^a-z0-9/]+", " ").trim().replaceAll("\\s+", " "); }

    private Month month(String value) {
        return switch (value.toLowerCase().substring(0, 3)) {
            case "jan" -> Month.JANUARY; case "feb" -> Month.FEBRUARY; case "mar" -> Month.MARCH; case "apr" -> Month.APRIL; case "may" -> Month.MAY; case "jun" -> Month.JUNE; case "jul" -> Month.JULY; case "aug" -> Month.AUGUST; case "sep" -> Month.SEPTEMBER; case "oct" -> Month.OCTOBER; case "nov" -> Month.NOVEMBER; case "dec" -> Month.DECEMBER; default -> throw new IllegalArgumentException("Unknown month");
        };
    }

    private record DateRange(String startDate, String endDate) {}
    private record TimeRange(String start, String end) {}
    private record Location(Hospital hospital, String ward) {}
    private record SectionGroup(String section, String group) {}
    private record RawGroup(String section, List<String> dateParts, List<String> areaParts, List<String> instructorParts, List<String> students) {}
    private static class RawBuilder {
        private String section;
        private final List<String> dateParts;
        private final List<String> areaParts = new ArrayList<>();
        private final List<String> instructorParts;
        private final List<String> students = new ArrayList<>();
        private RawBuilder(String section, List<String> dateParts, List<String> instructorParts) {
            this.section = section;
            this.dateParts = new ArrayList<>(dateParts);
            this.instructorParts = new ArrayList<>(instructorParts);
        }
        private RawGroup build() { return new RawGroup(section, List.copyOf(dateParts), List.copyOf(areaParts), List.copyOf(instructorParts), List.copyOf(students)); }
    }
}
