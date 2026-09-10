package es.tfg.bancodeltiempo.exchange;

import java.time.LocalDateTime;

import es.tfg.bancodeltiempo.listing.ListingType;
import es.tfg.bancodeltiempo.user.User;
import lombok.Getter;

@Getter
public class ExchangeDTO {

    private Integer id;
    private Integer chatId;
    private Integer listingId;
    private String listingTitle;
    private ListingType listingType;
    private Integer hours;
    private ExchangeStatus status;
    private LocalDateTime registeredAt;

    private Integer providerId;
    private String providerFirstName;
    private String providerLastName;
    private String providerProfileImageUrl;

    private Integer receiverId;
    private String receiverFirstName;
    private String receiverLastName;
    private String receiverProfileImageUrl;

    private Boolean currentUserProvider;
    private Boolean currentUserReceiver;

    public ExchangeDTO(Exchange exchange, User currentUser, User provider, User receiver) {
        this.id = exchange.getId();
        this.chatId = exchange.getChat().getId();
        this.listingId = exchange.getChat().getListing().getId();
        this.listingTitle = exchange.getChat().getListing().getTitle();
        this.listingType = exchange.getChat().getListing().getListingType();
        this.hours = exchange.getHours();
        this.status = exchange.getStatus();
        this.registeredAt = exchange.getRegisteredAt();

        this.providerId = provider.getId();
        this.providerFirstName = provider.getFirstName();
        this.providerLastName = provider.getLastName();
        this.providerProfileImageUrl = provider.getProfileImageUrl();

        this.receiverId = receiver.getId();
        this.receiverFirstName = receiver.getFirstName();
        this.receiverLastName = receiver.getLastName();
        this.receiverProfileImageUrl = receiver.getProfileImageUrl();

        this.currentUserProvider = currentUser.getId().equals(provider.getId());
        this.currentUserReceiver = currentUser.getId().equals(receiver.getId());
    }
}