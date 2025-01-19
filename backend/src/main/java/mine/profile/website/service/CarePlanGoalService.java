package mine.profile.website.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import mine.profile.website.dtos.CarePlanGoalDTO;
import mine.profile.website.mapper.EntityMapper;
import mine.profile.website.models.CarePlanGoal;
import mine.profile.website.models.NursingCarePlan;
import mine.profile.website.repository.CarePlanGoalRepository;
import mine.profile.website.repository.NursingCarePlanRepository;

@Service
public class CarePlanGoalService {

    @Autowired
    private CarePlanGoalRepository carePlanGoalRepository;

    @Autowired
    private NursingCarePlanRepository nursingCarePlanRepository;

    @Autowired
    private EntityMapper entityMapper;

    @Transactional
    public CarePlanGoalDTO createCarePlanGoal(CarePlanGoalDTO carePlanGoalDTO) {
        NursingCarePlan nursingCarePlan = nursingCarePlanRepository.findById(carePlanGoalDTO.getNursingCarePlanId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Nursing Care Plan not found with id: " + carePlanGoalDTO.getNursingCarePlanId()));

        CarePlanGoal carePlanGoal = entityMapper.toEntity(carePlanGoalDTO, nursingCarePlan);
        CarePlanGoal savedCarePlanGoal = carePlanGoalRepository.save(carePlanGoal);
        return entityMapper.toDto(savedCarePlanGoal);
    }

    @Transactional
    public CarePlanGoalDTO getCarePlanGoalById(Long id) {
        CarePlanGoal carePlanGoal = carePlanGoalRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Care Plan Goal not found with id: " + id));
        return entityMapper.toDto(carePlanGoal);
    }

    // @Transactional
    // public Page<CarePlanGoalDTO> findByNursingCarePlanId(Long nursingCarePlanId,
    // int page, int size) {
    // Pageable pageable = PageRequest.of(page, size);
    // Page<CarePlanGoal> carePlanGoalPage =
    // carePlanGoalRepository.findByNursingCarePlanId(nursingCarePlanId,
    // pageable);
    // return carePlanGoalPage.map(entityMapper::toDto);
    // }

    @Transactional
    public CarePlanGoalDTO updateCarePlanGoal(Long id, CarePlanGoalDTO carePlanGoalDTO) {
        CarePlanGoal existingCarePlanGoal = carePlanGoalRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Care Plan Goal not found with id: " + id));
        NursingCarePlan nursingCarePlan = nursingCarePlanRepository.findById(carePlanGoalDTO.getNursingCarePlanId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Nursing Care Plan not found with id: " + carePlanGoalDTO.getNursingCarePlanId()));

        existingCarePlanGoal.setDescription(carePlanGoalDTO.getDescription());
        existingCarePlanGoal.setTargetOutcome(carePlanGoalDTO.getTargetOutcome());
        existingCarePlanGoal.setNursingCarePlan(nursingCarePlan);

        CarePlanGoal updatedCarePlanGoal = carePlanGoalRepository.save(existingCarePlanGoal);
        return entityMapper.toDto(updatedCarePlanGoal);
    }

    @Transactional
    public void deleteCarePlanGoal(Long id) {
        if (!carePlanGoalRepository.existsById(id)) {
            throw new EntityNotFoundException("Care Plan Goal not found with id: " + id);
        }
        carePlanGoalRepository.deleteById(id);
    }
}