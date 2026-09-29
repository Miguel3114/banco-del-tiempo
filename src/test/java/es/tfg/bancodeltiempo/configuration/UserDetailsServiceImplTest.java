package es.tfg.bancodeltiempo.configuration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import es.tfg.bancodeltiempo.user.User;
import es.tfg.bancodeltiempo.user.UserRepository;
import es.tfg.bancodeltiempo.configuration.services.UserDetailsServiceImpl;

@ExtendWith(MockitoExtension.class)
class UserDetailsServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserDetailsServiceImpl userDetailsService;

    @Test
    void shouldLoadUserByUsername() {
        User user = new User();
        user.setId(1);
        user.setEmail("miguel@example.com");
        user.setPassword("encodedPassword");

        when(userRepository.findByEmail(
                "miguel@example.com"))
                .thenReturn(Optional.of(user));

        UserDetails result =
                userDetailsService.loadUserByUsername(
                        "miguel@example.com");

        assertEquals(
                "miguel@example.com",
                result.getUsername());
    }

    @Test
    void shouldThrowExceptionWhenUserDoesNotExist() {
        when(userRepository.findByEmail(
                "missing@example.com"))
                .thenReturn(Optional.empty());

        assertThrows(
                UsernameNotFoundException.class,
                () -> userDetailsService
                        .loadUserByUsername(
                                "missing@example.com"));
    }
}
