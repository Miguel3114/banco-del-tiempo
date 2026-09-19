package es.tfg.bancodeltiempo.exchange;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
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

import es.tfg.bancodeltiempo.chat.Chat;
import es.tfg.bancodeltiempo.chat.ChatService;
import es.tfg.bancodeltiempo.exceptions.ConflictException;
import es.tfg.bancodeltiempo.exceptions.ResourceNotFoundException;
import es.tfg.bancodeltiempo.exceptions.ResourceNotOwnedException;
import es.tfg.bancodeltiempo.listing.Listing;
import es.tfg.bancodeltiempo.listing.ListingType;
import es.tfg.bancodeltiempo.message.MessageService;
import es.tfg.bancodeltiempo.user.User;
import es.tfg.bancodeltiempo.user.UserService;

@ExtendWith(MockitoExtension.class)
class ExchangeServiceTest {

    @Mock
    private ExchangeRepository exchangeRepository;

    @Mock
    private ChatService chatService;

    @Mock
    private UserService userService;

    @Mock
    private MessageService messageService;

    @InjectMocks
    private ExchangeService exchangeService;

    private User author;
    private User interestedUser;
    private User otherUser;
    private Listing listing;
    private Chat chat;

    @BeforeEach
    void setUp() {
        author = new User();
        author.setId(1);

        interestedUser = new User();
        interestedUser.setId(2);

        otherUser = new User();
        otherUser.setId(3);

        listing = new Listing();
        listing.setAuthor(author);

        chat = new Chat();
        chat.setId(1);
        chat.setListing(listing);
        chat.setInterestedUser(interestedUser);
    }

    @Test
    void shouldFindProviderAndReceiverInOffer() {
        listing.setListingType(ListingType.OFFER);

        User provider = exchangeService.findProvider(chat);
        User receiver = exchangeService.findReceiver(chat);

        assertSame(author, provider);
        assertSame(interestedUser, receiver);
    }

    @Test
    void shouldFindProviderAndReceiverInRequest() {
        listing.setListingType(ListingType.REQUEST);

        User provider = exchangeService.findProvider(chat);
        User receiver = exchangeService.findReceiver(chat);

        assertSame(interestedUser, provider);
        assertSame(author, receiver);
    }

    @Test
    void shouldFindExchange() {
        Exchange exchange = createExchange(ExchangeStatus.PENDING, 2);

        when(exchangeRepository.findById(1))
                .thenReturn(Optional.of(exchange));

        Exchange foundExchange = exchangeService.findExchange(1);

        assertSame(exchange, foundExchange);
    }

    @Test
    void shouldThrowExceptionWhenExchangeDoesNotExist() {
        when(exchangeRepository.findById(1))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> exchangeService.findExchange(1));
    }

    @Test
    void shouldFindPendingExchangesOnlyWhenCurrentUserIsReceiver() {
        listing.setListingType(ListingType.OFFER);

        Exchange exchangeAsReceiver =
                createExchange(ExchangeStatus.PENDING, 2);

        Listing otherListing = new Listing();
        otherListing.setListingType(ListingType.OFFER);
        otherListing.setAuthor(interestedUser);

        Chat otherChat = new Chat();
        otherChat.setId(2);
        otherChat.setListing(otherListing);
        otherChat.setInterestedUser(author);

        Exchange exchangeAsProvider = new Exchange();
        exchangeAsProvider.setId(2);
        exchangeAsProvider.setChat(otherChat);
        exchangeAsProvider.setHours(1);
        exchangeAsProvider.setStatus(ExchangeStatus.PENDING);

        when(userService.findCurrentUser())
                .thenReturn(interestedUser);

        when(exchangeRepository.findByUserAndStatus(
                2,
                ExchangeStatus.PENDING))
                .thenReturn(List.of(
                        exchangeAsReceiver,
                        exchangeAsProvider));

        List<Exchange> exchanges =
                exchangeService.findPendingExchanges();

        assertEquals(1, exchanges.size());
        assertSame(exchangeAsReceiver, exchanges.get(0));
    }

    @Test
    void shouldFindAcceptedExchanges() {
        Exchange exchange =
                createExchange(ExchangeStatus.ACCEPTED, 2);

        when(userService.findCurrentUser())
                .thenReturn(author);

        when(exchangeRepository.findByUserAndStatus(
                1,
                ExchangeStatus.ACCEPTED))
                .thenReturn(List.of(exchange));

        List<Exchange> exchanges =
                exchangeService.findAcceptedExchanges();

        assertEquals(1, exchanges.size());
        assertSame(exchange, exchanges.get(0));
    }

    @Test
    void shouldFindHourBalance() {
        when(exchangeRepository.findHourBalance(
                1,
                ExchangeStatus.ACCEPTED,
                ListingType.OFFER,
                ListingType.REQUEST))
                .thenReturn(5L);

        Integer balance =
                exchangeService.findHourBalance(1);

        assertEquals(5, balance);
    }

    @Test
    void shouldCreateExchangeWhenCurrentUserIsProvider() {
        listing.setListingType(ListingType.OFFER);

        ExchangeCreateRequest request =
                new ExchangeCreateRequest();
        request.setHours(2);

        when(chatService.findChat(1))
                .thenReturn(chat);

        when(userService.findCurrentUser())
                .thenReturn(author);

        when(exchangeRepository.existsByChatId(1))
                .thenReturn(false);

        when(exchangeRepository.save(any(Exchange.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0));

        Exchange exchange =
                exchangeService.createExchange(1, request);

        assertSame(chat, exchange.getChat());
        assertEquals(2, exchange.getHours());
        assertEquals(
                ExchangeStatus.PENDING,
                exchange.getStatus());

        verify(exchangeRepository)
                .save(exchange);

        verify(messageService)
                .createSystemMessage(
                        chat,
                        "Se ha registrado un intercambio de 2 horas pendiente de validación.");
    }

    @Test
    void shouldNotCreateExchangeWhenCurrentUserIsReceiver() {
        listing.setListingType(ListingType.OFFER);

        ExchangeCreateRequest request =
                new ExchangeCreateRequest();
        request.setHours(2);

        when(chatService.findChat(1))
                .thenReturn(chat);

        when(userService.findCurrentUser())
                .thenReturn(interestedUser);

        assertThrows(
                ResourceNotOwnedException.class,
                () -> exchangeService.createExchange(
                        1,
                        request));

        verify(exchangeRepository, never())
                .save(any(Exchange.class));
    }

    @Test
    void shouldNotCreateSecondExchangeForSameChat() {
        listing.setListingType(ListingType.OFFER);

        ExchangeCreateRequest request =
                new ExchangeCreateRequest();
        request.setHours(2);

        when(chatService.findChat(1))
                .thenReturn(chat);

        when(userService.findCurrentUser())
                .thenReturn(author);

        when(exchangeRepository.existsByChatId(1))
                .thenReturn(true);

        assertThrows(
                ConflictException.class,
                () -> exchangeService.createExchange(
                        1,
                        request));

        verify(exchangeRepository, never())
                .save(any(Exchange.class));
    }

    @Test
    void shouldNotCreateExchangeWithSameProviderAndReceiver() {
        listing.setListingType(ListingType.OFFER);

        chat.setInterestedUser(author);

        ExchangeCreateRequest request =
                new ExchangeCreateRequest();
        request.setHours(2);

        when(chatService.findChat(1))
                .thenReturn(chat);

        when(userService.findCurrentUser())
                .thenReturn(author);

        assertThrows(
                ConflictException.class,
                () -> exchangeService.createExchange(
                        1,
                        request));

        verify(exchangeRepository, never())
                .save(any(Exchange.class));
    }

    @Test
    void shouldAcceptExchangeWhenCurrentUserIsReceiver() {
        listing.setListingType(ListingType.OFFER);

        Exchange exchange =
                createExchange(
                        ExchangeStatus.PENDING,
                        2);

        when(exchangeRepository.findById(1))
                .thenReturn(Optional.of(exchange));

        when(userService.findCurrentUser())
                .thenReturn(interestedUser);

        when(exchangeRepository.save(any(Exchange.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0));

        Exchange acceptedExchange =
                exchangeService.acceptExchange(1);

        assertEquals(
                ExchangeStatus.ACCEPTED,
                acceptedExchange.getStatus());

        verify(exchangeRepository)
                .save(exchange);

        verify(messageService)
                .createSystemMessage(
                        chat,
                        "El intercambio de 2 horas ha sido aceptado correctamente.");
    }

    @Test
    void shouldNotAcceptExchangeWhenCurrentUserIsProvider() {
        listing.setListingType(ListingType.OFFER);

        Exchange exchange =
                createExchange(
                        ExchangeStatus.PENDING,
                        2);

        when(exchangeRepository.findById(1))
                .thenReturn(Optional.of(exchange));

        when(userService.findCurrentUser())
                .thenReturn(author);

        assertThrows(
                ResourceNotOwnedException.class,
                () -> exchangeService.acceptExchange(1));

        assertEquals(
                ExchangeStatus.PENDING,
                exchange.getStatus());

        verify(exchangeRepository, never())
                .save(any(Exchange.class));
    }

    @Test
    void shouldNotAcceptExchangeWhenCurrentUserIsNotParticipant() {
        listing.setListingType(ListingType.OFFER);

        Exchange exchange =
                createExchange(
                        ExchangeStatus.PENDING,
                        2);

        when(exchangeRepository.findById(1))
                .thenReturn(Optional.of(exchange));

        when(userService.findCurrentUser())
                .thenReturn(otherUser);

        assertThrows(
                ResourceNotOwnedException.class,
                () -> exchangeService.acceptExchange(1));

        verify(exchangeRepository, never())
                .save(any(Exchange.class));
    }

    @Test
    void shouldNotAcceptExchangeWhenExchangeIsNotPending() {
        listing.setListingType(ListingType.OFFER);

        Exchange exchange =
                createExchange(
                        ExchangeStatus.ACCEPTED,
                        2);

        when(exchangeRepository.findById(1))
                .thenReturn(Optional.of(exchange));

        when(userService.findCurrentUser())
                .thenReturn(interestedUser);

        assertThrows(
                ConflictException.class,
                () -> exchangeService.acceptExchange(1));

        verify(exchangeRepository, never())
                .save(any(Exchange.class));
    }

    @Test
    void shouldRejectExchangeWhenCurrentUserIsReceiver() {
        listing.setListingType(ListingType.OFFER);

        Exchange exchange =
                createExchange(
                        ExchangeStatus.PENDING,
                        2);

        ExchangeRejectRequest request =
                new ExchangeRejectRequest();

        request.setReason(
                "  Las horas son incorrectas  ");

        when(exchangeRepository.findById(1))
                .thenReturn(Optional.of(exchange));

        when(userService.findCurrentUser())
                .thenReturn(interestedUser);

        when(exchangeRepository.save(any(Exchange.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0));

        Exchange rejectedExchange =
                exchangeService.rejectExchange(
                        1,
                        request);

        assertEquals(
                ExchangeStatus.REJECTED,
                rejectedExchange.getStatus());

        verify(exchangeRepository)
                .save(exchange);

        verify(messageService)
                .createSystemMessage(
                        chat,
                        "El intercambio ha sido rechazado. Motivo: Las horas son incorrectas");
    }

    @Test
    void shouldNotRejectExchangeWhenCurrentUserIsProvider() {
        listing.setListingType(ListingType.OFFER);

        Exchange exchange =
                createExchange(
                        ExchangeStatus.PENDING,
                        2);

        ExchangeRejectRequest request =
                new ExchangeRejectRequest();

        request.setReason("Horas incorrectas");

        when(exchangeRepository.findById(1))
                .thenReturn(Optional.of(exchange));

        when(userService.findCurrentUser())
                .thenReturn(author);

        assertThrows(
                ResourceNotOwnedException.class,
                () -> exchangeService.rejectExchange(
                        1,
                        request));

        assertEquals(
                ExchangeStatus.PENDING,
                exchange.getStatus());

        verify(exchangeRepository, never())
                .save(any(Exchange.class));
    }

    @Test
    void shouldNotRejectExchangeWhenExchangeIsNotPending() {
        listing.setListingType(ListingType.OFFER);

        Exchange exchange =
                createExchange(
                        ExchangeStatus.ACCEPTED,
                        2);

        ExchangeRejectRequest request =
                new ExchangeRejectRequest();

        request.setReason("Horas incorrectas");

        when(exchangeRepository.findById(1))
                .thenReturn(Optional.of(exchange));

        when(userService.findCurrentUser())
                .thenReturn(interestedUser);

        assertThrows(
                ConflictException.class,
                () -> exchangeService.rejectExchange(
                        1,
                        request));

        verify(exchangeRepository, never())
                .save(any(Exchange.class));
    }

    @Test
    void shouldResendExchangeWhenCurrentUserIsProvider() {
        listing.setListingType(ListingType.OFFER);

        Exchange exchange =
                createExchange(
                        ExchangeStatus.REJECTED,
                        2);

        ExchangeCreateRequest request =
                new ExchangeCreateRequest();

        request.setHours(3);

        when(exchangeRepository.findById(1))
                .thenReturn(Optional.of(exchange));

        when(userService.findCurrentUser())
                .thenReturn(author);

        when(exchangeRepository.save(any(Exchange.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0));

        Exchange resentExchange =
                exchangeService.resendExchange(
                        1,
                        request);

        assertEquals(
                3,
                resentExchange.getHours());

        assertEquals(
                ExchangeStatus.PENDING,
                resentExchange.getStatus());

        verify(exchangeRepository)
                .save(exchange);

        verify(messageService)
                .createSystemMessage(
                        chat,
                        "El intercambio se ha corregido a 3 horas y se ha enviado de nuevo para validación.");
    }

    @Test
    void shouldNotResendExchangeWhenCurrentUserIsReceiver() {
        listing.setListingType(ListingType.OFFER);

        Exchange exchange =
                createExchange(
                        ExchangeStatus.REJECTED,
                        2);

        ExchangeCreateRequest request =
                new ExchangeCreateRequest();

        request.setHours(3);

        when(exchangeRepository.findById(1))
                .thenReturn(Optional.of(exchange));

        when(userService.findCurrentUser())
                .thenReturn(interestedUser);

        assertThrows(
                ResourceNotOwnedException.class,
                () -> exchangeService.resendExchange(
                        1,
                        request));

        assertEquals(
                2,
                exchange.getHours());

        assertEquals(
                ExchangeStatus.REJECTED,
                exchange.getStatus());

        verify(exchangeRepository, never())
                .save(any(Exchange.class));
    }

    @Test
    void shouldNotResendExchangeWhenExchangeIsNotRejected() {
        listing.setListingType(ListingType.OFFER);

        Exchange exchange =
                createExchange(
                        ExchangeStatus.PENDING,
                        2);

        ExchangeCreateRequest request =
                new ExchangeCreateRequest();

        request.setHours(3);

        when(exchangeRepository.findById(1))
                .thenReturn(Optional.of(exchange));

        when(userService.findCurrentUser())
                .thenReturn(author);

        assertThrows(
                ConflictException.class,
                () -> exchangeService.resendExchange(
                        1,
                        request));

        assertEquals(
                2,
                exchange.getHours());

        assertEquals(
                ExchangeStatus.PENDING,
                exchange.getStatus());

        verify(exchangeRepository, never())
                .save(any(Exchange.class));
    }

    private Exchange createExchange(
            ExchangeStatus status,
            Integer hours) {

        Exchange exchange = new Exchange();

        exchange.setId(1);
        exchange.setChat(chat);
        exchange.setHours(hours);
        exchange.setStatus(status);

        return exchange;
    }
}