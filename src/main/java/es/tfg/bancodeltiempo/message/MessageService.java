package es.tfg.bancodeltiempo.message;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.tfg.bancodeltiempo.chat.Chat;
import es.tfg.bancodeltiempo.chat.ChatService;
import es.tfg.bancodeltiempo.user.User;
import es.tfg.bancodeltiempo.user.UserService;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final ChatService chatService;
    private final UserService userService;

    @Autowired
    public MessageService(MessageRepository messageRepository, ChatService chatService, UserService userService) {
        this.messageRepository = messageRepository;
        this.chatService = chatService;
        this.userService = userService;
    }

    @Transactional
    public List<Message> findMessages(Integer chatId) {
        Chat chat = this.chatService.findChat(chatId);
        User currentUser = this.userService.findCurrentUser();

        List<Message> messages = this.messageRepository.findByChat(chat.getId());

        for (Message message : messages) {

            if (message.getSender() != null
                    && !message.getSender().getId().equals(currentUser.getId())
                    && message.getReadStatus() == ReadStatus.UNREAD) {

                message.setReadStatus(ReadStatus.READ);
                this.messageRepository.save(message);
            }
        }

        return messages;
    }

    @Transactional
    public Message createMessage(Integer chatId, MessageCreateRequest request) {
        Chat chat = this.chatService.findChat(chatId);
        User currentUser = this.userService.findCurrentUser();

        Message message = new Message();
        message.setChat(chat);
        message.setSender(currentUser);
        message.setContent(request.getContent().trim());
        message.setReadStatus(ReadStatus.UNREAD);

        return this.messageRepository.save(message);
    }

    @Transactional(readOnly = true)
    public Message findLastMessage(Integer chatId) {
        return this.messageRepository.findLast(chatId)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public Boolean hasUnreadMessages(Integer chatId, Integer userId) {
        return this.messageRepository.countUnread(
                chatId,
                userId,
                ReadStatus.UNREAD) > 0;
    }
}