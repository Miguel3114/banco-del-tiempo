package es.tfg.bancodeltiempo.admin.user;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import es.tfg.bancodeltiempo.exceptions.ConflictException;
import es.tfg.bancodeltiempo.user.AccountStatus;
import es.tfg.bancodeltiempo.user.Role;
import es.tfg.bancodeltiempo.user.User;
import es.tfg.bancodeltiempo.user.UserRepository;
import es.tfg.bancodeltiempo.user.UserService;

@ExtendWith(MockitoExtension.class)
class AdminUserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private AdminUserService adminUserService;

    private User admin;
    private User member;

    @BeforeEach
    void setUp() {
        admin = new User();
        admin.setId(1);
        admin.setRole(Role.ADMIN);
        admin.setAccountStatus(AccountStatus.ACTIVE);

        member = new User();
        member.setId(2);
        member.setRole(Role.MEMBER);
        member.setAccountStatus(AccountStatus.ACTIVE);
    }

    @Test
    void shouldFindMembersWhenCurrentUserIsAdmin() {
        when(userService.findCurrentUser())
                .thenReturn(admin);

        when(userRepository.findUsers(Role.MEMBER))
                .thenReturn(List.of(member));

        List<User> users =
                adminUserService.findUsers();

        assertEquals(1, users.size());
        assertSame(member, users.get(0));

        verify(userRepository)
                .findUsers(Role.MEMBER);
    }

    @Test
    void shouldNotFindMembersWhenCurrentUserIsNotAdmin() {
        when(userService.findCurrentUser())
                .thenReturn(member);

        assertThrows(
                AccessDeniedException.class,
                () -> adminUserService.findUsers());

        verify(userRepository, never())
                .findUsers(Role.MEMBER);
    }

    @Test
    void shouldBlockMember() {
        AdminUserStatusRequest request =
                new AdminUserStatusRequest();

        request.setStatus(AccountStatus.BLOCKED);

        when(userService.findCurrentUser())
                .thenReturn(admin);

        when(userService.findUser(2))
                .thenReturn(member);

        when(userService.saveUser(member))
                .thenReturn(member);

        User updatedUser =
                adminUserService.updateStatus(
                        2,
                        request);

        assertEquals(
                AccountStatus.BLOCKED,
                updatedUser.getAccountStatus());

        verify(userService)
                .saveUser(member);
    }

    @Test
    void shouldUnblockMember() {
        member.setAccountStatus(
                AccountStatus.BLOCKED);

        AdminUserStatusRequest request =
                new AdminUserStatusRequest();

        request.setStatus(AccountStatus.ACTIVE);

        when(userService.findCurrentUser())
                .thenReturn(admin);

        when(userService.findUser(2))
                .thenReturn(member);

        when(userService.saveUser(member))
                .thenReturn(member);

        User updatedUser =
                adminUserService.updateStatus(
                        2,
                        request);

        assertEquals(
                AccountStatus.ACTIVE,
                updatedUser.getAccountStatus());

        verify(userService)
                .saveUser(member);
    }

    @Test
    void shouldNotChangeStatusOfAdmin() {
        AdminUserStatusRequest request =
                new AdminUserStatusRequest();

        request.setStatus(AccountStatus.BLOCKED);

        when(userService.findCurrentUser())
                .thenReturn(admin);

        when(userService.findUser(1))
                .thenReturn(admin);

        assertThrows(
                ConflictException.class,
                () -> adminUserService.updateStatus(
                        1,
                        request));

        verify(userService, never())
                .saveUser(admin);
    }

    @Test
    void shouldNotUpdateStatusWhenCurrentUserIsNotAdmin() {
        AdminUserStatusRequest request =
                new AdminUserStatusRequest();

        request.setStatus(AccountStatus.BLOCKED);

        when(userService.findCurrentUser())
                .thenReturn(member);

        assertThrows(
                AccessDeniedException.class,
                () -> adminUserService.updateStatus(
                        2,
                        request));

        verify(userService, never())
                .findUser(2);
    }
}