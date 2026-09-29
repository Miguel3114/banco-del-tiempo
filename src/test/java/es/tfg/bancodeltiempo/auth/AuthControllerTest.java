package es.tfg.bancodeltiempo.auth;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

import es.tfg.bancodeltiempo.auth.payload.request.UserRegisterRequest;
import es.tfg.bancodeltiempo.configuration.jwt.JwtUtils;
import es.tfg.bancodeltiempo.configuration.services.UserDetailsImpl;
import es.tfg.bancodeltiempo.configuration.services.UserDetailsServiceImpl;
import es.tfg.bancodeltiempo.user.AccountStatus;

@SpringBootTest
@AutoConfigureMockMvc
@ExtendWith(SpringExtension.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthenticationManager authenticationManager;

    @MockBean
    private JwtUtils jwtUtils;

    @MockBean
    private AuthService authService;

    @MockBean
    private UserDetailsServiceImpl userDetailsService;

    @Test
    void shouldReturnBadRequestWhenRegistrationEmailIsInvalid()
            throws Exception {

        mockMvc.perform(
                post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "firstName": "Miguel",
                                    "lastName": "García",
                                    "email": "correo-invalido",
                                    "password": "password123"
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldReturnBadRequestWhenRegistrationPasswordIsTooShort()
            throws Exception {

        mockMvc.perform(
                post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "firstName": "Miguel",
                                    "lastName": "García",
                                    "email": "miguel@example.com",
                                    "password": "1234567"
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "firstName",
            "lastName",
            "email",
            "password"
    })
    void shouldReturnBadRequestWhenRequiredRegistrationFieldIsBlank(
            String field) throws Exception {

        ObjectNode request =
                objectMapper.createObjectNode();

        request.put(
                "firstName",
                "Miguel");

        request.put(
                "lastName",
                "García");

        request.put(
                "email",
                "miguel@example.com");

        request.put(
                "password",
                "password123");

        request.put(
                field,
                "");

        mockMvc.perform(
                post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                                objectMapper.writeValueAsString(
                                        request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldLoginSuccessfully()
            throws Exception {

        Authentication authentication =
                mock(Authentication.class);

        UserDetailsImpl userDetails =
                createUserDetails(AccountStatus.ACTIVE);

        when(authenticationManager.authenticate(any()))
                .thenReturn(authentication);

        when(authentication.getPrincipal())
                .thenReturn(userDetails);

        when(jwtUtils.generateJwtToken(authentication))
                .thenReturn("jwt-token");

        mockMvc.perform(
                post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "email": "MIGUEL@EXAMPLE.COM",
                                    "password": "password123"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token")
                        .value("jwt-token"))
                .andExpect(jsonPath("$.type")
                        .value("Bearer"))
                .andExpect(jsonPath("$.id")
                        .value(1))
                .andExpect(jsonPath("$.email")
                        .value("miguel@example.com"))
                .andExpect(jsonPath("$.roles[0]")
                        .value("MEMBER"));
    }

    @Test
    void shouldReturnBadRequestWhenLoginCredentialsAreInvalid()
            throws Exception {

        when(authenticationManager.authenticate(any()))
                .thenThrow(
                        new BadCredentialsException(
                                "Credenciales incorrectas"));

        mockMvc.perform(
                post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "email": "miguel@example.com",
                                    "password": "password123"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message")
                        .value("Error: Credenciales incorrectas"));
    }

    @Test
    void shouldReturnBadRequestWhenLoginAccountIsBlocked()
            throws Exception {

        when(authenticationManager.authenticate(any()))
                .thenThrow(
                        new LockedException(
                                "Cuenta bloqueada"));

        mockMvc.perform(
                post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "email": "miguel@example.com",
                                    "password": "password123"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message")
                        .value("Error: La cuenta está bloqueada"));
    }

    @Test
    void shouldValidateActiveToken()
            throws Exception {

        UserDetailsImpl userDetails =
                createUserDetails(AccountStatus.ACTIVE);

        when(jwtUtils.validateJwtToken("valid-token"))
                .thenReturn(true);

        when(jwtUtils.getUserNameFromJwtToken(
                "valid-token"))
                .thenReturn("miguel@example.com");

        when(userDetailsService.loadUserByUsername(
                "miguel@example.com"))
                .thenReturn(userDetails);

        mockMvc.perform(
                get("/api/auth/validate")
                        .param("token", "valid-token"))
                .andExpect(status().isOk())
                .andExpect(content().string("true"));
    }

    @Test
    void shouldRejectInvalidToken()
            throws Exception {

        when(jwtUtils.validateJwtToken("invalid-token"))
                .thenReturn(false);

        mockMvc.perform(
                get("/api/auth/validate")
                        .param("token", "invalid-token"))
                .andExpect(status().isOk())
                .andExpect(content().string("false"));
    }

    @Test
    void shouldRejectTokenWhenAccountIsBlocked()
            throws Exception {

        UserDetailsImpl userDetails =
                createUserDetails(AccountStatus.BLOCKED);

        when(jwtUtils.validateJwtToken("valid-token"))
                .thenReturn(true);

        when(jwtUtils.getUserNameFromJwtToken(
                "valid-token"))
                .thenReturn("miguel@example.com");

        when(userDetailsService.loadUserByUsername(
                "miguel@example.com"))
                .thenReturn(userDetails);

        mockMvc.perform(
                get("/api/auth/validate")
                        .param("token", "valid-token"))
                .andExpect(status().isOk())
                .andExpect(content().string("false"));
    }

    @Test
    void shouldRejectTokenWhenUserCannotBeLoaded()
            throws Exception {

        when(jwtUtils.validateJwtToken("valid-token"))
                .thenReturn(true);

        when(jwtUtils.getUserNameFromJwtToken(
                "valid-token"))
                .thenReturn("miguel@example.com");

        when(userDetailsService.loadUserByUsername(
                "miguel@example.com"))
                .thenThrow(
                        new IllegalArgumentException(
                                "Usuario no encontrado"));

        mockMvc.perform(
                get("/api/auth/validate")
                        .param("token", "valid-token"))
                .andExpect(status().isOk())
                .andExpect(content().string("false"));
    }

    @Test
    void shouldRegisterUserSuccessfully()
            throws Exception {

        Authentication authentication =
                mock(Authentication.class);

        UserDetailsImpl userDetails =
                createUserDetails(AccountStatus.ACTIVE);

        when(authenticationManager.authenticate(any()))
                .thenReturn(authentication);

        when(authentication.getPrincipal())
                .thenReturn(userDetails);

        when(jwtUtils.generateJwtToken(authentication))
                .thenReturn("jwt-token");

        mockMvc.perform(
                post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "firstName": "Miguel",
                                    "lastName": "García",
                                    "email": "miguel@example.com",
                                    "password": "password123"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token")
                        .value("jwt-token"))
                .andExpect(jsonPath("$.id")
                        .value(1));
    }

    @Test
    void shouldReturnBadRequestWhenRegistrationFails()
            throws Exception {

        doThrow(
                new IllegalArgumentException(
                        "El correo electrónico ya está registrado"))
                .when(authService)
                .createMemberUser(
                        any(UserRegisterRequest.class));

        mockMvc.perform(
                post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "firstName": "Miguel",
                                    "lastName": "García",
                                    "email": "miguel@example.com",
                                    "password": "password123"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message")
                        .value(
                                "Error: El correo electrónico ya está registrado"));
    }

    private UserDetailsImpl createUserDetails(
            AccountStatus accountStatus) {

        return new UserDetailsImpl(
                1,
                "miguel@example.com",
                "encodedPassword",
                accountStatus,
                List.of(
                        new SimpleGrantedAuthority(
                                "MEMBER")));
    }
}
