package es.tfg.bancodeltiempo.user;

import java.util.Set;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserUpdateRequest {

        @NotBlank
        @Size(max = 50)
        private String firstName;

        @NotBlank
        @Size(max = 100)
        private String lastName;

        @NotBlank
        @Email
        @Size(max = 150)
        private String email;

        @Size(max = 1000)
        private String biography;

        private Set<Integer> skillIds;

        @Size(min = 8, max = 100)
        private String password;
}