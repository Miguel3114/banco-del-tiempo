package es.tfg.bancodeltiempo.admin.category;

import es.tfg.bancodeltiempo.category.Category;
import es.tfg.bancodeltiempo.category.CategoryStatus;
import lombok.Getter;

@Getter
public class AdminCategoryDTO {

    private Integer id;
    private String name;
    private long listingCount;
    private CategoryStatus status;

    public AdminCategoryDTO(Category category, long listingCount) {
        this.id = category.getId();
        this.name = category.getName();
        this.listingCount = listingCount;
        this.status = category.getStatus();
    }
}