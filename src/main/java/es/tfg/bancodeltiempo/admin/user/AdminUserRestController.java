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

import es.tfg.bancodeltiempo.user.User;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserRestController {

    private final AdminUserService adminUserService;

    @Autowired
    public AdminUserRestController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    @GetMapping
    public ResponseEntity<List<AdminUserDTO>> findUsers() {
        List<AdminUserDTO> users = this.adminUserService.findUsers()
                .stream()
                .map(AdminUserDTO::new)
                .toList();

        return ResponseEntity.ok(users);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<AdminUserDTO> updateStatus(@PathVariable Integer id,
            @Valid @RequestBody AdminUserStatusRequest request) {
        User user = this.adminUserService.updateStatus(id, request);

        return ResponseEntity.ok(new AdminUserDTO(user));
    }
}