package es.tfg.bancodeltiempo.user;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public User saveUser(User user)
            throws DataAccessException {

        this.userRepository.save(user);

        return user;
    }

    public Boolean existsUser(String email) {
        return this.userRepository
            .existsByEmail(email);
    }

    @Transactional(readOnly = true)
    public User findCurrentUser() {

        String email = SecurityContextHolder
            .getContext()
            .getAuthentication()
            .getName();

        return this.userRepository
            .findByEmail(email)
            .orElseThrow(() ->
                new IllegalArgumentException(
                    "Usuario no encontrado"
                )
            );
    }
}