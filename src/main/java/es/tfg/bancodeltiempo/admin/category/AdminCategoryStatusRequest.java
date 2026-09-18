package es.tfg.bancodeltiempo.admin.category;

import es.tfg.bancodeltiempo.category.CategoryStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminCategoryStatusRequest {

    @NotNull
    private CategoryStatus status;
}