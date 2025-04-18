package mine.profile.website.repository; // Or your preferred repository package

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import mine.profile.website.models.ApiKeySetting;

@Repository
// Use String as the ID type since serviceName is the ID
public interface ApiKeySettingRepository extends JpaRepository<ApiKeySetting, String> {

}