package es.tfg.bancodeltiempo.configuration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.util.ReflectionTestUtils;

import es.tfg.bancodeltiempo.configuration.services.UserDetailsImpl;
import es.tfg.bancodeltiempo.user.AccountStatus;
import es.tfg.bancodeltiempo.configuration.jwt.JwtUtils;

class JwtUtilsTest {

    private static final String SECRET =
            "ObIb5w6mUQktxizJK2nikKXwD067EcGtyFL6zLDnRms=";

    private JwtUtils jwtUtils;
    private Authentication authentication;

    @BeforeEach
    void setUp() {
        jwtUtils = createJwtUtils(
                SECRET,
                86400000);

        UserDetailsImpl userDetails =
                new UserDetailsImpl(
                        1,
                        "miguel@example.com",
                        "encodedPassword",
                        AccountStatus.ACTIVE,
                        List.of(
                                new SimpleGrantedAuthority(
                                        "MEMBER")));

        authentication =
                new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities());
    }

    @Test
    void shouldGenerateAndValidateJwt() {
        String token =
                jwtUtils.generateJwtToken(
                        authentication);

        assertTrue(
                jwtUtils.validateJwtToken(token));
    }

    @Test
    void shouldGetUsernameFromJwt() {
        String token =
                jwtUtils.generateJwtToken(
                        authentication);

        assertEquals(
                "miguel@example.com",
                jwtUtils.getUserNameFromJwtToken(
                        token));
    }

    @Test
    void shouldRejectJwtWithInvalidSignature() {
        String token =
                jwtUtils.generateJwtToken(
                        authentication);

        JwtUtils otherJwtUtils =
                createJwtUtils(
                        "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
                        86400000);

        assertFalse(
                otherJwtUtils.validateJwtToken(
                        token));
    }

    @Test
    void shouldRejectMalformedJwt() {
        assertFalse(
                jwtUtils.validateJwtToken(
                        "not-a-jwt"));
    }

    @Test
    void shouldRejectExpiredJwt() {
        JwtUtils expiredJwtUtils =
                createJwtUtils(
                        SECRET,
                        -1000);

        String token =
                expiredJwtUtils.generateJwtToken(
                        authentication);

        assertFalse(
                expiredJwtUtils.validateJwtToken(
                        token));
    }

    @Test
    void shouldRejectEmptyJwt() {
        assertFalse(
                jwtUtils.validateJwtToken(""));
    }

    private JwtUtils createJwtUtils(
            String secret,
            int expirationMs) {

        JwtUtils result = new JwtUtils();

        ReflectionTestUtils.setField(
                result,
                "jwtSecret",
                secret);

        ReflectionTestUtils.setField(
                result,
                "jwtExpirationMs",
                expirationMs);

        return result;
    }
}
