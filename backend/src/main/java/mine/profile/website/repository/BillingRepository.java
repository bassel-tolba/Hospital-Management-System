package mine.profile.website.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import mine.profile.website.models.Billing;

public interface BillingRepository extends JpaRepository<Billing, Long> {
    List<Billing> findByPatientId(Long patientId);

    Page<Billing> findByPatientId(Long patientId, Pageable pageable);

    @Query("SELECT b FROM Billing b WHERE b.patient.id = :patientId ORDER BY b.billDate DESC")
    List<Billing> findByPatientIdOrderByBillDateDesc(@Param("patientId") Long patientId);

    @Query("SELECT b FROM Billing b")
    List<Billing> findAllBills();

    @Query("SELECT SUM(b.totalAmount) FROM Billing b")
    Double getTotalRevenue();

    @Query("SELECT SUM(b.totalAmount) - COALESCE((SELECT SUM(pm.amount) FROM Payment pm WHERE pm.billing = b), 0) FROM Billing b")
    Double getPendingBills();

    Page<Billing> findByPatientIdOrderByBillDateDesc(Long patientId, Pageable pageable);

    @Query("SELECT b FROM Billing b WHERE b.patient.id = :patientId AND b.billDate >= :admissionDate ORDER BY b.billDate DESC")
    Page<Billing> findByPatientIdAndBillDateAfter(
            @Param("patientId") Long patientId,
            @Param("admissionDate") LocalDateTime admissionDate,
            Pageable pageable);

}