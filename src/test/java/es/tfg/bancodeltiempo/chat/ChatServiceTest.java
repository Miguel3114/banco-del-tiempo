package es.tfg.bancodeltiempo.chat;

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

import es.tfg.bancodeltiempo.exceptions.ConflictException;
import es.tfg.bancodeltiempo.exceptions.ResourceNotFoundException;
import es.tfg.bancodeltiempo.exceptions.ResourceNotOwnedException;
import es.tfg.bancodeltiempo.exchange.Exchange;
import es.tfg.bancodeltiempo.exchange.ExchangeRepository;
import es.tfg.bancodeltiempo.exchange.ExchangeStatus;
import es.tfg.bancodeltiempo.listing.Listing;
import es.tfg.bancodeltiempo.listing.ListingService;
import es.tfg.bancodeltiempo.listing.ListingType;
import es.tfg.bancodeltiempo.user.User;
import es.tfg.bancodeltiempo.user.UserService;

@ExtendWith(MockitoExtension.class)
class ChatServiceTest {

    @Mock
    private ChatRepository chatRepository;

    @Mock
    private ListingService listingService;

    @Mock
    private UserService userService;

    @Mock
    private ExchangeRepository exchangeRepository;

    @InjectMocks
    private ChatService chatService;

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
        listing.setId(1);
        listing.setAuthor(author);
        listing.setListingType(ListingType.OFFER);

        chat = new Chat();
        chat.setId(1);
        chat.setListing(listing);
        chat.setInterestedUser(interestedUser);
        chat.setAuthorStatus(ChatStatus.ACTIVE);
        chat.setInterestedUserStatus(ChatStatus.ACTIVE);
    }

    @Test
    void shouldCreateChatWhenChatDoesNotExist() {
        when(listingService.findActiveListingById(1))
                .thenReturn(listing);

        when(userService.findCurrentUser())
                .thenReturn(interestedUser);

        when(chatRepository.findChat(1, 2))
                .thenReturn(Optional.empty());

        when(chatRepository.save(any(Chat.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Chat createdChat = chatService.findOrCreateChat(1);

        assertSame(listing, createdChat.getListing());
        assertSame(interestedUser, createdChat.getInterestedUser());

        assertEquals(
                ChatStatus.ACTIVE,
                createdChat.getAuthorStatus());

        assertEquals(
                ChatStatus.ACTIVE,
                createdChat.getInterestedUserStatus());

        verify(chatRepository)
                .save(createdChat);
    }

    @Test
    void shouldReturnExistingChat() {
        when(listingService.findActiveListingById(1))
                .thenReturn(listing);

        when(userService.findCurrentUser())
                .thenReturn(interestedUser);

        when(chatRepository.findChat(1, 2))
                .thenReturn(Optional.of(chat));

        Chat foundChat =
                chatService.findOrCreateChat(1);

        assertSame(chat, foundChat);

        verify(chatRepository, never())
                .save(any(Chat.class));
    }

    @Test
    void shouldNotCreateChatWithOwnListing() {
        when(listingService.findActiveListingById(1))
                .thenReturn(listing);

        when(userService.findCurrentUser())
                .thenReturn(author);

        assertThrows(
                ConflictException.class,
                () -> chatService.findOrCreateChat(1));

        verify(chatRepository, never())
                .save(any(Chat.class));
    }

    @Test
    void shouldNotReturnArchivedExistingChat() {
        chat.setInterestedUserStatus(
                ChatStatus.ARCHIVED);

        when(listingService.findActiveListingById(1))
                .thenReturn(listing);

        when(userService.findCurrentUser())
                .thenReturn(interestedUser);

        when(chatRepository.findChat(1, 2))
                .thenReturn(Optional.of(chat));

        assertThrows(
                ConflictException.class,
                () -> chatService.findOrCreateChat(1));

        verify(chatRepository, never())
                .save(any(Chat.class));
    }

    @Test
    void shouldFindChatWhenCurrentUserIsAuthor() {
        when(chatRepository.findById(1))
                .thenReturn(Optional.of(chat));

        when(userService.findCurrentUser())
                .thenReturn(author);

        Chat foundChat =
                chatService.findChat(1);

        assertSame(chat, foundChat);
    }

    @Test
    void shouldFindChatWhenCurrentUserIsInterestedUser() {
        when(chatRepository.findById(1))
                .thenReturn(Optional.of(chat));

        when(userService.findCurrentUser())
                .thenReturn(interestedUser);

        Chat foundChat =
                chatService.findChat(1);

        assertSame(chat, foundChat);
    }

    @Test
    void shouldThrowExceptionWhenChatDoesNotExist() {
        when(chatRepository.findById(1))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> chatService.findChat(1));
    }

    @Test
    void shouldNotFindChatWhenCurrentUserIsNotParticipant() {
        when(chatRepository.findById(1))
                .thenReturn(Optional.of(chat));

        when(userService.findCurrentUser())
                .thenReturn(otherUser);

        assertThrows(
                ResourceNotOwnedException.class,
                () -> chatService.findChat(1));
    }

    @Test
    void shouldNotFindChatWhenAuthorHasArchivedIt() {
        chat.setAuthorStatus(
                ChatStatus.ARCHIVED);

        when(chatRepository.findById(1))
                .thenReturn(Optional.of(chat));

        when(userService.findCurrentUser())
                .thenReturn(author);

        assertThrows(
                ConflictException.class,
                () -> chatService.findChat(1));
    }

    @Test
    void shouldNotFindChatWhenInterestedUserHasArchivedIt() {
        chat.setInterestedUserStatus(
                ChatStatus.ARCHIVED);

        when(chatRepository.findById(1))
                .thenReturn(Optional.of(chat));

        when(userService.findCurrentUser())
                .thenReturn(interestedUser);

        assertThrows(
                ConflictException.class,
                () -> chatService.findChat(1));
    }

    @Test
    void shouldFindMyChats() {
        when(userService.findCurrentUser())
                .thenReturn(author);

        when(chatRepository.findByUser(
                1,
                ChatStatus.ACTIVE))
                .thenReturn(List.of(chat));

        List<Chat> chats =
                chatService.findMyChats();

        assertEquals(1, chats.size());
        assertSame(chat, chats.get(0));

        verify(chatRepository)
                .findByUser(
                        1,
                        ChatStatus.ACTIVE);
    }

    @Test
    void shouldArchiveChatForAuthorWhenExchangeIsAccepted() {
        Exchange exchange =
                createExchange(ExchangeStatus.ACCEPTED);

        when(chatRepository.findById(1))
                .thenReturn(Optional.of(chat));

        when(userService.findCurrentUser())
                .thenReturn(author);

        when(exchangeRepository.findByChat(1))
                .thenReturn(Optional.of(exchange));

        chatService.archiveChat(1);

        assertEquals(
                ChatStatus.ARCHIVED,
                chat.getAuthorStatus());

        assertEquals(
                ChatStatus.ACTIVE,
                chat.getInterestedUserStatus());

        verify(chatRepository)
                .save(chat);
    }

    @Test
    void shouldArchiveChatForInterestedUserWhenExchangeIsAccepted() {
        Exchange exchange =
                createExchange(ExchangeStatus.ACCEPTED);

        when(chatRepository.findById(1))
                .thenReturn(Optional.of(chat));

        when(userService.findCurrentUser())
                .thenReturn(interestedUser);

        when(exchangeRepository.findByChat(1))
                .thenReturn(Optional.of(exchange));

        chatService.archiveChat(1);

        assertEquals(
                ChatStatus.ACTIVE,
                chat.getAuthorStatus());

        assertEquals(
                ChatStatus.ARCHIVED,
                chat.getInterestedUserStatus());

        verify(chatRepository)
                .save(chat);
    }

    @Test
    void shouldNotArchiveChatWithoutExchange() {
        when(chatRepository.findById(1))
                .thenReturn(Optional.of(chat));

        when(userService.findCurrentUser())
                .thenReturn(author);

        when(exchangeRepository.findByChat(1))
                .thenReturn(Optional.empty());

        assertThrows(
                ConflictException.class,
                () -> chatService.archiveChat(1));

        assertEquals(
                ChatStatus.ACTIVE,
                chat.getAuthorStatus());

        verify(chatRepository, never())
                .save(any(Chat.class));
    }

    @Test
    void shouldNotArchiveChatWhenExchangeIsPending() {
        Exchange exchange =
                createExchange(ExchangeStatus.PENDING);

        when(chatRepository.findById(1))
                .thenReturn(Optional.of(chat));

        when(userService.findCurrentUser())
                .thenReturn(author);

        when(exchangeRepository.findByChat(1))
                .thenReturn(Optional.of(exchange));

        assertThrows(
                ConflictException.class,
                () -> chatService.archiveChat(1));

        assertEquals(
                ChatStatus.ACTIVE,
                chat.getAuthorStatus());

        verify(chatRepository, never())
                .save(any(Chat.class));
    }

    @Test
    void shouldNotArchiveChatWhenExchangeIsRejected() {
        Exchange exchange =
                createExchange(ExchangeStatus.REJECTED);

        when(chatRepository.findById(1))
                .thenReturn(Optional.of(chat));

        when(userService.findCurrentUser())
                .thenReturn(author);

        when(exchangeRepository.findByChat(1))
                .thenReturn(Optional.of(exchange));

        assertThrows(
                ConflictException.class,
                () -> chatService.archiveChat(1));

        assertEquals(
                ChatStatus.ACTIVE,
                chat.getAuthorStatus());

        verify(chatRepository, never())
                .save(any(Chat.class));
    }

    private Exchange createExchange(
            ExchangeStatus status) {

        Exchange exchange = new Exchange();

        exchange.setId(1);
        exchange.setChat(chat);
        exchange.setHours(2);
        exchange.setStatus(status);

        return exchange;
    }
}