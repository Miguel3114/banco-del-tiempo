package es.tfg.bancodeltiempo.admin.user;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.tfg.bancodeltiempo.exceptions.ConflictException;
import es.tfg.bancodeltiempo.user.Role;
import es.tfg.bancodeltiempo.user.User;
import es.tfg.bancodeltiempo.user.UserRepository;
import es.tfg.bancodeltiempo.user.UserService;

@Service
public class AdminUserService {

    private final UserRepository userRepository;
    private final UserService userService;

    @Autowired
    public AdminUserService(UserRepository userRepository, UserService userService) {
        this.userRepository = userRepository;
        this.userService = userService;
    }

    @Transactional(readOnly = true)
    public List<User> findUsers() {
        this.checkAdmin();

        return this.userRepository.findUsers(Role.MEMBER);
    }

    @Transactional
    public User updateStatus(Integer id, AdminUserStatusRequest request) {
        this.checkAdmin();

        User user = this.userService.findUser(id);

        if (user.getRole() != Role.MEMBER) {
            throw new ConflictException("Solo se puede modificar el estado de los miembros");
        }

        user.setAccountStatus(request.getStatus());

        return this.userService.saveUser(user);
    }

    private void checkAdmin() {
        User currentUser = this.userService.findCurrentUser();

        if (currentUser.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("No tienes permisos de administrador");
        }
    }
}