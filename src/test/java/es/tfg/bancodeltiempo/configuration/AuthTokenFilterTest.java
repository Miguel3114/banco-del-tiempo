package es.tfg.bancodeltiempo.configuration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import es.tfg.bancodeltiempo.configuration.services.UserDetailsImpl;
import es.tfg.bancodeltiempo.configuration.services.UserDetailsServiceImpl;
import es.tfg.bancodeltiempo.user.AccountStatus;
import es.tfg.bancodeltiempo.configuration.jwt.JwtUtils;
import es.tfg.bancodeltiempo.configuration.jwt.AuthTokenFilter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@ExtendWith(MockitoExtension.class)
class AuthTokenFilterTest {

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private UserDetailsServiceImpl userDetailsService;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    private AuthTokenFilter filter;

    @BeforeEach
    void setUp() {
        filter = new AuthTokenFilter();

        ReflectionTestUtils.setField(
                filter,
                "jwtUtils",
                jwtUtils);

        ReflectionTestUtils.setField(
                filter,
                "userDetailsService",
                userDetailsService);

        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void shouldAuthenticateRequestWithValidToken()
            throws Exception {

        UserDetailsImpl userDetails =
                createUserDetails(
                        AccountStatus.ACTIVE);

        when(request.getHeader("Authorization"))
                .thenReturn("Bearer valid-token");

        when(jwtUtils.validateJwtToken(
                "valid-token"))
                .thenReturn(true);

        when(jwtUtils.getUserNameFromJwtToken(
                "valid-token"))
                .thenReturn("miguel@example.com");

        when(userDetailsService.loadUserByUsername(
                "miguel@example.com"))
                .thenReturn(userDetails);

        filter.doFilter(
                request,
                response,
                filterChain);

        assertNotNull(
                SecurityContextHolder
                        .getContext()
                        .getAuthentication());

        assertEquals(
                "miguel@example.com",
                ((UserDetailsImpl) SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getPrincipal())
                        .getUsername());

        verify(filterChain)
                .doFilter(request, response);
    }

    @Test
    void shouldContinueWithoutAuthorizationHeader()
            throws Exception {

        filter.doFilter(
                request,
                response,
                filterChain);

        assertNull(
                SecurityContextHolder
                        .getContext()
                        .getAuthentication());

        verify(jwtUtils, never())
                .validateJwtToken(
                        org.mockito.ArgumentMatchers.anyString());

        verify(filterChain)
                .doFilter(request, response);
    }

    @Test
    void shouldNotAuthenticateBlockedUser()
            throws Exception {

        UserDetailsImpl userDetails =
                createUserDetails(
                        AccountStatus.BLOCKED);

        when(request.getHeader("Authorization"))
                .thenReturn("Bearer valid-token");

        when(jwtUtils.validateJwtToken(
                "valid-token"))
                .thenReturn(true);

        when(jwtUtils.getUserNameFromJwtToken(
                "valid-token"))
                .thenReturn("miguel@example.com");

        when(userDetailsService.loadUserByUsername(
                "miguel@example.com"))
                .thenReturn(userDetails);

        filter.doFilter(
                request,
                response,
                filterChain);

        assertNull(
                SecurityContextHolder
                        .getContext()
                        .getAuthentication());

        verify(filterChain)
                .doFilter(request, response);
    }

    @Test
    void shouldContinueWhenJwtProcessingFails()
            throws Exception {

        when(request.getHeader("Authorization"))
                .thenReturn("Bearer invalid-token");

        when(jwtUtils.validateJwtToken(
                "invalid-token"))
                .thenThrow(
                        new RuntimeException(
                                "Error JWT"));

        filter.doFilter(
                request,
                response,
                filterChain);

        assertNull(
                SecurityContextHolder
                        .getContext()
                        .getAuthentication());

        verify(filterChain)
                .doFilter(request, response);
    }

    private UserDetailsImpl createUserDetails(
            AccountStatus status) {

        return new UserDetailsImpl(
                1,
                "miguel@example.com",
                "encodedPassword",
                status,
                List.of(
                        new SimpleGrantedAuthority(
                                "MEMBER")));
    }
}
