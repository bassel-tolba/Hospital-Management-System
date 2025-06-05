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

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Component
public class FileHandler {

    // @Value("${file.upload.directory}")
    private String uploadDirectory = "./api/uploads";//

    private final List<String> allowedImageExtensions = Arrays.asList(".png", ".jpeg", ".jpg", ".webp", ".gif",
            ".avif");
    private final List<String> allowedVideoExtensions = Arrays.asList(".mp4", ".mov", ".avi", ".mkv");
    private final List<String> allowedDocumentExtensions = Arrays.asList(".pdf", ".doc", ".docx", ".txt", ".xls",
            ".xlsx", ".csv", ".ppt", ".pptx");

    private final String IMAGE_DIR = "images";
    private final String VIDEO_DIR = "videos";
    private final String DOCUMENT_DIR = "documents";

    public String saveFile(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty.");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isEmpty()) {
            throw new IllegalArgumentException("Original filename is missing or null.");
        }

        int dotIndex = originalFilename.lastIndexOf(".");
        if (dotIndex == -1 || dotIndex == originalFilename.length() - 1) {
            throw new IllegalArgumentException("File has no extension or invalid extension.");
        }
        String fileExtension = originalFilename.substring(dotIndex).toLowerCase();

        String subDirectory;
        if (allowedImageExtensions.contains(fileExtension)) {
            subDirectory = IMAGE_DIR;
        } else if (allowedVideoExtensions.contains(fileExtension)) {
            subDirectory = VIDEO_DIR;
        } else if (allowedDocumentExtensions.contains(fileExtension)) {
            subDirectory = DOCUMENT_DIR;
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

        return filePath.toString();
    }

    public String getSubdirectory(String filePath) {
        if (filePath == null || !filePath.startsWith(uploadDirectory)) {
            return null; // Return null if the filePath does not start with uploadDirectory
        }
        String remainingPath = filePath.substring(uploadDirectory.length());
        String[] parts = remainingPath.split("/");

        if (parts.length < 2) {
            return null; // return null if the file is in the root of the directory.
        }
        return parts[1]; // the second part is the subdirectory name
    }
}