package es.tfg.bancodeltiempo.chat;

import java.time.LocalDateTime;

import es.tfg.bancodeltiempo.listing.ListingType;
import es.tfg.bancodeltiempo.user.User;
import lombok.Getter;

@Getter
public class ChatDTO {

    private Integer id;
    private Integer listingId;
    private String listingTitle;
    private ListingType listingType;
    private Integer otherUserId;
    private String otherUserFirstName;
    private String otherUserLastName;
    private String otherUserProfileImageUrl;
    private LocalDateTime openedAt;

    public ChatDTO(Chat chat, User currentUser) {
        User otherUser = chat.getListing().getAuthor().getId().equals(currentUser.getId())
                ? chat.getInterestedUser()
                : chat.getListing().getAuthor();

        this.id = chat.getId();
        this.listingId = chat.getListing().getId();
        this.listingTitle = chat.getListing().getTitle();
        this.listingType = chat.getListing().getListingType();
        this.otherUserId = otherUser.getId();
        this.otherUserFirstName = otherUser.getFirstName();
        this.otherUserLastName = otherUser.getLastName();
        this.otherUserProfileImageUrl = otherUser.getProfileImageUrl();
        this.openedAt = chat.getOpenedAt();
    }
}