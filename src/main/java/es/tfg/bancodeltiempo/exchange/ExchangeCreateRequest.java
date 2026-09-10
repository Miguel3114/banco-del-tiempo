package es.tfg.bancodeltiempo.exchange;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ExchangeCreateRequest {

    @NotNull
    @Positive
    private Integer hours;
}