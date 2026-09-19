package es.tfg.bancodeltiempo.exchange;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
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
import es.tfg.bancodeltiempo.listing.Listing;
import es.tfg.bancodeltiempo.listing.ListingType;
import es.tfg.bancodeltiempo.review.ReviewService;
import es.tfg.bancodeltiempo.user.User;
import es.tfg.bancodeltiempo.user.UserService;

@SpringBootTest
@AutoConfigureMockMvc
@ExtendWith(SpringExtension.class)
class ExchangeRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ExchangeService exchangeService;

    @MockBean
    private UserService userService;

    @MockBean
    private ReviewService reviewService;

    @Test
    @WithMockUser(authorities = "MEMBER")
    void shouldCreateExchange() throws Exception {
        User provider = new User();
        provider.setId(1);
        provider.setFirstName("Ana");
        provider.setLastName("García");

        User receiver = new User();
        receiver.setId(2);
        receiver.setFirstName("Bruno");
        receiver.setLastName("López");

        Listing listing = new Listing();
        listing.setId(10);
        listing.setTitle("Clases de Java");
        listing.setListingType(ListingType.OFFER);
        listing.setAuthor(provider);

        Chat chat = new Chat();
        chat.setId(5);
        chat.setListing(listing);
        chat.setInterestedUser(receiver);

        Exchange exchange = new Exchange();
        exchange.setId(7);
        exchange.setChat(chat);
        exchange.setHours(2);
        exchange.setStatus(ExchangeStatus.PENDING);

        when(exchangeService.createExchange(
                eq(5),
                any(ExchangeCreateRequest.class)))
                .thenReturn(exchange);

        when(userService.findCurrentUser())
                .thenReturn(provider);

        when(exchangeService.findProvider(chat))
                .thenReturn(provider);

        when(exchangeService.findReceiver(chat))
                .thenReturn(receiver);

        when(reviewService.hasReviewed(7, 1))
                .thenReturn(false);

        mockMvc.perform(
                post("/api/exchanges/chats/5")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "hours": 2
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(7))
                .andExpect(jsonPath("$.chatId").value(5))
                .andExpect(jsonPath("$.hours").value(2))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.providerId").value(1))
                .andExpect(jsonPath("$.receiverId").value(2))
                .andExpect(jsonPath("$.currentUserProvider").value(true))
                .andExpect(jsonPath("$.currentUserReceiver").value(false));
    }

    @ParameterizedTest
    @ValueSource(ints = { 0, -1 })
    @WithMockUser(authorities = "MEMBER")
    void shouldReturnBadRequestWhenHoursAreInvalid(
            int hours) throws Exception {

        mockMvc.perform(
                post("/api/exchanges/chats/5")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "hours": %d
                                }
                                """.formatted(hours)))
                .andExpect(status().isBadRequest());

        verify(exchangeService, never())
                .createExchange(
                        eq(5),
                        any(ExchangeCreateRequest.class));
    }

    @Test
    @WithMockUser(authorities = "MEMBER")
    void shouldReturnBadRequestWhenRejectReasonIsBlank()
            throws Exception {

        mockMvc.perform(
                put("/api/exchanges/7/reject")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "reason": "   "
                                }
                                """))
                .andExpect(status().isBadRequest());

        verify(exchangeService, never())
                .rejectExchange(
                        eq(7),
                        any(ExchangeRejectRequest.class));
    }
}