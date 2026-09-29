package es.tfg.bancodeltiempo.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import es.tfg.bancodeltiempo.auth.payload.request.UserRegisterRequest;
import es.tfg.bancodeltiempo.skill.Skill;
import es.tfg.bancodeltiempo.skill.SkillService;
import es.tfg.bancodeltiempo.user.User;
import es.tfg.bancodeltiempo.user.UserService;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private PasswordEncoder encoder;

    @Mock
    private UserService userService;

    @Mock
    private SkillService skillService;

    @InjectMocks
    private AuthService authService;

    private UserRegisterRequest request;

    @BeforeEach
    void setUp() {
        request = new UserRegisterRequest();
        request.setFirstName("  Miguel  ");
        request.setLastName("  García  ");
        request.setEmail("  MIGUEL@EXAMPLE.COM  ");
        request.setPassword("password123");
        request.setBiography("Biografía");
    }

    @Test
    void shouldCreateMemberUserWithoutSkills() {
        when(userService.existsUser(
                "miguel@example.com"))
                .thenReturn(false);

        when(encoder.encode("password123"))
                .thenReturn("encodedPassword");

        authService.createMemberUser(request);

        ArgumentCaptor<User> captor =
                ArgumentCaptor.forClass(User.class);

        verify(userService)
                .saveUser(captor.capture());

        User savedUser = captor.getValue();

        assertEquals("Miguel", savedUser.getFirstName());
        assertEquals("García", savedUser.getLastName());
        assertEquals(
                "miguel@example.com",
                savedUser.getEmail());
        assertEquals(
                "encodedPassword",
                savedUser.getPassword());
        assertEquals(
                "Biografía",
                savedUser.getBiography());
        assertEquals(0, savedUser.getSkills().size());
    }

    @Test
    void shouldCreateMemberUserWithSkills() {
        Skill skill = new Skill();
        skill.setId(1);
        skill.setName("Java");

        request.setSkillIds(Set.of(1));

        when(userService.existsUser(
                "miguel@example.com"))
                .thenReturn(false);

        when(skillService.findSkillsByIds(
                Set.of(1)))
                .thenReturn(Set.of(skill));

        when(encoder.encode("password123"))
                .thenReturn("encodedPassword");

        authService.createMemberUser(request);

        ArgumentCaptor<User> captor =
                ArgumentCaptor.forClass(User.class);

        verify(userService)
                .saveUser(captor.capture());

        assertEquals(
                Set.of(skill),
                captor.getValue().getSkills());
    }

    @Test
    void shouldNotCreateUserWithDuplicateEmail() {
        when(userService.existsUser(
                "miguel@example.com"))
                .thenReturn(true);

        assertThrows(
                IllegalArgumentException.class,
                () -> authService
                        .createMemberUser(request));

        verify(userService, never())
                .saveUser(any(User.class));
    }

    @Test
    void shouldNotCreateUserWithUnknownSkill() {
        Skill skill = new Skill();
        skill.setId(1);

        request.setSkillIds(Set.of(1, 2));

        when(userService.existsUser(
                "miguel@example.com"))
                .thenReturn(false);

        when(skillService.findSkillsByIds(
                Set.of(1, 2)))
                .thenReturn(Set.of(skill));

        assertThrows(
                IllegalArgumentException.class,
                () -> authService
                        .createMemberUser(request));

        verify(userService, never())
                .saveUser(any(User.class));
    }
}
