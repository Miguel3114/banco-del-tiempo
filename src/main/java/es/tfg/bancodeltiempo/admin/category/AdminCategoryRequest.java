package es.tfg.bancodeltiempo.admin.category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminCategoryRequest {

    @NotBlank
    @Size(max = 100)
    private String name;
}