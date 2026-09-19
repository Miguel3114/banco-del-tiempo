package es.tfg.bancodeltiempo.admin.review;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import es.tfg.bancodeltiempo.exceptions.ResourceNotFoundException;
import es.tfg.bancodeltiempo.review.Review;
import es.tfg.bancodeltiempo.review.ReviewRepository;
import es.tfg.bancodeltiempo.user.Role;
import es.tfg.bancodeltiempo.user.User;
import es.tfg.bancodeltiempo.user.UserService;

@ExtendWith(MockitoExtension.class)
class AdminReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private AdminReviewService adminReviewService;

    private User admin;
    private User member;
    private Review review;

    @BeforeEach
    void setUp() {
        admin = new User();
        admin.setId(1);
        admin.setRole(Role.ADMIN);

        member = new User();
        member.setId(2);
        member.setRole(Role.MEMBER);

        review = new Review();
        review.setId(1);
        review.setRating(5);
        review.setComment("Muy buen intercambio");
    }

    @Test
    void shouldFindReviewsWhenCurrentUserIsAdmin() {
        when(userService.findCurrentUser())
                .thenReturn(admin);

        when(reviewRepository.findAdminReviews())
                .thenReturn(List.of(review));

        List<Review> reviews =
                adminReviewService.findReviews();

        assertEquals(1, reviews.size());
        assertSame(review, reviews.get(0));

        verify(reviewRepository)
                .findAdminReviews();
    }

    @Test
    void shouldNotFindReviewsWhenCurrentUserIsNotAdmin() {
        when(userService.findCurrentUser())
                .thenReturn(member);

        assertThrows(
                AccessDeniedException.class,
                () -> adminReviewService.findReviews());

        verify(reviewRepository, never())
                .findAdminReviews();
    }

    @Test
    void shouldDeleteReview() {
        when(userService.findCurrentUser())
                .thenReturn(admin);

        when(reviewRepository.findById(1))
                .thenReturn(Optional.of(review));

        adminReviewService.deleteReview(1);

        verify(reviewRepository)
                .delete(review);
    }

    @Test
    void shouldThrowExceptionWhenReviewDoesNotExist() {
        when(userService.findCurrentUser())
                .thenReturn(admin);

        when(reviewRepository.findById(1))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> adminReviewService.deleteReview(1));

        verify(reviewRepository, never())
                .delete(review);
    }

    @Test
    void shouldNotDeleteReviewWhenCurrentUserIsNotAdmin() {
        when(userService.findCurrentUser())
                .thenReturn(member);

        assertThrows(
                AccessDeniedException.class,
                () -> adminReviewService.deleteReview(1));

        verify(reviewRepository, never())
                .findById(1);

        verify(reviewRepository, never())
                .delete(review);
    }
}