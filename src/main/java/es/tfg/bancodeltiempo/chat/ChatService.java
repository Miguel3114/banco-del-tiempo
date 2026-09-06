package es.tfg.bancodeltiempo.chat;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.tfg.bancodeltiempo.exceptions.ConflictException;
import es.tfg.bancodeltiempo.exceptions.ResourceNotFoundException;
import es.tfg.bancodeltiempo.exceptions.ResourceNotOwnedException;
import es.tfg.bancodeltiempo.listing.Listing;
import es.tfg.bancodeltiempo.listing.ListingService;
import es.tfg.bancodeltiempo.user.User;
import es.tfg.bancodeltiempo.user.UserService;

@Service
public class ChatService {

    private final ChatRepository chatRepository;
    private final ListingService listingService;
    private final UserService userService;

    @Autowired
    public ChatService(ChatRepository chatRepository, ListingService listingService, UserService userService) {
        this.chatRepository = chatRepository;
        this.listingService = listingService;
        this.userService = userService;
    }

    @Transactional
    public Chat findOrCreateChat(Integer listingId) {
        Listing listing = this.listingService.findActiveListingById(listingId);
        User currentUser = this.userService.findCurrentUser();

        if (listing.getAuthor().getId().equals(currentUser.getId())) {
            throw new ConflictException("No puedes contactar contigo mismo");
        }

        Optional<Chat> existingChat = this.chatRepository.findChat(listingId, currentUser.getId());

        if (existingChat.isPresent()) {
            Chat chat = existingChat.get();

            if (chat.getInterestedUserStatus() == ChatStatus.ARCHIVED) {
                throw new ConflictException("Este chat está archivado");
            }

            return chat;
        }

        Chat chat = new Chat();
        chat.setListing(listing);
        chat.setInterestedUser(currentUser);
        chat.setAuthorStatus(ChatStatus.ACTIVE);
        chat.setInterestedUserStatus(ChatStatus.ACTIVE);

        return this.chatRepository.save(chat);
    }

    @Transactional(readOnly = true)
    public Chat findChat(Integer id) {
        Chat chat = this.chatRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Chat",
                        "id",
                        id));

        User currentUser = this.userService.findCurrentUser();

        this.checkParticipant(chat, currentUser);
        this.checkChatIsActive(chat, currentUser);

        return chat;
    }

    @Transactional(readOnly = true)
    public List<Chat> findMyChats() {
        User currentUser = this.userService.findCurrentUser();

        return this.chatRepository.findByUser(
                currentUser.getId(),
                ChatStatus.ACTIVE);
    }

    public void checkParticipant(Chat chat, User user) {
        boolean isAuthor = chat.getListing().getAuthor().getId().equals(user.getId());
        boolean isInterestedUser = chat.getInterestedUser().getId().equals(user.getId());

        if (!isAuthor && !isInterestedUser) {
            throw new ResourceNotOwnedException("No puedes acceder a este chat");
        }
    }

    public void checkChatIsActive(Chat chat, User user) {
        if (chat.getListing().getAuthor().getId().equals(user.getId())) {

            if (chat.getAuthorStatus() == ChatStatus.ARCHIVED) {
                throw new ConflictException("Este chat está archivado");
            }

        } else {

            if (chat.getInterestedUserStatus() == ChatStatus.ARCHIVED) {
                throw new ConflictException("Este chat está archivado");
            }
        }
    }
}