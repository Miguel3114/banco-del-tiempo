package es.tfg.bancodeltiempo.message;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import es.tfg.bancodeltiempo.chat.Chat;
import es.tfg.bancodeltiempo.chat.ChatService;
import es.tfg.bancodeltiempo.user.User;
import es.tfg.bancodeltiempo.user.UserService;

@ExtendWith(MockitoExtension.class)
class MessageServiceTest {

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private ChatService chatService;

    @Mock
    private UserService userService;

    @InjectMocks
    private MessageService messageService;

    private Chat chat;
    private User currentUser;
    private User otherUser;

    @BeforeEach
    void setUp() {
        chat = new Chat();
        chat.setId(1);

        currentUser = new User();
        currentUser.setId(1);

        otherUser = new User();
        otherUser.setId(2);
    }

    @Test
    void shouldMarkOnlyUnreadMessagesFromOtherUsersAsRead() {
        Message otherUnread = createMessage(
                otherUser,
                ReadStatus.UNREAD);

        Message ownUnread = createMessage(
                currentUser,
                ReadStatus.UNREAD);

        Message systemMessage = createMessage(
                null,
                ReadStatus.READ);

        Message otherRead = createMessage(
                otherUser,
                ReadStatus.READ);

        when(chatService.findChat(1))
                .thenReturn(chat);

        when(userService.findCurrentUser())
                .thenReturn(currentUser);

        when(messageRepository.findByChat(1))
                .thenReturn(List.of(
                        otherUnread,
                        ownUnread,
                        systemMessage,
                        otherRead));

        List<Message> result =
                messageService.findMessages(1);

        assertEquals(4, result.size());
        assertEquals(
                ReadStatus.READ,
                otherUnread.getReadStatus());
        assertEquals(
                ReadStatus.UNREAD,
                ownUnread.getReadStatus());

        verify(messageRepository)
                .save(otherUnread);

        verify(messageRepository, never())
                .save(ownUnread);
    }

    @Test
    void shouldCreateMessage() {
        MessageCreateRequest request =
                new MessageCreateRequest();

        request.setContent("  Hola  ");

        when(chatService.findChat(1))
                .thenReturn(chat);

        when(userService.findCurrentUser())
                .thenReturn(currentUser);

        when(messageRepository.save(
                any(Message.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0));

        Message message =
                messageService.createMessage(
                        1,
                        request);

        assertSame(chat, message.getChat());
        assertSame(currentUser, message.getSender());
        assertEquals("Hola", message.getContent());
        assertEquals(
                ReadStatus.UNREAD,
                message.getReadStatus());
    }

    @Test
    void shouldCreateSystemMessage() {
        when(messageRepository.save(
                any(Message.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0));

        Message message =
                messageService.createSystemMessage(
                        chat,
                        "Intercambio aceptado");

        assertSame(chat, message.getChat());
        assertNull(message.getSender());
        assertEquals(
                "Intercambio aceptado",
                message.getContent());
        assertEquals(
                ReadStatus.READ,
                message.getReadStatus());
    }

    @Test
    void shouldFindLastMessage() {
        Message message = createMessage(
                currentUser,
                ReadStatus.READ);

        when(messageRepository.findLast(1))
                .thenReturn(Optional.of(message));

        assertSame(
                message,
                messageService.findLastMessage(1));
    }

    @Test
    void shouldReturnNullWhenThereIsNoLastMessage() {
        when(messageRepository.findLast(1))
                .thenReturn(Optional.empty());

        assertNull(
                messageService.findLastMessage(1));
    }

    @Test
    void shouldReturnTrueWhenThereAreUnreadMessages() {
        when(messageRepository.countUnread(
                1,
                1,
                ReadStatus.UNREAD))
                .thenReturn(2L);

        assertTrue(
                messageService.hasUnreadMessages(
                        1,
                        1));
    }

    @Test
    void shouldReturnFalseWhenThereAreNoUnreadMessages() {
        when(messageRepository.countUnread(
                1,
                1,
                ReadStatus.UNREAD))
                .thenReturn(0L);

        assertFalse(
                messageService.hasUnreadMessages(
                        1,
                        1));
    }

    private Message createMessage(
            User sender,
            ReadStatus status) {

        Message message = new Message();
        message.setChat(chat);
        message.setSender(sender);
        message.setContent("Mensaje");
        message.setReadStatus(status);

        return message;
    }
}
