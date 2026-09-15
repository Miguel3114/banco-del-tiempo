package es.tfg.bancodeltiempo.admin.category;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import es.tfg.bancodeltiempo.category.Category;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/categories")
public class AdminCategoryRestController {

    private final AdminCategoryService adminCategoryService;

    @Autowired
    public AdminCategoryRestController(AdminCategoryService adminCategoryService) {
        this.adminCategoryService = adminCategoryService;
    }

    @GetMapping
    public ResponseEntity<List<AdminCategoryDTO>> findCategories() {
        List<AdminCategoryDTO> categories = this.adminCategoryService.findCategories()
                .stream()
                .map(category -> new AdminCategoryDTO(
                        category,
                        this.adminCategoryService.countListings(category.getId())))
                .toList();

        return ResponseEntity.ok(categories);
    }

    @PostMapping
    public ResponseEntity<AdminCategoryDTO> createCategory(
            @Valid @RequestBody AdminCategoryRequest request) {
        Category category = this.adminCategoryService.createCategory(request);
        long listingCount = this.adminCategoryService.countListings(category.getId());

        return ResponseEntity.ok(new AdminCategoryDTO(category, listingCount));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdminCategoryDTO> updateCategory(@PathVariable Integer id,
            @Valid @RequestBody AdminCategoryRequest request) {
        Category category = this.adminCategoryService.updateCategory(id, request);
        long listingCount = this.adminCategoryService.countListings(category.getId());

        return ResponseEntity.ok(new AdminCategoryDTO(category, listingCount));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<AdminCategoryDTO> updateStatus(@PathVariable Integer id,
            @Valid @RequestBody AdminCategoryStatusRequest request) {
        Category category = this.adminCategoryService.updateStatus(id, request);
        long listingCount = this.adminCategoryService.countListings(category.getId());

        return ResponseEntity.ok(new AdminCategoryDTO(category, listingCount));
    }
}