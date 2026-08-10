package es.tfg.bancodeltiempo.user;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.io.IOException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

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

    @PostMapping("/me/profile-image")
    public ResponseEntity<?> updateProfileImage(
            @RequestParam("file") MultipartFile file) {

        try {

            User user = this.userService
                    .updateProfileImage(file);

            return ResponseEntity.ok(user);

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            exception.getMessage());

        } catch (IOException exception) {

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            "No se ha podido guardar la imagen");
        }
    }
}