package edu.cit.nursetracker.upload;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryUploadService {

    @Value("${cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${cloudinary.api-key:}")
    private String apiKey;

    @Value("${cloudinary.secret-key:}")
    private String secretKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public Map upload(MultipartFile file) throws Exception {
        if (cloudName.isBlank() || apiKey.isBlank() || secretKey.isBlank()) {
            throw new IllegalStateException("Cloudinary credentials are not configured.");
        }

        long timestamp = System.currentTimeMillis() / 1000;
        String folder = "nursetrack/appeals";
        String signature = sha1("folder=" + folder + "&timestamp=" + timestamp + secretKey);

        ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename();
            }
        };

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", fileResource);
        body.add("api_key", apiKey);
        body.add("timestamp", timestamp);
        body.add("folder", folder);
        body.add("signature", signature);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        String url = "https://api.cloudinary.com/v1_1/" + cloudName + "/auto/upload";
        return restTemplate.postForObject(url, new HttpEntity<>(body, headers), Map.class);
    }

    private String sha1(String input) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-1");
        return HexFormat.of().formatHex(digest.digest(input.getBytes(StandardCharsets.UTF_8)));
    }
}
