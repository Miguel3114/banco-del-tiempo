package es.tfg.bancodeltiempo.admin.category;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.tfg.bancodeltiempo.category.Category;
import es.tfg.bancodeltiempo.category.CategoryRepository;
import es.tfg.bancodeltiempo.category.CategoryService;
import es.tfg.bancodeltiempo.category.CategoryStatus;
import es.tfg.bancodeltiempo.exceptions.ConflictException;
import es.tfg.bancodeltiempo.listing.ListingRepository;
import es.tfg.bancodeltiempo.listing.ListingStatus;
import es.tfg.bancodeltiempo.user.Role;
import es.tfg.bancodeltiempo.user.User;
import es.tfg.bancodeltiempo.user.UserService;

@Service
public class AdminCategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryService categoryService;
    private final ListingRepository listingRepository;
    private final UserService userService;

    @Autowired
    public AdminCategoryService(CategoryRepository categoryRepository, CategoryService categoryService,
            ListingRepository listingRepository, UserService userService) {
        this.categoryRepository = categoryRepository;
        this.categoryService = categoryService;
        this.listingRepository = listingRepository;
        this.userService = userService;
    }

    @Transactional(readOnly = true)
    public List<Category> findCategories() {
        this.checkAdmin();

        return this.categoryService.findAllCategories();
    }

    @Transactional(readOnly = true)
    public long countListings(Integer categoryId) {
        return this.listingRepository.countByCategory(categoryId);
    }

    @Transactional
    public Category createCategory(AdminCategoryRequest request) {
        this.checkAdmin();

        String name = request.getName().trim();

        if (this.categoryRepository.existsByNameIgnoreCase(name)) {
            throw new ConflictException("Ya existe una categoría con ese nombre");
        }

        Category category = new Category();
        category.setName(name);
        category.setStatus(CategoryStatus.ACTIVE);

        return this.categoryService.saveCategory(category);
    }

    @Transactional
    public Category updateCategory(Integer id, AdminCategoryRequest request) {
        this.checkAdmin();

        Category category = this.categoryService.findCategoryById(id);
        String name = request.getName().trim();

        if (this.categoryRepository.existsNameExcludingId(name, id)) {
            throw new ConflictException("Ya existe una categoría con ese nombre");
        }

        category.setName(name);

        return this.categoryService.saveCategory(category);
    }

    @Transactional
    public Category updateStatus(Integer id, AdminCategoryStatusRequest request) {
        this.checkAdmin();

        Category category = this.categoryService.findCategoryById(id);

        if (request.getStatus() == CategoryStatus.INACTIVE &&
                category.getStatus() != CategoryStatus.INACTIVE &&
                this.listingRepository.hasListings(id, ListingStatus.ACTIVE)) {
            throw new ConflictException(
                    "No se puede desactivar la categoría mientras tenga anuncios activos asociados");
        }

        category.setStatus(request.getStatus());

        return this.categoryService.saveCategory(category);
    }

    private void checkAdmin() {
        User currentUser = this.userService.findCurrentUser();

        if (currentUser.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("No tienes permisos de administrador");
        }
    }
}