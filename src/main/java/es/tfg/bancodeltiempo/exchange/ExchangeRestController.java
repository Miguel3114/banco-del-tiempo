package es.tfg.bancodeltiempo.exchange;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import es.tfg.bancodeltiempo.user.User;
import es.tfg.bancodeltiempo.user.UserService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/exchanges")
public class ExchangeRestController {

    private final ExchangeService exchangeService;
    private final UserService userService;

    @Autowired
    public ExchangeRestController(ExchangeService exchangeService, UserService userService) {
        this.exchangeService = exchangeService;
        this.userService = userService;
    }

    @GetMapping("/pending")
    public ResponseEntity<List<ExchangeDTO>> findPendingExchanges() {
        User currentUser = this.userService.findCurrentUser();

        List<ExchangeDTO> exchanges = this.exchangeService.findPendingExchanges()
                .stream()
                .map(exchange -> this.toDTO(exchange, currentUser))
                .toList();

        return ResponseEntity.ok(exchanges);
    }

    @GetMapping("/history")
    public ResponseEntity<List<ExchangeDTO>> findAcceptedExchanges() {
        User currentUser = this.userService.findCurrentUser();

        List<ExchangeDTO> exchanges = this.exchangeService.findAcceptedExchanges()
                .stream()
                .map(exchange -> this.toDTO(exchange, currentUser))
                .toList();

        return ResponseEntity.ok(exchanges);
    }

    @PostMapping("/chats/{chatId}")
    public ResponseEntity<ExchangeDTO> createExchange(@PathVariable Integer chatId,
            @Valid @RequestBody ExchangeCreateRequest request) {
        Exchange exchange = this.exchangeService.createExchange(chatId, request);
        User currentUser = this.userService.findCurrentUser();

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(this.toDTO(exchange, currentUser));
    }

    @GetMapping("/chat/{chatId}")
    public ResponseEntity<ExchangeDTO> findExchangeByChat(@PathVariable Integer chatId) {
        Exchange exchange = this.exchangeService.findExchangeByChatOrNull(chatId);

        if (exchange == null) {
            return ResponseEntity.noContent().build();
        }

        User currentUser = this.userService.findCurrentUser();

        return ResponseEntity.ok(this.toDTO(exchange, currentUser));
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<ExchangeDTO> acceptExchange(@PathVariable Integer id) {
        Exchange exchange = this.exchangeService.acceptExchange(id);
        User currentUser = this.userService.findCurrentUser();

        return ResponseEntity.ok(this.toDTO(exchange, currentUser));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<ExchangeDTO> rejectExchange(@PathVariable Integer id,
            @Valid @RequestBody ExchangeRejectRequest request) {
        Exchange exchange = this.exchangeService.rejectExchange(id, request);
        User currentUser = this.userService.findCurrentUser();

        return ResponseEntity.ok(this.toDTO(exchange, currentUser));
    }

    @PutMapping("/{id}/resend")
    public ResponseEntity<ExchangeDTO> resendExchange(@PathVariable Integer id,
            @Valid @RequestBody ExchangeCreateRequest request) {
        Exchange exchange = this.exchangeService.resendExchange(id, request);
        User currentUser = this.userService.findCurrentUser();

        return ResponseEntity.ok(this.toDTO(exchange, currentUser));
    }

    private ExchangeDTO toDTO(Exchange exchange, User currentUser) {
        User provider = this.exchangeService.findProvider(exchange.getChat());
        User receiver = this.exchangeService.findReceiver(exchange.getChat());

        return new ExchangeDTO(exchange, currentUser, provider, receiver);
    }
}