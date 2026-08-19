package es.tfg.bancodeltiempo.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import lombok.Getter;

@ResponseStatus(HttpStatus.FORBIDDEN)
@Getter
public class ResourceNotOwnedException
        extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public ResourceNotOwnedException(
            String message) {

        super(message);
    }
}