package es.tfg.bancodeltiempo.admin.user;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import es.tfg.bancodeltiempo.exchange.ExchangeService;
import es.tfg.bancodeltiempo.user.User;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserRestController {

    private final AdminUserService adminUserService;
    private final ExchangeService exchangeService;

    @Autowired
    public AdminUserRestController(AdminUserService adminUserService, ExchangeService exchangeService) {
        this.adminUserService = adminUserService;
        this.exchangeService = exchangeService;
    }

    @GetMapping
    public ResponseEntity<List<AdminUserDTO>> findUsers() {
        List<AdminUserDTO> users = this.adminUserService.findUsers()
                .stream()
                .map(user -> new AdminUserDTO(
                        user,
                        this.exchangeService.findHourBalance(user.getId())))
                .toList();

        return ResponseEntity.ok(users);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<AdminUserDTO> updateStatus(@PathVariable Integer id,
            @Valid @RequestBody AdminUserStatusRequest request) {
        User user = this.adminUserService.updateStatus(id, request);
        Integer hourBalance = this.exchangeService.findHourBalance(user.getId());

        return ResponseEntity.ok(new AdminUserDTO(user, hourBalance));
    }
}