package es.tfg.bancodeltiempo.exceptions;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.context.request.WebRequest;

class ExceptionHandlerControllerTest {

    private ExceptionHandlerController handler;
    private WebRequest request;

    @BeforeEach
    void setUp() {
        handler = new ExceptionHandlerController();
        request = mock(WebRequest.class);

        when(request.getDescription(false))
                .thenReturn("uri=/test");
    }

    @Test
    void shouldHandleResourceNotFound() {
        ResponseEntity<ErrorMessage> response =
                handler.handleResourceNotFound(
                        new ResourceNotFoundException(
                                "Usuario no encontrado"),
                        request);

        assertError(
                response,
                HttpStatus.NOT_FOUND,
                "Usuario no encontrado");
    }

    @Test
    void shouldHandleResourceNotOwned() {
        ResponseEntity<ErrorMessage> response =
                handler.handleResourceNotOwned(
                        new ResourceNotOwnedException(
                                "Acceso denegado"),
                        request);

        assertError(
                response,
                HttpStatus.FORBIDDEN,
                "Acceso denegado");
    }

    @Test
    void shouldHandleConflict() {
        ResponseEntity<ErrorMessage> response =
                handler.handleConflict(
                        new ConflictException(
                                "Conflicto"),
                        request);

        assertError(
                response,
                HttpStatus.CONFLICT,
                "Conflicto");
    }

    @Test
    void shouldHandleIllegalArgument() {
        ResponseEntity<ErrorMessage> response =
                handler.handleIllegalArgument(
                        new IllegalArgumentException(
                                "Dato incorrecto"),
                        request);

        assertError(
                response,
                HttpStatus.BAD_REQUEST,
                "Dato incorrecto");
    }

    @Test
    void shouldHandleValidationError() {
        MethodArgumentNotValidException exception =
                mock(MethodArgumentNotValidException.class);

        BindingResult bindingResult =
                mock(BindingResult.class);

        when(exception.getBindingResult())
                .thenReturn(bindingResult);

        when(bindingResult.getFieldErrors())
                .thenReturn(List.of(
                        new FieldError(
                                "request",
                                "email",
                                "Correo inválido")));

        ResponseEntity<ErrorMessage> response =
                handler.handleValidation(
                        exception,
                        request);

        assertEquals(
                HttpStatus.BAD_REQUEST,
                response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(
                "{email=Correo inválido}",
                response.getBody().getMessage());
    }

    @Test
    void shouldHandleUnexpectedException() {
        ResponseEntity<ErrorMessage> response =
                handler.handleGlobalException(
                        new RuntimeException(
                                "Error inesperado"),
                        request);

        assertError(
                response,
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Error inesperado");
    }

    private void assertError(
            ResponseEntity<ErrorMessage> response,
            HttpStatus status,
            String message) {

        assertEquals(
                status,
                response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(
                status.value(),
                response.getBody().getStatusCode());
        assertEquals(
                message,
                response.getBody().getMessage());
        assertEquals(
                "uri=/test",
                response.getBody().getDescription());
    }
}
