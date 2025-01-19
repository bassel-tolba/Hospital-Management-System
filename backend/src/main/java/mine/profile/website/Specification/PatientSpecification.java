package mine.profile.website.Specification;

import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import mine.profile.website.models.Patient;

public class PatientSpecification implements Specification<Patient> {
    private String firstName;
    private String lastName;
    private String gender;
    private String email;
    private String address;

    public PatientSpecification(String firstName, String lastName, String gender, String email, String address) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.gender = gender;
        this.email = email;
        this.address = address;
    }

    @Override
    public Predicate toPredicate(Root<Patient> root, CriteriaQuery<?> query, CriteriaBuilder criteriaBuilder) {
        Predicate predicate = criteriaBuilder.conjunction();

        if (firstName != null && !firstName.isEmpty()) {
            predicate = criteriaBuilder.and(predicate,
                    criteriaBuilder.like(root.get("firstName"), "%" + firstName + "%"));
        }

        if (lastName != null && !lastName.isEmpty()) {
            predicate = criteriaBuilder.and(predicate,
                    criteriaBuilder.like(root.get("lastName"), "%" + lastName + "%"));
        }
        if (gender != null && !gender.isEmpty()) {
            predicate = criteriaBuilder.and(predicate, criteriaBuilder.equal(root.get("gender"), gender));
        }
        if (email != null && !email.isEmpty()) {
            predicate = criteriaBuilder.and(predicate, criteriaBuilder.like(root.get("email"), "%" + email + "%"));
        }
        if (address != null && !address.isEmpty()) {
            predicate = criteriaBuilder.and(predicate, criteriaBuilder.like(root.get("address"), "%" + address + "%"));
        }

        return predicate;
    }

}