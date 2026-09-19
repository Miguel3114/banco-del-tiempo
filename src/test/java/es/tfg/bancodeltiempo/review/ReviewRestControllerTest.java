package es.tfg.bancodeltiempo.review;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

import es.tfg.bancodeltiempo.chat.Chat;
import es.tfg.bancodeltiempo.exchange.Exchange;
import es.tfg.bancodeltiempo.exchange.ExchangeStatus;
import es.tfg.bancodeltiempo.listing.Listing;
import es.tfg.bancodeltiempo.listing.ListingType;
import es.tfg.bancodeltiempo.user.User;

@SpringBootTest
@AutoConfigureMockMvc
@ExtendWith(SpringExtension.class)
class ReviewRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ReviewService reviewService;

    @Test
    @WithMockUser(authorities = "MEMBER")
    void shouldCreateReview() throws Exception {
        User author = new User();
        author.setId(1);
        author.setFirstName("Ana");
        author.setLastName("García");

        User reviewedUser = new User();
        reviewedUser.setId(2);
        reviewedUser.setFirstName("Bruno");
        reviewedUser.setLastName("López");

        Listing listing = new Listing();
        listing.setId(10);
        listing.setTitle("Clases de Java");
        listing.setListingType(ListingType.OFFER);

        Chat chat = new Chat();
        chat.setId(5);
        chat.setListing(listing);
        chat.setInterestedUser(reviewedUser);

        Exchange exchange = new Exchange();
        exchange.setId(7);
        exchange.setChat(chat);
        exchange.setHours(2);
        exchange.setStatus(ExchangeStatus.ACCEPTED);

        Review review = new Review();
        review.setId(3);
        review.setExchange(exchange);
        review.setAuthor(author);
        review.setReviewedUser(reviewedUser);
        review.setRating(5);
        review.setComment("Muy buen intercambio");

        when(reviewService.createReview(
                eq(7),
                any(ReviewCreateRequest.class)))
                .thenReturn(review);

        mockMvc.perform(
                post("/api/reviews/exchanges/7")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "rating": 5,
                                    "comment": "Muy buen intercambio"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(3))
                .andExpect(jsonPath("$.exchangeId").value(7))
                .andExpect(jsonPath("$.authorId").value(1))
                .andExpect(jsonPath("$.reviewedUserId").value(2))
                .andExpect(jsonPath("$.rating").value(5))
                .andExpect(jsonPath("$.comment")
                        .value("Muy buen intercambio"));
    }

    @ParameterizedTest
    @ValueSource(ints = { 0, 6 })
    @WithMockUser(authorities = "MEMBER")
    void shouldReturnBadRequestWhenRatingIsInvalid(
            int rating) throws Exception {

        mockMvc.perform(
                post("/api/reviews/exchanges/7")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "rating": %d,
                                    "comment": "Comentario"
                                }
                                """.formatted(rating)))
                .andExpect(status().isBadRequest());

        verify(reviewService, never())
                .createReview(
                        eq(7),
                        any(ReviewCreateRequest.class));
    }
}