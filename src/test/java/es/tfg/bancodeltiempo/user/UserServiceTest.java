package es.tfg.bancodeltiempo.user;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import es.tfg.bancodeltiempo.exceptions.ConflictException;
import es.tfg.bancodeltiempo.skill.Skill;
import es.tfg.bancodeltiempo.skill.SkillService;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProfileImageService profileImageService;

    @Mock
    private SkillService skillService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User user;
    private Skill javaSkill;
    private Skill englishSkill;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1);
        user.setFirstName("Miguel");
        user.setLastName("García");
        user.setEmail("miguel@example.com");
        user.setPassword("oldPassword");

        javaSkill = new Skill();
        javaSkill.setId(1);
        javaSkill.setName("Java");

        englishSkill = new Skill();
        englishSkill.setId(2);
        englishSkill.setName("Inglés");

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        "miguel@example.com",
                        null));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void shouldSaveUser() {
        when(userRepository.save(user))
                .thenReturn(user);

        User savedUser =
                userService.saveUser(user);

        assertSame(user, savedUser);

        verify(userRepository)
                .save(user);
    }

    @Test
    void shouldCheckIfUserExists() {
        when(userRepository.existsByEmail(
                "miguel@example.com"))
                .thenReturn(true);

        Boolean exists =
                userService.existsUser(
                        "miguel@example.com");

        assertTrue(exists);
    }

    @Test
    void shouldFindCurrentUser() {
        when(userRepository.findByEmail(
                "miguel@example.com"))
                .thenReturn(Optional.of(user));

        User currentUser =
                userService.findCurrentUser();

        assertSame(user, currentUser);
    }

    @Test
    void shouldThrowExceptionWhenCurrentUserDoesNotExist() {
        when(userRepository.findByEmail(
                "miguel@example.com"))
                .thenReturn(Optional.empty());

        assertThrows(
                IllegalArgumentException.class,
                () -> userService.findCurrentUser());
    }

    @Test
    void shouldFindUserById() {
        when(userRepository.findById(1))
                .thenReturn(Optional.of(user));

        User foundUser =
                userService.findUser(1);

        assertSame(user, foundUser);
    }

    @Test
    void shouldThrowExceptionWhenUserDoesNotExist() {
        when(userRepository.findById(1))
                .thenReturn(Optional.empty());

        assertThrows(
                IllegalArgumentException.class,
                () -> userService.findUser(1));
    }

    @Test
    void shouldUpdateProfile() {
        UserUpdateRequest request =
                new UserUpdateRequest();

        request.setFirstName("  Miguel  ");
        request.setLastName("  García Azuara  ");
        request.setEmail(
                "  MIGUEL.NUEVO@EXAMPLE.COM  ");
        request.setBiography(
                "  Nueva biografía  ");
        request.setSkillIds(
                Set.of(1, 2));
        request.setPassword(
                "newPassword");

        when(userRepository.findByEmail(
                "miguel@example.com"))
                .thenReturn(Optional.of(user));

        when(userRepository.existsByEmail(
                "miguel.nuevo@example.com"))
                .thenReturn(false);

        when(skillService.findSkillsByIds(
                Set.of(1, 2)))
                .thenReturn(
                        Set.of(
                                javaSkill,
                                englishSkill));

        when(passwordEncoder.encode(
                "newPassword"))
                .thenReturn(
                        "encodedPassword");

        when(userRepository.save(user))
                .thenReturn(user);

        User updatedUser =
                userService.updateProfile(request);

        assertEquals(
                "Miguel",
                updatedUser.getFirstName());

        assertEquals(
                "García Azuara",
                updatedUser.getLastName());

        assertEquals(
                "miguel.nuevo@example.com",
                updatedUser.getEmail());

        assertEquals(
                "Nueva biografía",
                updatedUser.getBiography());

        assertEquals(
                "encodedPassword",
                updatedUser.getPassword());

        assertEquals(
                2,
                updatedUser.getSkills().size());

        assertTrue(
                updatedUser.getSkills()
                        .contains(javaSkill));

        assertTrue(
                updatedUser.getSkills()
                        .contains(englishSkill));

        verify(userRepository)
                .save(user);
    }

    @Test
    void shouldKeepPasswordWhenNewPasswordIsBlank() {
        UserUpdateRequest request =
                new UserUpdateRequest();

        request.setFirstName("Miguel");
        request.setLastName("García");
        request.setEmail(
                "miguel@example.com");
        request.setBiography(null);
        request.setSkillIds(null);
        request.setPassword("   ");

        when(userRepository.findByEmail(
                "miguel@example.com"))
                .thenReturn(Optional.of(user));

        when(userRepository.save(user))
                .thenReturn(user);

        User updatedUser =
                userService.updateProfile(request);

        assertEquals(
                "oldPassword",
                updatedUser.getPassword());

        assertNull(
                updatedUser.getBiography());

        verify(passwordEncoder, never())
                .encode("   ");
    }

    @Test
    void shouldNotUpdateProfileWithDuplicateEmail() {
        UserUpdateRequest request =
                new UserUpdateRequest();

        request.setFirstName("Miguel");
        request.setLastName("García");
        request.setEmail(
                "existing@example.com");

        when(userRepository.findByEmail(
                "miguel@example.com"))
                .thenReturn(Optional.of(user));

        when(userRepository.existsByEmail(
                "existing@example.com"))
                .thenReturn(true);

        assertThrows(
                ConflictException.class,
                () -> userService.updateProfile(
                        request));

        verify(userRepository, never())
                .save(user);
    }

    @Test
    void shouldNotUpdateProfileWithUnknownSkill() {
        UserUpdateRequest request =
                new UserUpdateRequest();

        request.setFirstName("Miguel");
        request.setLastName("García");
        request.setEmail(
                "miguel@example.com");
        request.setSkillIds(
                Set.of(1, 2));

        when(userRepository.findByEmail(
                "miguel@example.com"))
                .thenReturn(Optional.of(user));

        when(skillService.findSkillsByIds(
                Set.of(1, 2)))
                .thenReturn(
                        Set.of(javaSkill));

        assertThrows(
                IllegalArgumentException.class,
                () -> userService.updateProfile(
                        request));

        verify(userRepository, never())
                .save(user);
    }

    @Test
    void shouldUpdateProfileImageAndDeleteOldImage()
            throws IOException {

        user.setProfileImageUrl(
                "/uploads/profile-images/old.jpg");

        MockMultipartFile file =
                new MockMultipartFile(
                        "file",
                        "profile.png",
                        "image/png",
                        new byte[] { 1, 2, 3 });

        when(userRepository.findByEmail(
                "miguel@example.com"))
                .thenReturn(Optional.of(user));

        when(profileImageService.saveProfileImage(
                file,
                1))
                .thenReturn(
                        "/uploads/profile-images/new.png");

        when(userRepository.save(user))
                .thenReturn(user);

        User updatedUser =
                userService.updateProfileImage(
                        file);

        assertEquals(
                "/uploads/profile-images/new.png",
                updatedUser.getProfileImageUrl());

        verify(profileImageService)
                .deleteProfileImage(
                        "/uploads/profile-images/old.jpg");
    }

    @Test
    void shouldUpdateProfileImageWithoutDeletingOldImage()
            throws IOException {

        MockMultipartFile file =
                new MockMultipartFile(
                        "file",
                        "profile.jpg",
                        "image/jpeg",
                        new byte[] { 1, 2, 3 });

        when(userRepository.findByEmail(
                "miguel@example.com"))
                .thenReturn(Optional.of(user));

        when(profileImageService.saveProfileImage(
                file,
                1))
                .thenReturn(
                        "/uploads/profile-images/new.jpg");

        when(userRepository.save(user))
                .thenReturn(user);

        User updatedUser =
                userService.updateProfileImage(
                        file);

        assertEquals(
                "/uploads/profile-images/new.jpg",
                updatedUser.getProfileImageUrl());

        verify(profileImageService, never())
                .deleteProfileImage(any());
    }

    @Test
    void shouldDeleteProfileImage()
            throws IOException {

        user.setProfileImageUrl(
                "/uploads/profile-images/profile.jpg");

        when(userRepository.findByEmail(
                "miguel@example.com"))
                .thenReturn(Optional.of(user));

        when(userRepository.save(user))
                .thenReturn(user);

        User updatedUser =
                userService.deleteProfileImage();

        assertNull(
                updatedUser.getProfileImageUrl());

        verify(profileImageService)
                .deleteProfileImage(
                        "/uploads/profile-images/profile.jpg");
    }

    @Test
    void shouldDeleteProfileImageWhenUserHasNoImage()
            throws IOException {

        when(userRepository.findByEmail(
                "miguel@example.com"))
                .thenReturn(Optional.of(user));

        when(userRepository.save(user))
                .thenReturn(user);

        User updatedUser =
                userService.deleteProfileImage();

        assertNull(
                updatedUser.getProfileImageUrl());

        verify(profileImageService, never())
                .deleteProfileImage(any());
    }
}