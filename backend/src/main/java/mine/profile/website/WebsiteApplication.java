package mine.profile.website;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import mine.profile.website.service.DatabaseInitializationService;

@SpringBootApplication
public class WebsiteApplication {

    private static final Logger log = LoggerFactory.getLogger(WebsiteApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(WebsiteApplication.class, args);
    }

    @Bean
    public CommandLineRunner initializeDatabase(DatabaseInitializationService initializationService) {
        return (args) -> {
            initializationService.initializeDatabaseContent();
        };
    }

}