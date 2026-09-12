package es.tfg.bancodeltiempo.exchange;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ExchangeRejectRequest {

    @NotBlank
    private String reason;
}