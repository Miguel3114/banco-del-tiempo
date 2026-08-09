package es.tfg.bancodeltiempo.auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import es.tfg.bancodeltiempo.auth.payload.request.UserRegisterRequest;
import es.tfg.bancodeltiempo.auth.payload.response.MessageResponse;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<MessageResponse> registerUser(
            @Valid @RequestBody UserRegisterRequest registerRequest) {

        try {
            this.authService.createMemberUser(registerRequest);

            return ResponseEntity.ok(
                new MessageResponse(
                    "Usuario registrado correctamente"
                )
            );

        } catch (IllegalArgumentException exception) {

            return ResponseEntity.badRequest().body(
                new MessageResponse(
                    "Error: " + exception.getMessage()
                )
            );
        }
    }
}