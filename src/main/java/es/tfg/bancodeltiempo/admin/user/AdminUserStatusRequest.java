package es.tfg.bancodeltiempo.admin.user;

import es.tfg.bancodeltiempo.user.AccountStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminUserStatusRequest {

    @NotNull
    private AccountStatus status;
}