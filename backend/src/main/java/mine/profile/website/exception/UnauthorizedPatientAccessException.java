package mine.profile.website.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class UnauthorizedPatientAccessException extends RuntimeException {

    public UnauthorizedPatientAccessException(String message) {
        super(message);
    }
}