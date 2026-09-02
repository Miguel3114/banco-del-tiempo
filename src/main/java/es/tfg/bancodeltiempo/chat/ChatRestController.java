package es.tfg.bancodeltiempo.chat;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chats")
public class ChatRestController {

    private final ChatService chatService;

    @Autowired
    public ChatRestController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/listings/{listingId}")
    public ResponseEntity<Integer> contact(@PathVariable Integer listingId) {
        Chat chat = this.chatService.findOrCreateChat(listingId);

        return ResponseEntity.ok(chat.getId());
    }
}