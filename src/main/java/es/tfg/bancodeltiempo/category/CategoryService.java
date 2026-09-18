package es.tfg.bancodeltiempo.category;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.tfg.bancodeltiempo.exceptions.ResourceNotFoundException;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Autowired
    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public Category findCategoryById(Integer id) {
        return this.categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Categoría",
                        "id",
                        id));
    }

    @Transactional(readOnly = true)
    public List<Category> findAllCategories() {
        return this.categoryRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Category> findActiveCategories() {
        return this.categoryRepository.findByStatus(CategoryStatus.ACTIVE);
    }

    @Transactional(readOnly = true)
    public Boolean existsCategory(String name) {
        return this.categoryRepository.existsByNameIgnoreCase(name);
    }

    @Transactional
    public Category saveCategory(Category category) {
        return this.categoryRepository.save(category);
    }
}