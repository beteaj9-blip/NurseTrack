package edu.cit.nursetracker.user;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;

@Service
public class JwtService {
    private static final String HMAC_ALGORITHM = "HmacSHA256";
    private static final long TOKEN_TTL_SECONDS = 60L * 60L * 24L;
    private final String secret = Optional.ofNullable(System.getenv("JWT_SECRET"))
            .filter(value -> !value.isBlank())
            .orElse("nursetracker-local-development-secret-change-me");

    public String createToken(User user) {
        long exp = Instant.now().getEpochSecond() + TOKEN_TTL_SECONDS;
        String header = base64Url("{\"alg\":\"HS256\",\"typ\":\"JWT\"}");
        String payload = base64Url("{\"sub\":" + user.getId() + ",\"role\":\"" + user.getRole().name() + "\",\"exp\":" + exp + "}");
        return header + "." + payload + "." + sign(header + "." + payload);
    }

    public Long getUserId(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) throw unauthorized("Missing authorization token.");
        String token = header.substring("Bearer ".length());
        String[] parts = token.split("\\.");
        if (parts.length != 3 || !sign(parts[0] + "." + parts[1]).equals(parts[2])) throw unauthorized("Invalid authorization token.");
        String payload = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
        long exp = Long.parseLong(extract(payload, "exp"));
        if (Instant.now().getEpochSecond() > exp) throw unauthorized("Authorization token expired.");
        return Long.parseLong(extract(payload, "sub"));
    }

    private ResponseStatusException unauthorized(String message) {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, message);
    }

    private String extract(String payload, String key) {
        String marker = "\"" + key + "\":";
        int start = payload.indexOf(marker);
        if (start < 0) throw unauthorized("Invalid authorization token.");
        start += marker.length();
        int end = payload.indexOf(',', start);
        if (end < 0) end = payload.indexOf('}', start);
        return payload.substring(start, end).replace("\"", "").trim();
    }

    private String sign(String value) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), HMAC_ALGORITHM));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new RuntimeException("Unable to sign authorization token.", e);
        }
    }

    private String base64Url(String value) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }
}
