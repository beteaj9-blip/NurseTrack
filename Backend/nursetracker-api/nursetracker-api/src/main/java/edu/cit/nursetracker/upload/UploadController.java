package edu.cit.nursetracker.upload;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/uploads")
@RequiredArgsConstructor
public class UploadController {

    private final CloudinaryUploadService cloudinaryUploadService;

    @PostMapping("/cloudinary")
    public ResponseEntity<Map> uploadToCloudinary(@RequestParam("file") MultipartFile file) throws Exception {
        return ResponseEntity.ok(cloudinaryUploadService.upload(file));
    }
}
