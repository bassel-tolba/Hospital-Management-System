package mine.profile.website.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import jakarta.persistence.EntityNotFoundException;
import mine.profile.website.dtos.ImageReportDTO;
import mine.profile.website.mapper.EntityMapper;
import mine.profile.website.models.Billing;
import mine.profile.website.models.ImageReport;
import mine.profile.website.models.ImageReportType;
import mine.profile.website.models.Patient;
import mine.profile.website.models.User;
import mine.profile.website.repository.BillingRepository;
import mine.profile.website.repository.ImageReportRepository;
import mine.profile.website.repository.ImageReportTypeRepository;
import mine.profile.website.repository.PatientRepository;
import mine.profile.website.repository.UserRepository;
import mine.profile.website.util.FileHandler;

@Service
public class ImageReportService {

    @Autowired
    private ImageReportRepository imageReportRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ImageReportTypeRepository imageReportTypeRepository;

    @Autowired
    private EntityMapper entityMapper;

    @Autowired
    private FileHandler fileHandler;

    @Autowired
    private BillingRepository billingRepository;

    @Transactional
    public ImageReportDTO createImageReport(ImageReportDTO imageReportDTO, List<MultipartFile> imageFiles)
            throws IOException {
        List<String> imageUrls = new ArrayList<>();
        if (imageFiles != null && !imageFiles.isEmpty()) {
            for (MultipartFile imageFile : imageFiles) {
                if (imageFile != null && !imageFile.isEmpty()) {
                    String imageUrl = fileHandler.saveFile(imageFile);
                    imageUrls.add(imageUrl);
                }
            }
        }

        Patient patient = patientRepository.findById(imageReportDTO.getPatientId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Patient not found with id: " + imageReportDTO.getPatientId()));

        User user = userRepository.findById(imageReportDTO.getPerformedById())
                .orElseThrow(() -> new EntityNotFoundException(
                        "User not found with id: " + imageReportDTO.getPerformedById()));

        ImageReportType imageReportType = imageReportTypeRepository.findById(imageReportDTO.getImageReportTypeId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Image Report Type not found with id: " + imageReportDTO.getImageReportTypeId()));

        Billing billing = null;
        List<Billing> bills = billingRepository.findByPatientIdOrderByBillDateDesc(patient.getId());
        if (!bills.isEmpty()) {
            billing = bills.get(0); // Get the most recent bill
        }
        ImageReport imageReport = entityMapper.toEntity(imageReportDTO, patient, user, imageReportType, billing);
        imageReport.setImageUrls(imageUrls);
        ImageReport savedImageReport = imageReportRepository.save(imageReport);
        return entityMapper.toDto(savedImageReport);
    }

    @Transactional
    public ImageReportDTO getImageReportById(Long id) {
        ImageReport imageReport = imageReportRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Image report not found with id: " + id));

        return entityMapper.toDto(imageReport);
    }

    @Transactional
    public Page<ImageReportDTO> findByPatientId(Long patientId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ImageReport> imageReportPage = imageReportRepository.findByPatientId(patientId, pageable);
        return imageReportPage.map(entityMapper::toDto);
    }

    @Transactional
    public ImageReportDTO updateImageReport(Long id, ImageReportDTO imageReportDTO, List<MultipartFile> imageFiles)
            throws IOException {
        ImageReport existingImageReport = imageReportRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Image report not found with id: " + id));

        Patient patient = patientRepository.findById(imageReportDTO.getPatientId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Patient not found with id: " + imageReportDTO.getPatientId()));

        User user = userRepository.findById(imageReportDTO.getPerformedById())
                .orElseThrow(() -> new EntityNotFoundException(
                        "User not found with id: " + imageReportDTO.getPerformedById()));
        ImageReportType imageReportType = imageReportTypeRepository.findById(imageReportDTO.getImageReportTypeId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Image Report Type not found with id: " + imageReportDTO.getImageReportTypeId()));
        Billing billing = null;
        List<Billing> bills = billingRepository.findByPatientIdOrderByBillDateDesc(patient.getId());
        if (!bills.isEmpty()) {
            billing = bills.get(0); // Get the most recent bill
        }

        // replace the imageUrls with the new ones, not add to them
        List<String> imageUrls = new ArrayList<>();

        if (imageFiles != null && !imageFiles.isEmpty()) {
            for (MultipartFile imageFile : imageFiles) {
                if (imageFile != null && !imageFile.isEmpty()) {
                    String imageUrl = fileHandler.saveFile(imageFile);
                    imageUrls.add(imageUrl);
                }
            }

        }

        existingImageReport.setReportDateTime(imageReportDTO.getReportDateTime());
        existingImageReport.setDescription(imageReportDTO.getDescription());
        existingImageReport.setReportText(imageReportDTO.getReportText());
        existingImageReport.setImageUrls(imageUrls);
        existingImageReport.setPatient(patient);
        existingImageReport.setPerformedBy(user);
        existingImageReport.setImageReportType(imageReportType);
        existingImageReport.setBilling(billing);

        ImageReport updatedImageReport = imageReportRepository.save(existingImageReport);
        return entityMapper.toDto(updatedImageReport);
    }

    @Transactional
    public void deleteImageReport(Long id) {
        if (!imageReportRepository.existsById(id)) {
            throw new EntityNotFoundException("Image report not found with id: " + id);
        }
        imageReportRepository.deleteById(id);
    }
}