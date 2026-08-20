package es.tfg.bancodeltiempo.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import lombok.Getter;

@ResponseStatus(HttpStatus.NOT_FOUND)
@Getter
public class ResourceNotFoundException
        extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public ResourceNotFoundException(
            String resourceName,
            String fieldName,
            Object fieldValue) {

        super(String.format(
                "%s no encontrado con %s: '%s'",
                resourceName,
                fieldName,
                fieldValue));
    }

    public ResourceNotFoundException(
            String message) {

        super(message);
    }
}