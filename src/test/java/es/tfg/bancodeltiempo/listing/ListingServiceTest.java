package es.tfg.bancodeltiempo.listing;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import es.tfg.bancodeltiempo.category.Category;
import es.tfg.bancodeltiempo.category.CategoryService;
import es.tfg.bancodeltiempo.category.CategoryStatus;
import es.tfg.bancodeltiempo.exceptions.ConflictException;
import es.tfg.bancodeltiempo.exceptions.ResourceNotFoundException;
import es.tfg.bancodeltiempo.exceptions.ResourceNotOwnedException;
import es.tfg.bancodeltiempo.user.User;
import es.tfg.bancodeltiempo.user.UserService;

@ExtendWith(MockitoExtension.class)
class ListingServiceTest {

    @Mock
    private ListingRepository listingRepository;

    @Mock
    private UserService userService;

    @Mock
    private CategoryService categoryService;

    @InjectMocks
    private ListingService listingService;

    private User author;
    private User otherUser;
    private Category category;
    private Listing listing;

    @BeforeEach
    void setUp() {
        author = new User();
        author.setId(1);

        otherUser = new User();
        otherUser.setId(2);

        category = new Category();
        category.setId(1);
        category.setName("Informática");
        category.setStatus(CategoryStatus.ACTIVE);

        listing = new Listing();
        listing.setId(1);
        listing.setAuthor(author);
        listing.setCategory(category);
        listing.setTitle("Clases de Java");
        listing.setDescription("Ofrezco clases de Java");
        listing.setListingType(ListingType.OFFER);
        listing.setEstimatedHours(2);
        listing.setListingStatus(ListingStatus.ACTIVE);
    }

    @Test
    void shouldFindListingById() {
        when(listingRepository.findById(1))
                .thenReturn(Optional.of(listing));

        Listing foundListing =
                listingService.findListingById(1);

        assertSame(listing, foundListing);
    }

    @Test
    void shouldThrowExceptionWhenListingDoesNotExist() {
        when(listingRepository.findById(1))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> listingService.findListingById(1));
    }

    @Test
    void shouldFindActiveListingById() {
        when(listingRepository.findById(1))
                .thenReturn(Optional.of(listing));

        Listing foundListing =
                listingService.findActiveListingById(1);

        assertSame(listing, foundListing);
    }

    @Test
    void shouldNotFindInactiveListingAsActive() {
        listing.setListingStatus(ListingStatus.INACTIVE);

        when(listingRepository.findById(1))
                .thenReturn(Optional.of(listing));

        assertThrows(
                ConflictException.class,
                () -> listingService.findActiveListingById(1));
    }

    @Test
    void shouldFindActiveListings() {
        when(userService.findCurrentUser())
                .thenReturn(author);

        when(listingRepository.findPublic(
                ListingStatus.ACTIVE,
                ListingType.OFFER,
                1,
                1,
                "Java"))
                .thenReturn(List.of(listing));

        List<Listing> listings =
                listingService.findActiveListings(
                        ListingType.OFFER,
                        1,
                        "  Java  ");

        assertEquals(1, listings.size());
        assertSame(listing, listings.get(0));

        verify(listingRepository)
                .findPublic(
                        ListingStatus.ACTIVE,
                        ListingType.OFFER,
                        1,
                        1,
                        "Java");
    }

    @Test
    void shouldUseNullSearchWhenSearchIsBlank() {
        when(userService.findCurrentUser())
                .thenReturn(author);

        when(listingRepository.findPublic(
                ListingStatus.ACTIVE,
                ListingType.OFFER,
                1,
                null,
                null))
                .thenReturn(List.of(listing));

        List<Listing> listings =
                listingService.findActiveListings(
                        ListingType.OFFER,
                        null,
                        "   ");

        assertEquals(1, listings.size());

        verify(listingRepository)
                .findPublic(
                        ListingStatus.ACTIVE,
                        ListingType.OFFER,
                        1,
                        null,
                        null);
    }

    @Test
    void shouldFindMyListings() {
        when(userService.findCurrentUser())
                .thenReturn(author);

        when(listingRepository.findByAuthor(
                1,
                ListingStatus.ACTIVE))
                .thenReturn(List.of(listing));

        List<Listing> listings =
                listingService.findMyListings();

        assertEquals(1, listings.size());
        assertSame(listing, listings.get(0));
    }

    @Test
    void shouldCreateListing() {
        ListingCreateRequest request =
                new ListingCreateRequest();

        request.setTitle("Clases de Java");
        request.setDescription("Ofrezco clases de Java");
        request.setCategoryId(1);
        request.setListingType(ListingType.OFFER);
        request.setEstimatedHours(2);

        when(userService.findCurrentUser())
                .thenReturn(author);

        when(categoryService.findCategoryById(1))
                .thenReturn(category);

        when(listingRepository.save(any(Listing.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0));

        Listing createdListing =
                listingService.createListing(request);

        assertSame(author, createdListing.getAuthor());
        assertSame(category, createdListing.getCategory());
        assertEquals(
                "Clases de Java",
                createdListing.getTitle());
        assertEquals(
                "Ofrezco clases de Java",
                createdListing.getDescription());
        assertEquals(
                ListingType.OFFER,
                createdListing.getListingType());
        assertEquals(
                2,
                createdListing.getEstimatedHours());
        assertEquals(
                ListingStatus.ACTIVE,
                createdListing.getListingStatus());

        verify(listingRepository)
                .save(createdListing);
    }

    @Test
    void shouldNotCreateListingWithInactiveCategory() {
        category.setStatus(CategoryStatus.INACTIVE);

        ListingCreateRequest request =
                new ListingCreateRequest();

        request.setTitle("Clases de Java");
        request.setDescription("Ofrezco clases de Java");
        request.setCategoryId(1);
        request.setListingType(ListingType.OFFER);
        request.setEstimatedHours(2);

        when(userService.findCurrentUser())
                .thenReturn(author);

        when(categoryService.findCategoryById(1))
                .thenReturn(category);

        assertThrows(
                ConflictException.class,
                () -> listingService.createListing(request));

        verify(listingRepository, never())
                .save(any(Listing.class));
    }

    @Test
    void shouldUpdateOwnListing() {
        Category newCategory = new Category();
        newCategory.setId(2);
        newCategory.setName("Idiomas");
        newCategory.setStatus(CategoryStatus.ACTIVE);

        ListingUpdateRequest request =
                new ListingUpdateRequest();

        request.setTitle("Clases de inglés");
        request.setDescription("Ofrezco clases de inglés");
        request.setCategoryId(2);
        request.setEstimatedHours(3);

        when(listingRepository.findById(1))
                .thenReturn(Optional.of(listing));

        when(userService.findCurrentUser())
                .thenReturn(author);

        when(categoryService.findCategoryById(2))
                .thenReturn(newCategory);

        when(listingRepository.save(any(Listing.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0));

        Listing updatedListing =
                listingService.updateListing(
                        1,
                        request);

        assertEquals(
                "Clases de inglés",
                updatedListing.getTitle());

        assertEquals(
                "Ofrezco clases de inglés",
                updatedListing.getDescription());

        assertSame(
                newCategory,
                updatedListing.getCategory());

        assertEquals(
                3,
                updatedListing.getEstimatedHours());

        assertEquals(
                ListingType.OFFER,
                updatedListing.getListingType());

        verify(listingRepository)
                .save(listing);
    }

    @Test
    void shouldNotUpdateListingOwnedByAnotherUser() {
        ListingUpdateRequest request =
                new ListingUpdateRequest();

        request.setTitle("Nuevo título");
        request.setDescription("Nueva descripción");
        request.setCategoryId(1);
        request.setEstimatedHours(3);

        when(listingRepository.findById(1))
                .thenReturn(Optional.of(listing));

        when(userService.findCurrentUser())
                .thenReturn(otherUser);

        assertThrows(
                ResourceNotOwnedException.class,
                () -> listingService.updateListing(
                        1,
                        request));

        verify(listingRepository, never())
                .save(any(Listing.class));
    }

    @Test
    void shouldNotUpdateInactiveListing() {
        listing.setListingStatus(
                ListingStatus.INACTIVE);

        ListingUpdateRequest request =
                new ListingUpdateRequest();

        request.setTitle("Nuevo título");
        request.setDescription("Nueva descripción");
        request.setCategoryId(1);
        request.setEstimatedHours(3);

        when(listingRepository.findById(1))
                .thenReturn(Optional.of(listing));

        when(userService.findCurrentUser())
                .thenReturn(author);

        assertThrows(
                ConflictException.class,
                () -> listingService.updateListing(
                        1,
                        request));

        verify(listingRepository, never())
                .save(any(Listing.class));
    }

    @Test
    void shouldNotUpdateListingWithInactiveCategory() {
        category.setStatus(CategoryStatus.INACTIVE);

        ListingUpdateRequest request =
                new ListingUpdateRequest();

        request.setTitle("Nuevo título");
        request.setDescription("Nueva descripción");
        request.setCategoryId(1);
        request.setEstimatedHours(3);

        when(listingRepository.findById(1))
                .thenReturn(Optional.of(listing));

        when(userService.findCurrentUser())
                .thenReturn(author);

        when(categoryService.findCategoryById(1))
                .thenReturn(category);

        assertThrows(
                ConflictException.class,
                () -> listingService.updateListing(
                        1,
                        request));

        verify(listingRepository, never())
                .save(any(Listing.class));
    }

    @Test
    void shouldDeleteOwnListing() {
        when(listingRepository.findById(1))
                .thenReturn(Optional.of(listing));

        when(userService.findCurrentUser())
                .thenReturn(author);

        listingService.deleteListing(1);

        assertEquals(
                ListingStatus.INACTIVE,
                listing.getListingStatus());

        verify(listingRepository)
                .save(listing);
    }

    @Test
    void shouldNotDeleteListingOwnedByAnotherUser() {
        when(listingRepository.findById(1))
                .thenReturn(Optional.of(listing));

        when(userService.findCurrentUser())
                .thenReturn(otherUser);

        assertThrows(
                ResourceNotOwnedException.class,
                () -> listingService.deleteListing(1));

        assertEquals(
                ListingStatus.ACTIVE,
                listing.getListingStatus());

        verify(listingRepository, never())
                .save(any(Listing.class));
    }

    @Test
    void shouldNotDeleteInactiveListing() {
        listing.setListingStatus(
                ListingStatus.INACTIVE);

        when(listingRepository.findById(1))
                .thenReturn(Optional.of(listing));

        when(userService.findCurrentUser())
                .thenReturn(author);

        assertThrows(
                ConflictException.class,
                () -> listingService.deleteListing(1));

        verify(listingRepository, never())
                .save(any(Listing.class));
    }
}