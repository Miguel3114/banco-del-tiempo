package es.tfg.bancodeltiempo.admin.user;

import java.math.BigDecimal;
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
    private BigDecimal averageRating;
    private AccountStatus accountStatus;

    public AdminUserDTO(User user) {
        this.id = user.getId();
        this.firstName = user.getFirstName();
        this.lastName = user.getLastName();
        this.email = user.getEmail();
        this.hourBalance = user.getHourBalance();
        this.accountStatus = user.getAccountStatus();
    }
}