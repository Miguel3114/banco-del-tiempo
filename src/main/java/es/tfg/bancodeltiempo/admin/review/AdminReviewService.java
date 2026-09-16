package es.tfg.bancodeltiempo.admin.review;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.tfg.bancodeltiempo.exceptions.ResourceNotFoundException;
import es.tfg.bancodeltiempo.review.Review;
import es.tfg.bancodeltiempo.review.ReviewRepository;
import es.tfg.bancodeltiempo.user.Role;
import es.tfg.bancodeltiempo.user.User;
import es.tfg.bancodeltiempo.user.UserService;

@Service
public class AdminReviewService {

    private final ReviewRepository reviewRepository;
    private final UserService userService;

    @Autowired
    public AdminReviewService(ReviewRepository reviewRepository, UserService userService) {
        this.reviewRepository = reviewRepository;
        this.userService = userService;
    }

    @Transactional(readOnly = true)
    public List<Review> findReviews() {
        this.checkAdmin();

        return this.reviewRepository.findAdminReviews();
    }

    @Transactional
    public void deleteReview(Integer id) {
        this.checkAdmin();

        Review review = this.reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Valoración", "id", id));

        User reviewedUser = review.getReviewedUser();

        this.reviewRepository.delete(review);

        this.updateAverageRating(reviewedUser);
    }

    private void updateAverageRating(User user) {
        Double average = this.reviewRepository.findAverageRating(user.getId());

        if (average == null) {
            user.setAverageRating(null);
        } else {
            user.setAverageRating(
                    BigDecimal.valueOf(average)
                            .setScale(2, RoundingMode.HALF_UP));
        }

        this.userService.saveUser(user);
    }

    private void checkAdmin() {
        User currentUser = this.userService.findCurrentUser();

        if (currentUser.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("No tienes permisos de administrador");
        }
    }
}