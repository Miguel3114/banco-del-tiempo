package es.tfg.bancodeltiempo.exceptions;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

@RestControllerAdvice
public class ExceptionHandlerController {

    @ExceptionHandler(
            ResourceNotFoundException.class)
    public ResponseEntity<ErrorMessage>
            handleResourceNotFound(
                    ResourceNotFoundException ex,
                    WebRequest request) {

        ErrorMessage message =
                new ErrorMessage(
                        HttpStatus.NOT_FOUND.value(),
                        new Date(),
                        ex.getMessage(),
                        request.getDescription(false));

        return new ResponseEntity<>(
                message,
                HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(
            ResourceNotOwnedException.class)
    public ResponseEntity<ErrorMessage>
            handleResourceNotOwned(
                    ResourceNotOwnedException ex,
                    WebRequest request) {

        ErrorMessage message =
                new ErrorMessage(
                        HttpStatus.FORBIDDEN.value(),
                        new Date(),
                        ex.getMessage(),
                        request.getDescription(false));

        return new ResponseEntity<>(
                message,
                HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(
            ConflictException.class)
    public ResponseEntity<ErrorMessage>
            handleConflict(
                    ConflictException ex,
                    WebRequest request) {

        ErrorMessage message =
                new ErrorMessage(
                        HttpStatus.CONFLICT.value(),
                        new Date(),
                        ex.getMessage(),
                        request.getDescription(false));

        return new ResponseEntity<>(
                message,
                HttpStatus.CONFLICT);
    }

    @ExceptionHandler(
            IllegalArgumentException.class)
    public ResponseEntity<ErrorMessage>
            handleIllegalArgument(
                    IllegalArgumentException ex,
                    WebRequest request) {

        ErrorMessage message =
                new ErrorMessage(
                        HttpStatus.BAD_REQUEST.value(),
                        new Date(),
                        ex.getMessage(),
                        request.getDescription(false));

        return new ResponseEntity<>(
                message,
                HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(
            MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorMessage>
            handleValidation(
                    MethodArgumentNotValidException ex,
                    WebRequest request) {

        Map<String, Object> errors =
                new HashMap<>();

        List<FieldError> fieldErrors =
                ex.getBindingResult()
                        .getFieldErrors();

        fieldErrors.forEach(error ->
                errors.put(
                        error.getField(),
                        error.getDefaultMessage()));

        ErrorMessage message =
                new ErrorMessage(
                        HttpStatus.BAD_REQUEST.value(),
                        new Date(),
                        errors.toString(),
                        request.getDescription(false));

        return new ResponseEntity<>(
                message,
                HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorMessage>
            handleGlobalException(
                    Exception ex,
                    WebRequest request) {

        ErrorMessage message =
                new ErrorMessage(
                        HttpStatus.INTERNAL_SERVER_ERROR.value(),
                        new Date(),
                        ex.getMessage(),
                        request.getDescription(false));

        return new ResponseEntity<>(
                message,
                HttpStatus.INTERNAL_SERVER_ERROR);
    }
}