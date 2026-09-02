package es.tfg.bancodeltiempo.message;

import java.time.LocalDateTime;

import es.tfg.bancodeltiempo.user.User;
import lombok.Getter;

@Getter
public class MessageDTO {

    private Integer id;
    private String content;
    private LocalDateTime sentAt;
    private ReadStatus readStatus;
    private Boolean mine;
    private Boolean system;

    public MessageDTO(Message message, User currentUser) {
        this.id = message.getId();
        this.content = message.getContent();
        this.sentAt = message.getSentAt();
        this.readStatus = message.getReadStatus();
        this.system = message.getSender() == null;
        this.mine = message.getSender() != null
                && message.getSender().getId().equals(currentUser.getId());
    }
}