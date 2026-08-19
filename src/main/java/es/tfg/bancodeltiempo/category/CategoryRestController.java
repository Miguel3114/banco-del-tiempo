package es.tfg.bancodeltiempo.category;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/categories")
public class CategoryRestController {

    private CategoryService categoryService;

    @Autowired
    public CategoryRestController(
            CategoryService categoryService) {

        this.categoryService = categoryService;
    }

    @GetMapping("/active")
    public ResponseEntity<List<Category>> findActive() {

        List<Category> categories =
            this.categoryService.findActiveCategories();

        return ResponseEntity.ok(categories);
    }
}