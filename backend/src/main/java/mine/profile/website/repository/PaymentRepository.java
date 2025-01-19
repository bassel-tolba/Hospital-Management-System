package mine.profile.website.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import mine.profile.website.models.Payment;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByBillingId(Long billingId);
}