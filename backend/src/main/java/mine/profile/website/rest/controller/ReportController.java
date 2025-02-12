package mine.profile.website.rest.controller;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import mine.profile.website.dtos.LabResultDTO;
import mine.profile.website.models.Patient;
import mine.profile.website.repository.PatientRepository;
import mine.profile.website.service.LabResultService;
import mine.profile.website.services.PatientService;

@RestController
@RequestMapping("/api/reports") // Changed endpoint
public class ReportController { // Changed controller name

    @Autowired
    private LabResultService labResultService;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private PatientService patientService; // Autowire PatientService

    @GetMapping(value = "/lab-result/{id}", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> getLabResultPdf(@PathVariable Long id) {
        LabResultDTO labResultDTO = labResultService.getLabResultById(id);

        if (labResultDTO == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        try {
            byte[] pdfBytes = generateLabResultPdf(labResultDTO);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("inline", "lab_result_" + id + ".pdf");

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);

        } catch (Exception e) {
            e.printStackTrace(); // Crucial for debugging!
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private byte[] generateLabResultPdf(LabResultDTO labResultDTO) throws IOException {
        PDDocument document = new PDDocument();
        PDPage page = new PDPage(PDRectangle.A4); // Set page size
        document.addPage(page);

        try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
            float margin = 50;
            float yPosition = page.getMediaBox().getHeight() - margin; // Start from top, subtract margin
            float xPosition = margin;
            float tableWidth = page.getMediaBox().getWidth() - 2 * margin;

            // Hospital Header
            drawText(contentStream, "Acme Hospital - Lab Results", PDType1Font.HELVETICA_BOLD, 16, xPosition,
                    yPosition);
            yPosition -= 20;

            // Patient Information
            Patient patient = patientRepository.findById(labResultDTO.getPatientId()).get();
            if (patient != null) {
                String patientInfo = String.format(
                        "Patient ID: %d\nPatient Name: %s\nDate of Birth: %s",
                        labResultDTO.getPatientId(),
                        patient.getFirstName() + " " + patient.getLastName(),
                        patient.getDateOfBirth().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
                drawText(contentStream, patientInfo, PDType1Font.HELVETICA, 12, xPosition, yPosition);
                yPosition -= (20 * patientInfo.split("\n").length); // Adjust based on # of lines
            } else {
                drawText(contentStream, "Patient information not found.", PDType1Font.HELVETICA, 12, xPosition,
                        yPosition);
                yPosition -= 20;
            }

            // Lab Result Details
            // Since User and LabTest objects are not accessible , the names cant be shown
            String labResultDetails = String.format(
                    "Test Name: %s\nResult Date: %s\nPerformed By ID: %s\nNotes: %s",
                    labResultDTO.getLabTestId(),
                    labResultDTO.getResultDateTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")),
                    labResultDTO.getPerformedById(),
                    labResultDTO.getNotes());
            drawText(contentStream, labResultDetails, PDType1Font.HELVETICA, 12, xPosition, yPosition);
            yPosition -= (20 * labResultDetails.split("\n").length); // Adjust based on # of lines

            // Table Generation
            Map<String, Object> resultMap = labResultDTO.getResultMap(); // Use resultMap directly
            if (resultMap != null && resultMap.containsKey("table")) {
                Map<String, Object> tableData = (Map<String, Object>) resultMap.get("table");

                if (tableData != null) {
                    List<String> headers = (List<String>) tableData.get("headers");
                    List<List<String>> rows = (List<List<String>>) tableData.get("rows");

                    if (headers != null && rows != null) {
                        drawTable(contentStream, yPosition, xPosition, tableWidth, headers, rows);
                    }
                }
            } else {
                drawText(contentStream, "No structured result data found for this test.", PDType1Font.HELVETICA, 12,
                        xPosition, yPosition);
            }

        } // try-with-resources ensures contentStream is closed

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        document.save(outputStream);
        document.close(); // Important to close the document!
        return outputStream.toByteArray();
    }

    private void drawText(PDPageContentStream contentStream, String text, org.apache.pdfbox.pdmodel.font.PDFont font,
            float fontSize, float x, float y) throws IOException {
        contentStream.beginText();
        contentStream.setFont(font, fontSize);
        contentStream.newLineAtOffset(x, y);
        String[] lines = text.split("\n"); // Handle multi-line text
        for (String line : lines) {
            contentStream.showText(line);
            contentStream.newLineAtOffset(0, -15); // Adjust line spacing as needed
        }
        contentStream.endText();
    }

    private void drawTable(PDPageContentStream contentStream, float yPosition, float xPosition, float tableWidth,
            List<String> headers, List<List<String>> rows) throws IOException {
        float rowHeight = 20f;
        float colWidth = tableWidth / headers.size();

        // Draw Header Row
        float currentX = xPosition;
        float currentY = yPosition;

        // Draw Header Cells
        for (String header : headers) {
            drawCell(contentStream, currentX, currentY, colWidth, rowHeight, header, true);
            currentX += colWidth;
        }
        yPosition -= rowHeight; // Move to the next row
        currentY = yPosition;

        // Draw Data Rows
        for (List<String> rowData : rows) {
            currentX = xPosition;
            for (String cellData : rowData) {
                String data = (cellData != null) ? cellData : "";
                drawCell(contentStream, currentX, currentY, colWidth, rowHeight, data, false);
                currentX += colWidth;
            }
            yPosition -= rowHeight; // Move to the next row
            currentY = yPosition;
        }
    }

    private void drawCell(PDPageContentStream contentStream, float x, float y, float width, float height, String text,
            boolean isHeader) throws IOException {
        // Draw Cell Rectangle
        contentStream.setNonStrokingColor(255, 255, 255); // White fill
        contentStream.addRect(x, y, width, height);
        contentStream.fillAndStroke();

        // Draw Text
        float textX = x + 5; // Add some padding
        float textY = y + (height / 2) - 5; // Vertically center the text

        contentStream.beginText();
        contentStream.setFont(isHeader ? PDType1Font.HELVETICA_BOLD : PDType1Font.HELVETICA, 10);
        contentStream.newLineAtOffset(textX, textY);
        contentStream.showText(text);
        contentStream.endText();
    }

}