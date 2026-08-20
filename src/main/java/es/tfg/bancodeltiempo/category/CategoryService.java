package es.tfg.bancodeltiempo.category;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CategoryService {

    private CategoryRepository categoryRepository;

    @Autowired
    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public Optional<Category> findCategoryById(Integer id) {
        return this.categoryRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Iterable<Category> findAllCategories() {
        return this.categoryRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Category> findActiveCategories() {
        return this.categoryRepository.findByStatus(CategoryStatus.ACTIVE);
    }

    @Transactional(readOnly = true)
    public Boolean existsCategory(String name) {
        return this.categoryRepository.existsByName(name);
    }

    @Transactional
    public Category saveCategory(Category category) throws DataAccessException {
        this.categoryRepository.save(category);
        return category;
    }
}
