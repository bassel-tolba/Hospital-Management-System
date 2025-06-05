package mine.profile.website.rest.controller;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.support.ResourceRegion;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpRange;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import mine.profile.website.util.FileHandler;

@RestController
@RequestMapping("/api/uploads")
public class FileServingController {

    // @Value("${file.upload.directory}")
    private String fileUploadDirectory = "./api/uploads";// ="/api/uploads"

    private final FileHandler fileHandler;

    public FileServingController(FileHandler fileHandler) {
        this.fileHandler = fileHandler;
    }

    @GetMapping("/{subdirectory}/{filename}")
    public ResponseEntity<ResourceRegion> getUploadedFile(
            @PathVariable String subdirectory,
            @PathVariable String filename,
            @RequestHeader HttpHeaders headers) throws IOException { // Add headers parameter

        Path filePath = Paths.get(fileUploadDirectory, subdirectory, filename);
        FileSystemResource fileResource = new FileSystemResource(filePath.toFile());

        if (!fileResource.exists()) {
            return ResponseEntity.notFound().build();
        }

        // Determine the Content-Type (MIME type) dynamically
        MediaType mediaType = MediaTypeFactory
                .getMediaType(fileResource)
                .orElse(MediaType.APPLICATION_OCTET_STREAM); // Default if not determined.

        // --- Range Request Handling ---
        long contentLength = fileResource.contentLength();
        List<HttpRange> ranges = headers.getRange();
        ResourceRegion region;

        if (ranges != null && !ranges.isEmpty()) { // Check if the client has requested a specific range
            // We only support a single range for simplicity
            HttpRange range = ranges.get(0);
            long start = range.getRangeStart(contentLength); // Where to begin
            long end = range.getRangeEnd(contentLength); // Where to end
            // +1 because it's inclusive, min(available, desiredEnd - desiredStart + 1)
            long rangeLength = Math.min(1024 * 1024, end - start + 1); // Send 1MB chunks. Adjust as needed.
            region = new ResourceRegion(fileResource, start, rangeLength);
            return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT) // 206
                    .contentType(mediaType)
                    .header(HttpHeaders.ACCEPT_RANGES, "bytes") // Important for the client to know
                    .body(region);
        } else {
            // If no range is specified, return the entire file
            region = new ResourceRegion(fileResource, 0, contentLength); // Return the entire file
            return ResponseEntity.status(HttpStatus.OK)
                    .contentType(mediaType)
                    .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                    .body(region);
        }

    }
}