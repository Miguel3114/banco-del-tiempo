package es.tfg.bancodeltiempo.exchange;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.tfg.bancodeltiempo.chat.Chat;
import es.tfg.bancodeltiempo.chat.ChatService;
import es.tfg.bancodeltiempo.exceptions.ConflictException;
import es.tfg.bancodeltiempo.exceptions.ResourceNotFoundException;
import es.tfg.bancodeltiempo.exceptions.ResourceNotOwnedException;
import es.tfg.bancodeltiempo.listing.ListingType;
import es.tfg.bancodeltiempo.message.MessageService;
import es.tfg.bancodeltiempo.user.User;
import es.tfg.bancodeltiempo.user.UserService;

@Service
public class ExchangeService {

    private final ExchangeRepository exchangeRepository;
    private final ChatService chatService;
    private final UserService userService;
    private final MessageService messageService;

    @Autowired
    public ExchangeService(ExchangeRepository exchangeRepository, ChatService chatService, UserService userService,
            MessageService messageService) {
        this.exchangeRepository = exchangeRepository;
        this.chatService = chatService;
        this.userService = userService;
        this.messageService = messageService;
    }

    @Transactional(readOnly = true)
    public Exchange findExchange(Integer id) {
        return this.exchangeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Exchange",
                        "id",
                        id));
    }

    @Transactional(readOnly = true)
    public Exchange findExchangeByChat(Integer chatId) {
        Chat chat = this.chatService.findChat(chatId);

        return this.exchangeRepository.findByChat(chat.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Exchange",
                        "chatId",
                        chatId));
    }

    @Transactional(readOnly = true)
    public Exchange findExchangeByChatOrNull(Integer chatId) {
        Chat chat = this.chatService.findChat(chatId);

        return this.exchangeRepository.findByChat(chat.getId())
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<Exchange> findPendingExchanges() {
        User currentUser = this.userService.findCurrentUser();

        return this.exchangeRepository.findByUserAndStatus(
                currentUser.getId(),
                ExchangeStatus.PENDING)
                .stream()
                .filter(exchange -> this.findReceiver(exchange.getChat()).getId().equals(currentUser.getId()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Exchange> findAcceptedExchanges() {
        User currentUser = this.userService.findCurrentUser();

        return this.exchangeRepository.findByUserAndStatus(
                currentUser.getId(),
                ExchangeStatus.ACCEPTED);
    }

    @Transactional
    public Exchange createExchange(Integer chatId, ExchangeCreateRequest request) {
        Chat chat = this.chatService.findChat(chatId);
        User currentUser = this.userService.findCurrentUser();
        User provider = this.findProvider(chat);
        User receiver = this.findReceiver(chat);

        if (provider.getId().equals(receiver.getId())) {
            throw new ConflictException("No puedes registrar un intercambio contigo mismo");
        }

        if (!provider.getId().equals(currentUser.getId())) {
            throw new ResourceNotOwnedException("Solo el prestador puede registrar el intercambio");
        }

        if (this.exchangeRepository.existsByChatId(chat.getId())) {
            throw new ConflictException("Este chat ya tiene un intercambio asociado");
        }

        Exchange exchange = new Exchange();
        exchange.setChat(chat);
        exchange.setHours(request.getHours());
        exchange.setStatus(ExchangeStatus.PENDING);

        Exchange savedExchange = this.exchangeRepository.save(exchange);

        this.messageService.createSystemMessage(
                chat,
                "Se ha registrado un intercambio de " + this.formatHours(exchange.getHours())
                        + " pendiente de validación.");

        return savedExchange;
    }

    @Transactional
    public Exchange acceptExchange(Integer id) {
        Exchange exchange = this.findExchange(id);
        User currentUser = this.userService.findCurrentUser();
        User provider = this.findProvider(exchange.getChat());
        User receiver = this.findReceiver(exchange.getChat());

        this.checkParticipant(exchange.getChat(), currentUser);

        if (!receiver.getId().equals(currentUser.getId())) {
            throw new ResourceNotOwnedException("Solo el receptor puede aceptar el intercambio");
        }

        if (exchange.getStatus() != ExchangeStatus.PENDING) {
            throw new ConflictException("El intercambio ya no está pendiente");
        }

        receiver.setHourBalance(
                receiver.getHourBalance() - exchange.getHours());

        provider.setHourBalance(
                provider.getHourBalance() + exchange.getHours());

        this.userService.saveUser(receiver);
        this.userService.saveUser(provider);

        exchange.setStatus(ExchangeStatus.ACCEPTED);

        Exchange savedExchange = this.exchangeRepository.save(exchange);

        this.messageService.createSystemMessage(
                exchange.getChat(),
                "El intercambio de " + this.formatHours(exchange.getHours())
                        + " ha sido aceptado. Los saldos se han actualizado correctamente.");

        return savedExchange;
    }

    @Transactional
    public Exchange rejectExchange(Integer id, ExchangeRejectRequest request) {
        Exchange exchange = this.findExchange(id);
        User currentUser = this.userService.findCurrentUser();
        User receiver = this.findReceiver(exchange.getChat());

        this.checkParticipant(exchange.getChat(), currentUser);

        if (!receiver.getId().equals(currentUser.getId())) {
            throw new ResourceNotOwnedException("Solo el receptor puede rechazar el intercambio");
        }

        if (exchange.getStatus() != ExchangeStatus.PENDING) {
            throw new ConflictException("El intercambio ya no está pendiente");
        }

        exchange.setStatus(ExchangeStatus.REJECTED);

        Exchange savedExchange = this.exchangeRepository.save(exchange);

        this.messageService.createSystemMessage(
                exchange.getChat(),
                "El intercambio ha sido rechazado. Motivo: " + request.getReason().trim());

        return savedExchange;
    }

    @Transactional
    public Exchange resendExchange(Integer id, ExchangeCreateRequest request) {
        Exchange exchange = this.findExchange(id);
        User currentUser = this.userService.findCurrentUser();
        User provider = this.findProvider(exchange.getChat());

        this.checkParticipant(exchange.getChat(), currentUser);

        if (!provider.getId().equals(currentUser.getId())) {
            throw new ResourceNotOwnedException("Solo el prestador puede corregir el intercambio");
        }

        if (exchange.getStatus() != ExchangeStatus.REJECTED) {
            throw new ConflictException("Solo se puede corregir un intercambio rechazado");
        }

        exchange.setHours(request.getHours());
        exchange.setStatus(ExchangeStatus.PENDING);

        Exchange savedExchange = this.exchangeRepository.save(exchange);

        this.messageService.createSystemMessage(
                exchange.getChat(),
                "El intercambio se ha corregido a " + this.formatHours(exchange.getHours())
                        + " y se ha enviado de nuevo para validación.");

        return savedExchange;
    }

    public User findProvider(Chat chat) {
        if (chat.getListing().getListingType() == ListingType.OFFER) {
            return chat.getListing().getAuthor();
        }

        return chat.getInterestedUser();
    }

    public User findReceiver(Chat chat) {
        if (chat.getListing().getListingType() == ListingType.OFFER) {
            return chat.getInterestedUser();
        }

        return chat.getListing().getAuthor();
    }

    private void checkParticipant(Chat chat, User user) {
        boolean isAuthor = chat.getListing().getAuthor().getId().equals(user.getId());
        boolean isInterestedUser = chat.getInterestedUser().getId().equals(user.getId());

        if (!isAuthor && !isInterestedUser) {
            throw new ResourceNotOwnedException("No puedes acceder a este intercambio");
        }
    }

    private String formatHours(Integer hours) {
        return hours == 1
                ? "1 hora"
                : hours + " horas";
    }
}