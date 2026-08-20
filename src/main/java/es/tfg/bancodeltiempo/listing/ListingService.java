package es.tfg.bancodeltiempo.listing;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.tfg.bancodeltiempo.category.Category;
import es.tfg.bancodeltiempo.category.CategoryService;
import es.tfg.bancodeltiempo.category.CategoryStatus;
import es.tfg.bancodeltiempo.exceptions.ConflictException;
import es.tfg.bancodeltiempo.exceptions.ResourceNotFoundException;
import es.tfg.bancodeltiempo.exceptions.ResourceNotOwnedException;
import es.tfg.bancodeltiempo.user.User;
import es.tfg.bancodeltiempo.user.UserService;

@Service
public class ListingService {

    private final ListingRepository listingRepository;

    private final UserService userService;

    private final CategoryService categoryService;

    @Autowired
    public ListingService(
            ListingRepository listingRepository,
            UserService userService,
            CategoryService categoryService) {

        this.listingRepository =
                listingRepository;

        this.userService =
                userService;

        this.categoryService =
                categoryService;
    }

    @Transactional(readOnly = true)
    public Listing findListingById(
            Integer id) {

        return this.listingRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Anuncio",
                                "id",
                                id));
    }

    @Transactional(readOnly = true)
    public Listing findActiveListingById(
            Integer id) {

        Listing listing =
                this.findListingById(id);

        if (listing.getListingStatus()
                != ListingStatus.ACTIVE) {

            throw new ConflictException(
                    "El anuncio no está activo");
        }

        return listing;
    }

    @Transactional(readOnly = true)
    public List<Listing> findActiveListings(
            ListingType listingType,
            Integer categoryId,
            String search) {

        String searchText =
                search != null
                        ? search.trim()
                        : "";

        boolean hasCategory =
                categoryId != null;

        boolean hasSearch =
                !searchText.isBlank();

        if (hasCategory && hasSearch) {

            return this.listingRepository
                    .searchByCategory(
                            ListingStatus.ACTIVE,
                            listingType,
                            categoryId,
                            searchText);
        }

        if (hasCategory) {

            return this.listingRepository
                    .findByCategory(
                            ListingStatus.ACTIVE,
                            listingType,
                            categoryId);
        }

        if (hasSearch) {

            return this.listingRepository
                    .searchByTitle(
                            ListingStatus.ACTIVE,
                            listingType,
                            searchText);
        }

        return this.listingRepository
                .findByType(
                        ListingStatus.ACTIVE,
                        listingType);
    }

    @Transactional(readOnly = true)
    public List<Listing> findMyListings() {

        User currentUser =
                this.userService
                        .findCurrentUser();

        return this.listingRepository
                .findByAuthor(
                        currentUser.getId(),
                        ListingStatus.ACTIVE);
    }

    @Transactional
    public Listing createListing(
            ListingCreateRequest request) {

        User currentUser =
                this.userService
                        .findCurrentUser();

        Category category =
                this.findActiveCategory(
                        request.getCategoryId());

        Listing listing =
                new Listing();

        listing.setAuthor(
                currentUser);

        listing.setCategory(
                category);

        listing.setTitle(
                request.getTitle());

        listing.setDescription(
                request.getDescription());

        listing.setListingType(
                request.getListingType());

        listing.setEstimatedHours(
                request.getEstimatedHours());

        listing.setListingStatus(
                ListingStatus.ACTIVE);

        return this.listingRepository
                .save(listing);
    }

    @Transactional
    public Listing updateListing(
            Integer listingId,
            ListingUpdateRequest request) {

        Listing listing =
                this.findListingById(
                        listingId);

        User currentUser =
                this.userService
                        .findCurrentUser();

        this.checkListingOwnership(
                listing,
                currentUser);

        this.checkListingIsActive(
                listing);

        Category category =
                this.findActiveCategory(
                        request.getCategoryId());

        listing.setTitle(
                request.getTitle());

        listing.setDescription(
                request.getDescription());

        listing.setCategory(
                category);

        listing.setEstimatedHours(
                request.getEstimatedHours());

        return this.listingRepository
                .save(listing);
    }

    @Transactional
    public void deleteListing(
            Integer listingId) {

        Listing listing =
                this.findListingById(
                        listingId);

        User currentUser =
                this.userService
                        .findCurrentUser();

        this.checkListingOwnership(
                listing,
                currentUser);

        this.checkListingIsActive(
                listing);

        listing.setListingStatus(
                ListingStatus.INACTIVE);

        this.listingRepository
                .save(listing);
    }

    private Category findActiveCategory(
            Integer categoryId) {

        Category category =
                this.categoryService
                        .findCategoryById(
                                categoryId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Categoría",
                                        "id",
                                        categoryId));

        if (category.getStatus()
                != CategoryStatus.ACTIVE) {

            throw new ConflictException(
                    "La categoría seleccionada no está activa");
        }

        return category;
    }

    private void checkListingOwnership(
            Listing listing,
            User currentUser) {

        if (!listing.getAuthor()
                .getId()
                .equals(currentUser.getId())) {

            throw new ResourceNotOwnedException(
                    "No puedes modificar un anuncio que no te pertenece");
        }
    }

    private void checkListingIsActive(
            Listing listing) {

        if (listing.getListingStatus()
                != ListingStatus.ACTIVE) {

            throw new ConflictException(
                    "El anuncio no está activo");
        }
    }
}