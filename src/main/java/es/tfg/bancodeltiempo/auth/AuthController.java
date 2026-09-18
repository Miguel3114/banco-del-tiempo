package es.tfg.bancodeltiempo.auth;

import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import es.tfg.bancodeltiempo.auth.payload.request.LoginRequest;
import es.tfg.bancodeltiempo.auth.payload.request.UserRegisterRequest;
import es.tfg.bancodeltiempo.auth.payload.response.JwtResponse;
import es.tfg.bancodeltiempo.auth.payload.response.MessageResponse;
import es.tfg.bancodeltiempo.configuration.jwt.JwtUtils;
import es.tfg.bancodeltiempo.configuration.services.UserDetailsImpl;
import es.tfg.bancodeltiempo.configuration.services.UserDetailsServiceImpl;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;

    private final JwtUtils jwtUtils;

    private final AuthService authService;

    private final UserDetailsServiceImpl userDetailsService;

    @Autowired
    public AuthController(AuthenticationManager authenticationManager,
            JwtUtils jwtUtils, AuthService authService,
            UserDetailsServiceImpl userDetailsService) {

        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.authService = authService;
        this.userDetailsService = userDetailsService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(
            @Valid @RequestBody LoginRequest loginRequest) {

        try {

            String email = loginRequest.getEmail()
                    .trim()
                    .toLowerCase(Locale.ROOT);

            Authentication authentication = this.authenticationManager
                    .authenticate(
                        new UsernamePasswordAuthenticationToken(
                            email,
                            loginRequest.getPassword()
                        )
                    );

            SecurityContextHolder
                    .getContext()
                    .setAuthentication(authentication);

            String jwt = this.jwtUtils
                    .generateJwtToken(authentication);

            UserDetailsImpl userDetails =
                    (UserDetailsImpl) authentication.getPrincipal();

            List<String> roles = userDetails
                    .getAuthorities()
                    .stream()
                    .map(item -> item.getAuthority())
                    .collect(Collectors.toList());

            return ResponseEntity
                    .ok()
                    .body(
                        new JwtResponse(
                            jwt,
                            userDetails.getId(),
                            userDetails.getUsername(),
                            roles
                        )
                    );

        } catch (LockedException exception) {

            return ResponseEntity
                    .badRequest()
                    .body(
                        new MessageResponse(
                            "Error: La cuenta está bloqueada"
                        )
                    );

        } catch (BadCredentialsException exception) {

            return ResponseEntity
                    .badRequest()
                    .body(
                        new MessageResponse(
                            "Error: Credenciales incorrectas"
                        )
                    );
        }
    }

    @GetMapping("/validate")
    public ResponseEntity<Boolean> validateToken(
            @RequestParam String token) {

        if (!this.jwtUtils.validateJwtToken(token)) {
            return ResponseEntity.ok(false);
        }

        try {

            String email = this.jwtUtils
                    .getUserNameFromJwtToken(token);

            UserDetailsImpl userDetails =
                    (UserDetailsImpl) this.userDetailsService
                            .loadUserByUsername(email);

            Boolean isValid =
                    userDetails.isAccountNonLocked() &&
                    userDetails.isAccountNonExpired() &&
                    userDetails.isCredentialsNonExpired() &&
                    userDetails.isEnabled();

            return ResponseEntity.ok(isValid);

        } catch (Exception exception) {

            return ResponseEntity.ok(false);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(
            @Valid @RequestBody UserRegisterRequest registerRequest) {

        try {

            this.authService
                    .createMemberUser(registerRequest);

            String email = registerRequest.getEmail()
                    .trim()
                    .toLowerCase(Locale.ROOT);

            Authentication authentication = this.authenticationManager
                    .authenticate(
                        new UsernamePasswordAuthenticationToken(
                            email,
                            registerRequest.getPassword()
                        )
                    );

            SecurityContextHolder
                    .getContext()
                    .setAuthentication(authentication);

            String jwt = this.jwtUtils
                    .generateJwtToken(authentication);

            UserDetailsImpl userDetails =
                    (UserDetailsImpl) authentication.getPrincipal();

            List<String> roles = userDetails
                    .getAuthorities()
                    .stream()
                    .map(item -> item.getAuthority())
                    .collect(Collectors.toList());

            return ResponseEntity
                    .ok()
                    .body(
                        new JwtResponse(
                            jwt,
                            userDetails.getId(),
                            userDetails.getUsername(),
                            roles
                        )
                    );

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .badRequest()
                    .body(
                        new MessageResponse(
                            "Error: "
                            + exception.getMessage()
                        )
                    );
        }
    }
}