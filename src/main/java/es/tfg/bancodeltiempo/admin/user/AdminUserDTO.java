package es.tfg.bancodeltiempo.admin.user;

import java.time.LocalDateTime;

import es.tfg.bancodeltiempo.user.AccountStatus;
import es.tfg.bancodeltiempo.user.User;
import lombok.Getter;

@Getter
public class AdminUserDTO {

    private Integer id;
    private String firstName;
    private String lastName;
    private String email;
    private String profileImageUrl;
    private LocalDateTime registeredAt;
    private Integer hourBalance;
    private AccountStatus accountStatus;

    public AdminUserDTO(User user, Integer hourBalance) {
        this.id = user.getId();
        this.firstName = user.getFirstName();
        this.lastName = user.getLastName();
        this.email = user.getEmail();
        this.profileImageUrl = user.getProfileImageUrl();
        this.registeredAt = user.getRegisteredAt();
        this.hourBalance = hourBalance;
        this.accountStatus = user.getAccountStatus();
    }
}