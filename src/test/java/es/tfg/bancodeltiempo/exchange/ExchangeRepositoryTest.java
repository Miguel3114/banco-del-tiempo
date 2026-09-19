package es.tfg.bancodeltiempo.exchange;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import es.tfg.bancodeltiempo.category.Category;
import es.tfg.bancodeltiempo.category.CategoryStatus;
import es.tfg.bancodeltiempo.chat.Chat;
import es.tfg.bancodeltiempo.listing.Listing;
import es.tfg.bancodeltiempo.listing.ListingStatus;
import es.tfg.bancodeltiempo.listing.ListingType;
import es.tfg.bancodeltiempo.user.User;

@DataJpaTest
class ExchangeRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ExchangeRepository exchangeRepository;

    private User ana;
    private User bruno;
    private User carla;
    private Category category;

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

        category = new Category();
        category.setName("Informática");
        category.setStatus(
                CategoryStatus.ACTIVE);

        entityManager.persist(category);
    }

    @Test
    void shouldCalculateBalanceUsingOnlyAcceptedExchanges() {
        createExchange(
                ana,
                bruno,
                ListingType.OFFER,
                3,
                ExchangeStatus.ACCEPTED);

        createExchange(
                carla,
                ana,
                ListingType.REQUEST,
                2,
                ExchangeStatus.ACCEPTED);

        createExchange(
                carla,
                ana,
                ListingType.OFFER,
                4,
                ExchangeStatus.REJECTED);

        createExchange(
                bruno,
                ana,
                ListingType.OFFER,
                6,
                ExchangeStatus.PENDING);

        entityManager.flush();

        Long anaBalance =
                exchangeRepository.findHourBalance(
                        ana.getId(),
                        ExchangeStatus.ACCEPTED,
                        ListingType.OFFER,
                        ListingType.REQUEST);

        Long brunoBalance =
                exchangeRepository.findHourBalance(
                        bruno.getId(),
                        ExchangeStatus.ACCEPTED,
                        ListingType.OFFER,
                        ListingType.REQUEST);

        Long carlaBalance =
                exchangeRepository.findHourBalance(
                        carla.getId(),
                        ExchangeStatus.ACCEPTED,
                        ListingType.OFFER,
                        ListingType.REQUEST);

        assertEquals(
                5L,
                anaBalance);

        assertEquals(
                -3L,
                brunoBalance);

        assertEquals(
                -2L,
                carlaBalance);
    }

    @Test
    void shouldReturnZeroBalanceWhenUserHasNoAcceptedExchanges() {
        createExchange(
                ana,
                bruno,
                ListingType.OFFER,
                3,
                ExchangeStatus.PENDING);

        createExchange(
                ana,
                carla,
                ListingType.OFFER,
                2,
                ExchangeStatus.REJECTED);

        entityManager.flush();

        Long balance =
                exchangeRepository.findHourBalance(
                        ana.getId(),
                        ExchangeStatus.ACCEPTED,
                        ListingType.OFFER,
                        ListingType.REQUEST);

        assertEquals(
                0L,
                balance);
    }

    @Test
    void shouldSumOnlyHoursWithRequestedStatus() {
        createExchange(
                ana,
                bruno,
                ListingType.OFFER,
                3,
                ExchangeStatus.ACCEPTED);

        createExchange(
                carla,
                ana,
                ListingType.REQUEST,
                2,
                ExchangeStatus.ACCEPTED);

        createExchange(
                bruno,
                carla,
                ListingType.OFFER,
                4,
                ExchangeStatus.PENDING);

        entityManager.flush();

        long acceptedHours =
                exchangeRepository.sumHoursByStatus(
                        ExchangeStatus.ACCEPTED);

        long pendingHours =
                exchangeRepository.sumHoursByStatus(
                        ExchangeStatus.PENDING);

        assertEquals(
                5L,
                acceptedHours);

        assertEquals(
                4L,
                pendingHours);
    }

    private User createUser(
            String firstName,
            String email) {

        User user = new User();

        user.setFirstName(firstName);
        user.setLastName("Test");
        user.setEmail(email);
        user.setPassword("password");

        entityManager.persist(user);

        return user;
    }

    private void createExchange(
            User listingAuthor,
            User interestedUser,
            ListingType listingType,
            Integer hours,
            ExchangeStatus status) {

        Listing listing = new Listing();

        listing.setAuthor(listingAuthor);
        listing.setCategory(category);
        listing.setTitle(
                "Anuncio "
                        + listingAuthor.getFirstName()
                        + " "
                        + hours
                        + " "
                        + status);

        listing.setDescription(
                "Descripción de prueba");

        listing.setListingType(
                listingType);

        listing.setEstimatedHours(
                hours);

        listing.setListingStatus(
                ListingStatus.ACTIVE);

        entityManager.persist(listing);

        Chat chat = new Chat();

        chat.setListing(listing);
        chat.setInterestedUser(
                interestedUser);

        entityManager.persist(chat);

        Exchange exchange =
                new Exchange();

        exchange.setChat(chat);
        exchange.setHours(hours);
        exchange.setStatus(status);

        entityManager.persist(exchange);
    }
}