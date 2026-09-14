package es.tfg.bancodeltiempo.chat;

import java.util.Comparator;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import es.tfg.bancodeltiempo.message.Message;
import es.tfg.bancodeltiempo.message.MessageCreateRequest;
import es.tfg.bancodeltiempo.message.MessageDTO;
import es.tfg.bancodeltiempo.message.MessageService;
import es.tfg.bancodeltiempo.user.User;
import es.tfg.bancodeltiempo.user.UserService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/chats")
public class ChatRestController {

    private final ChatService chatService;
    private final MessageService messageService;
    private final UserService userService;

    @Autowired
    public ChatRestController(ChatService chatService, MessageService messageService, UserService userService) {
        this.chatService = chatService;
        this.messageService = messageService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<ChatDTO>> findChats() {
        User currentUser = this.userService.findCurrentUser();

        List<ChatDTO> chats = this.chatService.findMyChats()
                .stream()
                .map(chat -> {
                    Message lastMessage = this.messageService.findLastMessage(chat.getId());
                    Boolean unread = this.messageService.hasUnreadMessages(
                            chat.getId(),
                            currentUser.getId());

                    return new ChatDTO(
                            chat,
                            currentUser,
                            lastMessage,
                            unread);
                })
                .sorted(Comparator.comparing(ChatDTO::getLastActivityAt).reversed())
                .toList();

        return ResponseEntity.ok(chats);
    }

    @PostMapping("/listings/{listingId}")
    public ResponseEntity<Integer> contact(@PathVariable Integer listingId) {
        Chat chat = this.chatService.findOrCreateChat(listingId);

        return ResponseEntity.ok(chat.getId());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChatDTO> findChat(@PathVariable Integer id) {
        Chat chat = this.chatService.findChat(id);
        User currentUser = this.userService.findCurrentUser();

        return ResponseEntity.ok(new ChatDTO(chat, currentUser));
    }

    @PutMapping("/{id}/archive")
    public ResponseEntity<Void> archiveChat(@PathVariable Integer id) {
        this.chatService.archiveChat(id);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/messages")
    public ResponseEntity<List<MessageDTO>> findMessages(@PathVariable Integer id) {
        User currentUser = this.userService.findCurrentUser();

        List<MessageDTO> messages = this.messageService.findMessages(id)
                .stream()
                .map(message -> new MessageDTO(message, currentUser))
                .toList();

        return ResponseEntity.ok(messages);
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<MessageDTO> createMessage(@PathVariable Integer id,
            @Valid @RequestBody MessageCreateRequest request) {

        Message message = this.messageService.createMessage(id, request);
        User currentUser = this.userService.findCurrentUser();

        return ResponseEntity.ok(new MessageDTO(message, currentUser));
    }
}