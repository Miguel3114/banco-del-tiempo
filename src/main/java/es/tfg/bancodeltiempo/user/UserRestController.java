package es.tfg.bancodeltiempo.user;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserRestController {

    private UserService userService;

    @Autowired
    public UserRestController(
            UserService userService) {

        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<User> findCurrentUser() {

        User user =
            this.userService.findCurrentUser();

        return ResponseEntity.ok(user);
    }
}