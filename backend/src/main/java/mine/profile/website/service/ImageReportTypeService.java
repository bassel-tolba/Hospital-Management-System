package mine.profile.website.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import mine.profile.website.dtos.ImageReportTypeDTO;
import mine.profile.website.mapper.EntityMapper;
import mine.profile.website.models.ImageReportType;
import mine.profile.website.repository.ImageReportTypeRepository;

@Service
public class ImageReportTypeService {

    @Autowired
    private ImageReportTypeRepository imageReportTypeRepository;
    @Autowired
    private EntityMapper entityMapper;

    @Transactional
    public ImageReportTypeDTO createImageReportType(ImageReportTypeDTO imageReportTypeDTO) {
        ImageReportType imageReportType = entityMapper.toEntity(imageReportTypeDTO);
        ImageReportType savedImageReportType = imageReportTypeRepository.save(imageReportType);
        return entityMapper.toDto(savedImageReportType);

    }

    @Transactional
    public ImageReportTypeDTO getImageReportTypeById(Long id) {
        ImageReportType imageReportType = imageReportTypeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Image Report Type not found with id: " + id));
        return entityMapper.toDto(imageReportType);
    }

    @Transactional
    public Page<ImageReportTypeDTO> getAllImageReportTypes(Pageable pageable) {
        Page<ImageReportType> imageReportTypesPage = imageReportTypeRepository.findAll(pageable);
        return imageReportTypesPage.map(entityMapper::toDto);
    }

    @Transactional
    public ImageReportTypeDTO updateImageReportType(Long id, ImageReportTypeDTO imageReportTypeDTO) {
        ImageReportType existingImageReportType = imageReportTypeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Image Report Type not found with id: " + id));

        existingImageReportType.setName(imageReportTypeDTO.getName());
        existingImageReportType.setPrice(imageReportTypeDTO.getPrice());

        ImageReportType updatedImageReportType = imageReportTypeRepository.save(existingImageReportType);
        return entityMapper.toDto(updatedImageReportType);
    }

    @Transactional
    public void deleteImageReportType(Long id) {
        if (!imageReportTypeRepository.existsById(id)) {
            throw new EntityNotFoundException("Image Report Type not found with id: " + id);
        }
        imageReportTypeRepository.deleteById(id);
    }

}