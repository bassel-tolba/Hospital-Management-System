package mine.profile.website.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import mine.profile.website.models.Inventory;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    Optional<Inventory> findByProductId(Long productId);
}