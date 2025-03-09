package mine.profile.website.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import mine.profile.website.models.ProcedureLog;

public interface ProcedureLogRepository extends JpaRepository<ProcedureLog, Long> {
    List<ProcedureLog> findByBillingId(Long billingId);

    // Changed to return Page<ProcedureLog> and accept Pageable
    Page<ProcedureLog> findByPatientId(Long patientId, Pageable pageable);

    Page<ProcedureLog> findByUserId(Long userId, Pageable pageable);

    // Dashboard Queries
    @Query("SELECT COUNT(pl) FROM ProcedureLog pl")
    long countAllProcedureLogs();

    @Query("SELECT pl.procedure.name, COUNT(pl) FROM ProcedureLog pl GROUP BY pl.procedure.name ORDER BY COUNT(pl) DESC")
    List<Object[]> countProcedureLogsByProcedure();

    @Query(value = "SELECT DATE(start_time) as date, count(*) from procedure_log group by date", nativeQuery = true)
    List<Object[]> countProceduresByDate();
}