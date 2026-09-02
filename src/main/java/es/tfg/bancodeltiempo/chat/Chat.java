package es.tfg.bancodeltiempo.chat;

import java.time.LocalDateTime;

import es.tfg.bancodeltiempo.listing.Listing;
import es.tfg.bancodeltiempo.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "chats", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"listing_id", "interested_user_id"})
})
public class Chat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "chat_id")
    private Integer id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "listing_id", nullable = false)
    private Listing listing;

    @ManyToOne(optional = false)
    @JoinColumn(name = "interested_user_id", nullable = false)
    private User interestedUser;

    @Column(name = "opened_at", nullable = false)
    private LocalDateTime openedAt = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(name = "author_status", nullable = false, length = 20)
    private ChatStatus authorStatus = ChatStatus.ACTIVE;

    @Enumerated(EnumType.STRING)
    @Column(name = "interested_user_status", nullable = false, length = 20)
    private ChatStatus interestedUserStatus = ChatStatus.ACTIVE;
}