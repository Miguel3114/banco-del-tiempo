package es.tfg.bancodeltiempo.configuration.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.tfg.bancodeltiempo.user.User;
import es.tfg.bancodeltiempo.user.UserRepository;

@Service
public class UserDetailsServiceImpl
        implements UserDetailsService {

    private UserRepository userRepository;

    @Autowired
    public UserDetailsServiceImpl(
            UserRepository userRepository) {

        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        User user = this.userRepository
            .findByEmail(email)
            .orElseThrow(() ->
                new UsernameNotFoundException(
                    "User Not Found with email: " + email
                )
            );

        return UserDetailsImpl.build(user);
    }
}