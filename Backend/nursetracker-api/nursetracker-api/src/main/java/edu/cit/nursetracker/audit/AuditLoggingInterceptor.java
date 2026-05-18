package edu.cit.nursetracker.audit;

import edu.cit.nursetracker.user.JwtService;
import edu.cit.nursetracker.user.User;
import edu.cit.nursetracker.user.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.servlet.HandlerInterceptor;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
@RequiredArgsConstructor
public class AuditLoggingInterceptor implements HandlerInterceptor {
    private static final Set<String> MUTATING_METHODS = Set.of("POST", "PUT", "PATCH", "DELETE");
    private static final Pattern JSON_STRING_FIELD = Pattern.compile("\\\"%s\\\"\\s*:\\s*\\\"([^\\\"]*)\\\"");
    private static final Pattern JSON_NUMBER_FIELD = Pattern.compile("\\\"%s\\\"\\s*:\\s*([0-9]+)");
    private static final Map<String, String> RESOURCE_LABELS = Map.ofEntries(
            Map.entry("users", "User"),
            Map.entry("schedules", "Schedule"),
            Map.entry("duties", "Duty Record"),
            Map.entry("cases", "Clinical Case"),
            Map.entry("appeals", "Appeal"),
            Map.entry("extension-days", "Extension Day"),
            Map.entry("clearances", "Clearance"),
            Map.entry("notifications", "Notification"),
            Map.entry("hospitals", "Hospital"),
            Map.entry("admin-access-permissions", "Access Permission"),
            Map.entry("uploads", "Upload"),
            Map.entry("checklist", "Checklist Item"),
            Map.entry("reports", "Report")
    );

    private final AuditLogService auditLogService;
    private final JwtService jwtService;
    private final UserService userService;

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        String method = request.getMethod();
        String path = request.getRequestURI();
        if (!MUTATING_METHODS.contains(method) || path.startsWith("/api/audit-logs") || isAuthNoise(path) || response.getStatus() >= 400) {
            return;
        }

        String actor = "Unauthenticated";
        String actorRole = "SYSTEM";
        try {
            Long userId = jwtService.getUserId(request);
            User user = userService.getUserById(userId).orElse(null);
            if (user != null) {
                actor = user.getFullName();
                actorRole = user.getRole().name();
            }
        } catch (Exception ignored) {
            // Some system-level operations can occur before a token exists.
        }

        String body = requestBody(request);
        AffectedRecord affectedRecord = affectedRecord(path, request.getQueryString(), body);

        auditLogService.create(
                actor,
                actorRole,
                actionLabel(method, path),
                affectedRecord.name(),
                affectedRecord.context(),
                category(path)
        );
    }

    private boolean isAuthNoise(String path) {
        return path.equals("/api/users/login") || path.equals("/api/users/register");
    }

    private String actionLabel(String method, String path) {
        if (path.contains("/validate")) return "Validated record";
        if (path.contains("/status")) return "Changed status";
        if (path.contains("/cancel")) return "Canceled record";
        if (path.contains("/read-all")) return "Marked all as read";
        if (path.endsWith("/read")) return "Marked as read";
        if (path.endsWith("/unread")) return "Marked as unread";
        if (path.contains("/time-in")) return "Submitted time in";
        if (path.contains("/time-out")) return "Submitted time out";
        if (path.contains("/manual")) return method.equals("POST") ? "Submitted manual attendance" : "Edited manual attendance";
        if (path.contains("/section-import")) return "Imported section assignments";
        return switch (method) {
            case "POST" -> "Submitted record";
            case "PUT", "PATCH" -> "Edited record";
            case "DELETE" -> "Deleted record";
            default -> method + " record";
        };
    }

    private String category(String path) {
        String[] parts = path.split("/");
        return parts.length > 2 ? parts[2] : "system";
    }

    private AffectedRecord affectedRecord(String path, String query, String body) {
        String resource = category(path);
        String label = RESOURCE_LABELS.getOrDefault(resource, humanize(resource));
        String name = firstBodyValue(body, List.of(
                "recordName", "studentName", "fullName", "name", "title", "hospital", "schoolId",
                "caseTitle", "procedurePerformed", "diagnosis", "permissionKey", "role", "userId"
        ));
        String context = firstBodyValue(body, List.of(
                "context", "sectionInfo", "studentSection", "section", "area", "dutyArea", "ward", "status",
                "reason", "type", "category", "startTime", "endTime", "semester", "schoolYear"
        ));

        if (path.contains("/section-import")) {
            return new AffectedRecord("Section Assignments", "CSV import");
        }

        if (path.contains("admin-access-permissions")) {
            String[] parts = path.split("/");
            String role = parts.length > 3 ? humanize(parts[3]) : "Access";
            String permission = parts.length > 4 ? humanize(parts[4]) : "Permission";
            return new AffectedRecord(role + " Permission", permission);
        }

        String id = firstNumericSegment(path);
        if (resource.equals("users") && !id.isBlank()) {
            return userService.getUserById(Long.parseLong(id))
                    .map(user -> new AffectedRecord(user.getFullName(), user.getSchoolId() + (user.getSectionInfo() == null || user.getSectionInfo().isBlank() ? "" : " - " + user.getSectionInfo())))
                    .orElse(new AffectedRecord(label + " #" + id, label));
        }

        if (name.isBlank()) {
            name = id.isBlank() ? label : label + " #" + id;
        }

        if (context.isBlank()) {
            String subAction = lastNonNumericSegment(path);
            if (!subAction.isBlank() && !subAction.equals(resource)) context = humanize(subAction);
            else if (query != null && !query.isBlank()) context = humanize(query.replace('&', ' '));
            else context = label;
        }

        return new AffectedRecord(name, context);
    }

    private String requestBody(HttpServletRequest request) {
        if (!(request instanceof ContentCachingRequestWrapper wrapper)) return "";
        byte[] content = wrapper.getContentAsByteArray();
        if (content.length == 0) return "";
        return new String(content, StandardCharsets.UTF_8);
    }

    private String firstBodyValue(String body, List<String> fields) {
        if (body == null || body.isBlank()) return "";
        for (String field : fields) {
            String value = bodyValue(body, field);
            if (!value.isBlank()) return value;
        }
        return "";
    }

    private String bodyValue(String body, String field) {
        Matcher stringMatcher = Pattern.compile(String.format(JSON_STRING_FIELD.pattern(), Pattern.quote(field))).matcher(body);
        if (stringMatcher.find()) return stringMatcher.group(1).trim();
        Matcher numberMatcher = Pattern.compile(String.format(JSON_NUMBER_FIELD.pattern(), Pattern.quote(field))).matcher(body);
        if (numberMatcher.find()) return numberMatcher.group(1).trim();
        return "";
    }

    private String firstNumericSegment(String path) {
        return Arrays.stream(path.split("/"))
                .filter(part -> part.matches("\\d+"))
                .findFirst()
                .orElse("");
    }

    private String lastNonNumericSegment(String path) {
        String[] parts = path.split("/");
        for (int index = parts.length - 1; index >= 0; index--) {
            String part = parts[index];
            if (!part.isBlank() && !part.equals("api") && !part.matches("\\d+")) return part;
        }
        return "";
    }

    private String humanize(String value) {
        if (value == null || value.isBlank()) return "Record";
        String spaced = value.replaceAll("([a-z])([A-Z])", "$1 $2").replace('-', ' ').replace('_', ' ');
        String[] words = spaced.trim().split("\\s+");
        return Arrays.stream(words)
                .filter(word -> !word.isBlank())
                .map(word -> word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase())
                .reduce((left, right) -> left + " " + right)
                .orElse("Record");
    }

    private record AffectedRecord(String name, String context) {}
}
