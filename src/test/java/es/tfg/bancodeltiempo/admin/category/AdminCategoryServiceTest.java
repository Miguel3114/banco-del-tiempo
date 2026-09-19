package es.tfg.bancodeltiempo.admin.category;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

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

@ExtendWith(MockitoExtension.class)
class AdminCategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private CategoryService categoryService;

    @Mock
    private ListingRepository listingRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private AdminCategoryService adminCategoryService;

    private User admin;
    private User member;
    private Category category;

    @BeforeEach
    void setUp() {
        admin = new User();
        admin.setId(1);
        admin.setRole(Role.ADMIN);

        member = new User();
        member.setId(2);
        member.setRole(Role.MEMBER);

        category = new Category();
        category.setId(1);
        category.setName("Informática");
        category.setStatus(CategoryStatus.ACTIVE);
    }

    @Test
    void shouldFindCategoriesWhenCurrentUserIsAdmin() {
        when(userService.findCurrentUser())
                .thenReturn(admin);

        when(categoryService.findAllCategories())
                .thenReturn(List.of(category));

        List<Category> categories =
                adminCategoryService.findCategories();

        assertEquals(1, categories.size());
        assertSame(category, categories.get(0));
    }

    @Test
    void shouldNotFindCategoriesWhenCurrentUserIsNotAdmin() {
        when(userService.findCurrentUser())
                .thenReturn(member);

        assertThrows(
                AccessDeniedException.class,
                () -> adminCategoryService.findCategories());

        verify(categoryService, never())
                .findAllCategories();
    }

    @Test
    void shouldCountListingsByCategory() {
        when(listingRepository.countByCategory(1))
                .thenReturn(3L);

        long result =
                adminCategoryService.countListings(1);

        assertEquals(3L, result);

        verify(listingRepository)
                .countByCategory(1);
    }

    @Test
    void shouldCreateCategory() {
        AdminCategoryRequest request =
                new AdminCategoryRequest();

        request.setName("  Idiomas  ");

        when(userService.findCurrentUser())
                .thenReturn(admin);

        when(categoryRepository.existsByNameIgnoreCase(
                "Idiomas"))
                .thenReturn(false);

        when(categoryService.saveCategory(
                any(Category.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0));

        Category createdCategory =
                adminCategoryService.createCategory(
                        request);

        assertEquals(
                "Idiomas",
                createdCategory.getName());

        assertEquals(
                CategoryStatus.ACTIVE,
                createdCategory.getStatus());

        verify(categoryService)
                .saveCategory(createdCategory);
    }

    @Test
    void shouldNotCreateDuplicateCategory() {
        AdminCategoryRequest request =
                new AdminCategoryRequest();

        request.setName("Informática");

        when(userService.findCurrentUser())
                .thenReturn(admin);

        when(categoryRepository.existsByNameIgnoreCase(
                "Informática"))
                .thenReturn(true);

        assertThrows(
                ConflictException.class,
                () -> adminCategoryService.createCategory(
                        request));

        verify(categoryService, never())
                .saveCategory(any(Category.class));
    }

    @Test
    void shouldUpdateCategory() {
        AdminCategoryRequest request =
                new AdminCategoryRequest();

        request.setName("  Programación  ");

        when(userService.findCurrentUser())
                .thenReturn(admin);

        when(categoryService.findCategoryById(1))
                .thenReturn(category);

        when(categoryRepository.existsNameExcludingId(
                "Programación",
                1))
                .thenReturn(false);

        when(categoryService.saveCategory(category))
                .thenReturn(category);

        Category updatedCategory =
                adminCategoryService.updateCategory(
                        1,
                        request);

        assertEquals(
                "Programación",
                updatedCategory.getName());

        verify(categoryService)
                .saveCategory(category);
    }

    @Test
    void shouldNotUpdateCategoryWithDuplicateName() {
        AdminCategoryRequest request =
                new AdminCategoryRequest();

        request.setName("Idiomas");

        when(userService.findCurrentUser())
                .thenReturn(admin);

        when(categoryService.findCategoryById(1))
                .thenReturn(category);

        when(categoryRepository.existsNameExcludingId(
                "Idiomas",
                1))
                .thenReturn(true);

        assertThrows(
                ConflictException.class,
                () -> adminCategoryService.updateCategory(
                        1,
                        request));

        verify(categoryService, never())
                .saveCategory(category);
    }

    @Test
    void shouldDeactivateCategoryWithoutActiveListings() {
        AdminCategoryStatusRequest request =
                new AdminCategoryStatusRequest();

        request.setStatus(
                CategoryStatus.INACTIVE);

        when(userService.findCurrentUser())
                .thenReturn(admin);

        when(categoryService.findCategoryById(1))
                .thenReturn(category);

        when(listingRepository.hasListings(
                1,
                ListingStatus.ACTIVE))
                .thenReturn(false);

        when(categoryService.saveCategory(category))
                .thenReturn(category);

        Category updatedCategory =
                adminCategoryService.updateStatus(
                        1,
                        request);

        assertEquals(
                CategoryStatus.INACTIVE,
                updatedCategory.getStatus());

        verify(categoryService)
                .saveCategory(category);
    }

    @Test
    void shouldNotDeactivateCategoryWithActiveListings() {
        AdminCategoryStatusRequest request =
                new AdminCategoryStatusRequest();

        request.setStatus(
                CategoryStatus.INACTIVE);

        when(userService.findCurrentUser())
                .thenReturn(admin);

        when(categoryService.findCategoryById(1))
                .thenReturn(category);

        when(listingRepository.hasListings(
                1,
                ListingStatus.ACTIVE))
                .thenReturn(true);

        assertThrows(
                ConflictException.class,
                () -> adminCategoryService.updateStatus(
                        1,
                        request));

        assertEquals(
                CategoryStatus.ACTIVE,
                category.getStatus());

        verify(categoryService, never())
                .saveCategory(category);
    }

    @Test
    void shouldActivateInactiveCategory() {
        category.setStatus(
                CategoryStatus.INACTIVE);

        AdminCategoryStatusRequest request =
                new AdminCategoryStatusRequest();

        request.setStatus(
                CategoryStatus.ACTIVE);

        when(userService.findCurrentUser())
                .thenReturn(admin);

        when(categoryService.findCategoryById(1))
                .thenReturn(category);

        when(categoryService.saveCategory(category))
                .thenReturn(category);

        Category updatedCategory =
                adminCategoryService.updateStatus(
                        1,
                        request);

        assertEquals(
                CategoryStatus.ACTIVE,
                updatedCategory.getStatus());

        verify(categoryService)
                .saveCategory(category);

        verify(listingRepository, never())
                .hasListings(
                        1,
                        ListingStatus.ACTIVE);
    }

    @Test
    void shouldNotCreateCategoryWhenCurrentUserIsNotAdmin() {
        AdminCategoryRequest request =
                new AdminCategoryRequest();

        request.setName("Idiomas");

        when(userService.findCurrentUser())
                .thenReturn(member);

        assertThrows(
                AccessDeniedException.class,
                () -> adminCategoryService.createCategory(
                        request));

        verify(categoryService, never())
                .saveCategory(any(Category.class));
    }
}   