package es.tfg.bancodeltiempo.review;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import es.tfg.bancodeltiempo.chat.Chat;
import es.tfg.bancodeltiempo.exceptions.ConflictException;
import es.tfg.bancodeltiempo.exceptions.ResourceNotOwnedException;
import es.tfg.bancodeltiempo.exchange.Exchange;
import es.tfg.bancodeltiempo.exchange.ExchangeService;
import es.tfg.bancodeltiempo.exchange.ExchangeStatus;
import es.tfg.bancodeltiempo.listing.Listing;
import es.tfg.bancodeltiempo.user.User;
import es.tfg.bancodeltiempo.user.UserService;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private ExchangeService exchangeService;

    @Mock
    private UserService userService;

    @InjectMocks
    private ReviewService reviewService;

    private User author;
    private User interestedUser;
    private User otherUser;
    private Listing listing;
    private Chat chat;
    private Exchange exchange;

    @BeforeEach
    void setUp() {
        author = new User();
        author.setId(1);

        interestedUser = new User();
        interestedUser.setId(2);

        otherUser = new User();
        otherUser.setId(3);

        listing = new Listing();
        listing.setId(1);
        listing.setAuthor(author);

        chat = new Chat();
        chat.setId(1);
        chat.setListing(listing);
        chat.setInterestedUser(interestedUser);

        exchange = new Exchange();
        exchange.setId(1);
        exchange.setChat(chat);
        exchange.setHours(2);
        exchange.setStatus(ExchangeStatus.ACCEPTED);
    }

    @Test
    void shouldFindReviewsByUser() {
        Review review = createReview(
                author,
                interestedUser,
                5,
                "Muy bien");

        when(userService.findUser(2))
                .thenReturn(interestedUser);

        when(reviewRepository.findByUser(2))
                .thenReturn(List.of(review));

        List<Review> reviews =
                reviewService.findReviewsByUser(2);

        assertEquals(1, reviews.size());
        assertSame(review, reviews.get(0));

        verify(userService).findUser(2);
        verify(reviewRepository).findByUser(2);
    }

    @Test
    void shouldReturnTrueWhenUserHasReviewedExchange() {
        when(reviewRepository.countReview(1, 1))
                .thenReturn(1L);

        Boolean hasReviewed =
                reviewService.hasReviewed(1, 1);

        assertTrue(hasReviewed);
    }

    @Test
    void shouldReturnFalseWhenUserHasNotReviewedExchange() {
        when(reviewRepository.countReview(1, 1))
                .thenReturn(0L);

        Boolean hasReviewed =
                reviewService.hasReviewed(1, 1);

        assertFalse(hasReviewed);
    }

    @Test
    void shouldReturnAverageRatingRoundedToTwoDecimals() {
        when(reviewRepository.findAverageRating(2))
                .thenReturn(4.6666666667);

        BigDecimal average =
                reviewService.findAverageRating(2);

        assertEquals(
                new BigDecimal("4.67"),
                average);
    }

    @Test
    void shouldReturnNullWhenUserHasNoReviews() {
        when(reviewRepository.findAverageRating(2))
                .thenReturn(null);

        BigDecimal average =
                reviewService.findAverageRating(2);

        assertNull(average);
    }

    @Test
    void shouldCreateReviewWhenListingAuthorReviewsInterestedUser() {
        ReviewCreateRequest request =
                new ReviewCreateRequest();

        request.setRating(5);
        request.setComment(
                "  Muy buen intercambio  ");

        when(exchangeService.findExchange(1))
                .thenReturn(exchange);

        when(userService.findCurrentUser())
                .thenReturn(author);

        when(reviewRepository.countReview(1, 1))
                .thenReturn(0L);

        when(reviewRepository.save(any(Review.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0));

        Review review =
                reviewService.createReview(
                        1,
                        request);

        assertSame(
                exchange,
                review.getExchange());

        assertSame(
                author,
                review.getAuthor());

        assertSame(
                interestedUser,
                review.getReviewedUser());

        assertEquals(
                5,
                review.getRating());

        assertEquals(
                "Muy buen intercambio",
                review.getComment());

        verify(reviewRepository)
                .save(review);
    }

    @Test
    void shouldCreateReviewWhenInterestedUserReviewsListingAuthor() {
        ReviewCreateRequest request =
                new ReviewCreateRequest();

        request.setRating(4);
        request.setComment("   ");

        when(exchangeService.findExchange(1))
                .thenReturn(exchange);

        when(userService.findCurrentUser())
                .thenReturn(interestedUser);

        when(reviewRepository.countReview(1, 2))
                .thenReturn(0L);

        when(reviewRepository.save(any(Review.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0));

        Review review =
                reviewService.createReview(
                        1,
                        request);

        assertSame(
                exchange,
                review.getExchange());

        assertSame(
                interestedUser,
                review.getAuthor());

        assertSame(
                author,
                review.getReviewedUser());

        assertEquals(
                4,
                review.getRating());

        assertNull(
                review.getComment());

        verify(reviewRepository)
                .save(review);
    }

    @Test
    void shouldNotCreateReviewWhenCurrentUserIsNotParticipant() {
        ReviewCreateRequest request =
                new ReviewCreateRequest();

        request.setRating(5);

        when(exchangeService.findExchange(1))
                .thenReturn(exchange);

        when(userService.findCurrentUser())
                .thenReturn(otherUser);

        assertThrows(
                ResourceNotOwnedException.class,
                () -> reviewService.createReview(
                        1,
                        request));

        verify(reviewRepository, never())
                .save(any(Review.class));
    }

    @Test
    void shouldNotCreateReviewWhenExchangeIsNotAccepted() {
        exchange.setStatus(
                ExchangeStatus.PENDING);

        ReviewCreateRequest request =
                new ReviewCreateRequest();

        request.setRating(5);

        when(exchangeService.findExchange(1))
                .thenReturn(exchange);

        when(userService.findCurrentUser())
                .thenReturn(author);

        assertThrows(
                ConflictException.class,
                () -> reviewService.createReview(
                        1,
                        request));

        verify(reviewRepository, never())
                .save(any(Review.class));
    }

    @Test
    void shouldNotCreateSecondReviewForSameExchange() {
        ReviewCreateRequest request =
                new ReviewCreateRequest();

        request.setRating(5);

        when(exchangeService.findExchange(1))
                .thenReturn(exchange);

        when(userService.findCurrentUser())
                .thenReturn(author);

        when(reviewRepository.countReview(1, 1))
                .thenReturn(1L);

        assertThrows(
                ConflictException.class,
                () -> reviewService.createReview(
                        1,
                        request));

        verify(reviewRepository, never())
                .save(any(Review.class));
    }

    @Test
    void shouldNotAllowUserToReviewThemselves() {
        chat.setInterestedUser(author);

        ReviewCreateRequest request =
                new ReviewCreateRequest();

        request.setRating(5);

        when(exchangeService.findExchange(1))
                .thenReturn(exchange);

        when(userService.findCurrentUser())
                .thenReturn(author);

        when(reviewRepository.countReview(1, 1))
                .thenReturn(0L);

        assertThrows(
                ConflictException.class,
                () -> reviewService.createReview(
                        1,
                        request));

        verify(reviewRepository, never())
                .save(any(Review.class));
    }

    private Review createReview(
            User reviewAuthor,
            User reviewedUser,
            Integer rating,
            String comment) {

        Review review = new Review();

        review.setId(1);
        review.setExchange(exchange);
        review.setAuthor(reviewAuthor);
        review.setReviewedUser(reviewedUser);
        review.setRating(rating);
        review.setComment(comment);

        return review;
    }
}