package es.tfg.bancodeltiempo.configuration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

import es.tfg.bancodeltiempo.user.AccountStatus;
import es.tfg.bancodeltiempo.user.Role;
import es.tfg.bancodeltiempo.user.User;
import es.tfg.bancodeltiempo.configuration.services.UserDetailsImpl;

class UserDetailsImplTest {

    @Test
    void shouldBuildUserDetailsFromUser() {
        User user = createUser(
                1,
                AccountStatus.ACTIVE);

        UserDetailsImpl details =
                UserDetailsImpl.build(user);

        assertEquals(1, details.getId());
        assertEquals(
                "miguel@example.com",
                details.getUsername());
        assertEquals(
                "encodedPassword",
                details.getPassword());
        assertEquals(
                "MEMBER",
                details.getAuthorities()
                        .iterator()
                        .next()
                        .getAuthority());
        assertTrue(details.isAccountNonLocked());
        assertTrue(details.isAccountNonExpired());
        assertTrue(details.isCredentialsNonExpired());
        assertTrue(details.isEnabled());
    }

    @Test
    void shouldConsiderBlockedUserAsLocked() {
        UserDetailsImpl details =
                UserDetailsImpl.build(
                        createUser(
                                1,
                                AccountStatus.BLOCKED));

        assertFalse(details.isAccountNonLocked());
    }

    @Test
    void shouldCompareUserDetailsById() {
        UserDetailsImpl first =
                UserDetailsImpl.build(
                        createUser(
                                1,
                                AccountStatus.ACTIVE));

        UserDetailsImpl sameId =
                UserDetailsImpl.build(
                        createUser(
                                1,
                                AccountStatus.ACTIVE));

        UserDetailsImpl differentId =
                UserDetailsImpl.build(
                        createUser(
                                2,
                                AccountStatus.ACTIVE));

        assertEquals(first, first);
        assertEquals(first, sameId);
        assertEquals(
                first.hashCode(),
                sameId.hashCode());
        assertNotEquals(first, differentId);
        assertNotEquals(first, null);
        assertNotEquals(first, "usuario");
    }

    private User createUser(
            Integer id,
            AccountStatus status) {

        User user = new User();
        user.setId(id);
        user.setEmail("miguel@example.com");
        user.setPassword("encodedPassword");
        user.setRole(Role.MEMBER);
        user.setAccountStatus(status);

        return user;
    }
}
