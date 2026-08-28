package es.tfg.bancodeltiempo.user;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
public class UserRestController {

        private final UserService userService;

        @Autowired
        public UserRestController(UserService userService) {

                this.userService = userService;
        }

        @GetMapping("/me")
        public ResponseEntity<User> findCurrentUser() {

                return ResponseEntity.ok(
                                this.userService.findCurrentUser());
        }

        @PutMapping("/me")
        public ResponseEntity<?> updateCurrentUser(@Valid @RequestBody UserUpdateRequest request) {

                try {

                        return ResponseEntity.ok(
                                        this.userService.updateProfile(request));

                } catch (IllegalArgumentException exception) {

                        return ResponseEntity.badRequest()
                                        .body(exception.getMessage());
                }
        }

        @PostMapping("/me/profile-image")
        public ResponseEntity<?> updateProfileImage(@RequestParam("file") MultipartFile file) {

                try {

                        return ResponseEntity.ok(
                                        this.userService.updateProfileImage(file));

                } catch (IllegalArgumentException exception) {

                        return ResponseEntity.badRequest()
                                        .body(exception.getMessage());

                } catch (IOException exception) {

                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body("No se ha podido guardar la imagen");
                }
        }

        @DeleteMapping("/me/profile-image")
        public ResponseEntity<?> deleteProfileImage() {

                try {

                        return ResponseEntity.ok(
                                        this.userService.deleteProfileImage());

                } catch (IOException exception) {

                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body("No se ha podido eliminar la imagen");
                }
        }
}