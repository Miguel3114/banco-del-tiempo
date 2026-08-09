package es.tfg.bancodeltiempo.configuration.services;

import java.util.Collection;
import java.util.List;
import java.util.Objects;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.fasterxml.jackson.annotation.JsonIgnore;

import es.tfg.bancodeltiempo.user.AccountStatus;
import es.tfg.bancodeltiempo.user.User;

public class UserDetailsImpl implements UserDetails {

    private static final long serialVersionUID = 1L;

    private Integer id;

    private String email;

    @JsonIgnore
    private String password;

    private AccountStatus accountStatus;

    private Collection<? extends GrantedAuthority> authorities;

    public UserDetailsImpl(
            Integer id,
            String email,
            String password,
            AccountStatus accountStatus,
            Collection<? extends GrantedAuthority> authorities) {

        this.id = id;
        this.email = email;
        this.password = password;
        this.accountStatus = accountStatus;
        this.authorities = authorities;
    }

    public static UserDetailsImpl build(User user) {

        List<GrantedAuthority> authorities = List.of(
            new SimpleGrantedAuthority(
                user.getRole().name()
            )
        );

        return new UserDetailsImpl(
            user.getId(),
            user.getEmail(),
            user.getPassword(),
            user.getAccountStatus(),
            authorities
        );
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return this.authorities;
    }

    public Integer getId() {
        return this.id;
    }

    @Override
    public String getPassword() {
        return this.password;
    }

    @Override
    public String getUsername() {
        return this.email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return this.accountStatus != AccountStatus.BLOCKED;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    @Override
    public boolean equals(Object obj) {

        if (this == obj) {
            return true;
        }

        if (obj == null) {
            return false;
        }

        if (getClass() != obj.getClass()) {
            return false;
        }

        UserDetailsImpl other = (UserDetailsImpl) obj;

        return Objects.equals(this.id, other.id);
    }
}