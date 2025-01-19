package mine.profile.website.util;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Component
public class FileHandler {

    @Value("${file.upload.directory}")
    private String uploadDirectory;

    private final List<String> allowedImageExtensions = Arrays.asList(".png", ".jpeg", ".jpg", ".webp", ".gif");
    private final List<String> allowedVideoExtensions = Arrays.asList(".mp4", ".mov", ".avi", ".mkv");

    private final String IMAGE_DIR = "images";
    private final String VIDEO_DIR = "videos";

    public String saveFile(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty.");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new IllegalArgumentException("Original file name is null.");
        }
        String fileExtension = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();

        String subDirectory;
        if (allowedImageExtensions.contains(fileExtension)) {
            subDirectory = IMAGE_DIR;
        } else if (allowedVideoExtensions.contains(fileExtension)) {
            subDirectory = VIDEO_DIR;
        } else {
            throw new IllegalArgumentException("File extension " + fileExtension + " is not allowed.");
        }

        String uniqueFileName = UUID.randomUUID().toString() + fileExtension;
        Path uploadPath = Paths.get(uploadDirectory, subDirectory);

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        Path filePath = uploadPath.resolve(uniqueFileName);

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new IOException("Failed to store file " + uniqueFileName, e);
        }

        return filePath.toString(); // Changed this return
    }

    public String getSubdirectory(String filePath) { // modified this method
        if (filePath == null || !filePath.startsWith("/")) {
            return null;
        }
        String[] parts = filePath.split("/");
        if (parts.length < 2) {
            return null;
        }
        return parts[1];
    }
}