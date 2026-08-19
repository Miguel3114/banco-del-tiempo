package es.tfg.bancodeltiempo.listing;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ListingCreateRequest {

    @NotBlank
    @Size(max = 150)
    private String title;

    @NotBlank
    private String description;

    @NotNull
    private Integer categoryId;

    @NotNull
    private ListingType listingType;

    @NotNull
    @Min(1)
    private Integer estimatedHours;
}