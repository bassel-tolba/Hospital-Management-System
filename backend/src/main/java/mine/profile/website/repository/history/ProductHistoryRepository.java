// In ProductHistoryRepository.java
package mine.profile.website.repository.history;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import mine.profile.website.models.history.ProductHistory;

public interface ProductHistoryRepository extends JpaRepository<ProductHistory, Long> {
    Page<ProductHistory> findAllByTimestampBetween(LocalDateTime start, LocalDateTime end, Pageable pageable);

    Page<ProductHistory> findAllByProductIdAndTimestampBetween(Long productId, LocalDateTime start,
            LocalDateTime end, Pageable pageable);

    void deleteAll();
}