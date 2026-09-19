package es.tfg.bancodeltiempo.review;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import es.tfg.bancodeltiempo.category.Category;
import es.tfg.bancodeltiempo.category.CategoryStatus;
import es.tfg.bancodeltiempo.chat.Chat;
import es.tfg.bancodeltiempo.exchange.Exchange;
import es.tfg.bancodeltiempo.exchange.ExchangeStatus;
import es.tfg.bancodeltiempo.listing.Listing;
import es.tfg.bancodeltiempo.listing.ListingStatus;
import es.tfg.bancodeltiempo.listing.ListingType;
import es.tfg.bancodeltiempo.user.User;

@DataJpaTest
class ReviewRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ReviewRepository reviewRepository;

    private User ana;
    private User bruno;
    private User carla;
    private Exchange exchange;

    @BeforeEach
    void setUp() {
        ana = createUser(
                "Ana",
                "ana@example.com");

        bruno = createUser(
                "Bruno",
                "bruno@example.com");

        carla = createUser(
                "Carla",
                "carla@example.com");

        Category category =
                new Category();

        category.setName(
                "Informática");

        category.setStatus(
                CategoryStatus.ACTIVE);

        entityManager.persist(category);

        Listing listing =
                new Listing();

        listing.setAuthor(ana);
        listing.setCategory(category);
        listing.setTitle(
                "Clases de Java");

        listing.setDescription(
                "Descripción de prueba");

        listing.setListingType(
                ListingType.OFFER);

        listing.setEstimatedHours(2);

        listing.setListingStatus(
                ListingStatus.ACTIVE);

        entityManager.persist(listing);

        Chat chat =
                new Chat();

        chat.setListing(listing);
        chat.setInterestedUser(bruno);

        entityManager.persist(chat);

        exchange =
                new Exchange();

        exchange.setChat(chat);
        exchange.setHours(2);

        exchange.setStatus(
                ExchangeStatus.ACCEPTED);

        entityManager.persist(exchange);
    }

    @Test
    void shouldCalculateAverageRating() {
        createReview(
                exchange,
                ana,
                bruno,
                5);

        Exchange secondExchange =
                createSecondExchange();

        createReview(
                secondExchange,
                carla,
                bruno,
                4);

        entityManager.flush();

        Double average =
                reviewRepository.findAverageRating(
                        bruno.getId());

        assertEquals(
                4.5,
                average);
    }

    @Test
    void shouldReturnNullAverageWhenUserHasNoReviews() {
        Double average =
                reviewRepository.findAverageRating(
                        carla.getId());

        assertNull(average);
    }

    @Test
    void shouldCountReviewByExchangeAndAuthor() {
        createReview(
                exchange,
                ana,
                bruno,
                5);

        entityManager.flush();

        Long existingReview =
                reviewRepository.countReview(
                        exchange.getId(),
                        ana.getId());

        Long missingReview =
                reviewRepository.countReview(
                        exchange.getId(),
                        bruno.getId());

        assertEquals(
                1L,
                existingReview);

        assertEquals(
                0L,
                missingReview);
    }

    private User createUser(
            String firstName,
            String email) {

        User user =
                new User();

        user.setFirstName(firstName);
        user.setLastName("Test");
        user.setEmail(email);
        user.setPassword("password");

        entityManager.persist(user);

        return user;
    }

    private Review createReview(
            Exchange reviewExchange,
            User author,
            User reviewedUser,
            Integer rating) {

        Review review =
                new Review();

        review.setExchange(
                reviewExchange);

        review.setAuthor(author);

        review.setReviewedUser(
                reviewedUser);

        review.setRating(rating);

        review.setComment(
                "Valoración de prueba");

        entityManager.persist(review);

        return review;
    }

    private Exchange createSecondExchange() {
        Category category =
                new Category();

        category.setName("Idiomas");

        category.setStatus(
                CategoryStatus.ACTIVE);

        entityManager.persist(category);

        Listing listing =
                new Listing();

        listing.setAuthor(carla);
        listing.setCategory(category);

        listing.setTitle(
                "Clases de inglés");

        listing.setDescription(
                "Descripción de prueba");

        listing.setListingType(
                ListingType.OFFER);

        listing.setEstimatedHours(1);

        listing.setListingStatus(
                ListingStatus.ACTIVE);

        entityManager.persist(listing);

        Chat chat =
                new Chat();

        chat.setListing(listing);

        chat.setInterestedUser(
                bruno);

        entityManager.persist(chat);

        Exchange secondExchange =
                new Exchange();

        secondExchange.setChat(chat);
        secondExchange.setHours(1);

        secondExchange.setStatus(
                ExchangeStatus.ACCEPTED);

        entityManager.persist(
                secondExchange);

        return secondExchange;
    }
}