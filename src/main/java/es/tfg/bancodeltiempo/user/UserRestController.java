package es.tfg.bancodeltiempo.user;

import java.io.IOException;
import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import es.tfg.bancodeltiempo.exchange.ExchangeService;
import es.tfg.bancodeltiempo.review.ReviewService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
public class UserRestController {

    private final UserService userService;
    private final ExchangeService exchangeService;
    private final ReviewService reviewService;

    @Autowired
    public UserRestController(UserService userService, ExchangeService exchangeService, ReviewService reviewService) {
        this.userService = userService;
        this.exchangeService = exchangeService;
        this.reviewService = reviewService;
    }

    @GetMapping("/me")
    public ResponseEntity<CurrentUserDTO> findCurrentUser() {
        User user = this.userService.findCurrentUser();

        return ResponseEntity.ok(this.toCurrentUserDTO(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> findUser(@PathVariable Integer id) {
        try {
            User user = this.userService.findUser(id);

            return ResponseEntity.ok(this.toUserDTO(user));

        } catch (IllegalArgumentException exception) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(exception.getMessage());
        }
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateCurrentUser(@Valid @RequestBody UserUpdateRequest request) {
        try {
            User user = this.userService.updateProfile(request);

            return ResponseEntity.ok(this.toCurrentUserDTO(user));

        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(exception.getMessage());
        }
    }

    @PostMapping("/me/profile-image")
    public ResponseEntity<?> updateProfileImage(@RequestParam("file") MultipartFile file) {
        try {
            User user = this.userService.updateProfileImage(file);

            return ResponseEntity.ok(this.toCurrentUserDTO(user));

        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(exception.getMessage());

        } catch (IOException exception) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("No se ha podido guardar la imagen");
        }
    }

    @DeleteMapping("/me/profile-image")
    public ResponseEntity<?> deleteProfileImage() {
        try {
            User user = this.userService.deleteProfileImage();

            return ResponseEntity.ok(this.toCurrentUserDTO(user));

        } catch (IOException exception) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("No se ha podido eliminar la imagen");
        }
    }

    private CurrentUserDTO toCurrentUserDTO(User user) {
        Integer hourBalance = this.exchangeService.findHourBalance(user.getId());
        BigDecimal averageRating = this.reviewService.findAverageRating(user.getId());

        return new CurrentUserDTO(user, hourBalance, averageRating);
    }

    private UserDTO toUserDTO(User user) {
        Integer hourBalance = this.exchangeService.findHourBalance(user.getId());
        BigDecimal averageRating = this.reviewService.findAverageRating(user.getId());

        return new UserDTO(user, hourBalance, averageRating);
    }
}