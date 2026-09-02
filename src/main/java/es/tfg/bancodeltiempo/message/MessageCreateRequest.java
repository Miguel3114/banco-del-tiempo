package es.tfg.bancodeltiempo.message;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MessageCreateRequest {

    @NotBlank
    private String content;
}