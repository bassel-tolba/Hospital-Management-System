package mine.profile.website.models; // Or your preferred model package

import java.time.LocalDateTime;

import org.hibernate.annotations.UpdateTimestamp; // Use CreationTimestamp too if desired

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "api_key_settings")
@Getter
@Setter
@NoArgsConstructor
public class ApiKeySetting {

    // Using service name as the primary key is simple for settings
    @Id
    @Column(length = 50) // e.g., "GEMINI"
    private String serviceName;

    @Lob // Or @Column(length=1024) - Store the raw key
    @Column(nullable = false)
    private String keyValue;

    // Optional: Track when it was last updated
    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public ApiKeySetting(String serviceName, String keyValue) {
        this.serviceName = serviceName;
        this.keyValue = keyValue;
    }
}