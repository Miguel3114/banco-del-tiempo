package es.tfg.bancodeltiempo.admin.listing;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.tfg.bancodeltiempo.exceptions.ConflictException;
import es.tfg.bancodeltiempo.listing.Listing;
import es.tfg.bancodeltiempo.listing.ListingRepository;
import es.tfg.bancodeltiempo.listing.ListingService;
import es.tfg.bancodeltiempo.listing.ListingStatus;
import es.tfg.bancodeltiempo.user.Role;
import es.tfg.bancodeltiempo.user.User;
import es.tfg.bancodeltiempo.user.UserService;

@Service
public class AdminListingService {

    private final ListingRepository listingRepository;
    private final ListingService listingService;
    private final UserService userService;

    @Autowired
    public AdminListingService(ListingRepository listingRepository, ListingService listingService,
            UserService userService) {
        this.listingRepository = listingRepository;
        this.listingService = listingService;
        this.userService = userService;
    }

    @Transactional(readOnly = true)
    public List<Listing> findListings() {
        this.checkAdmin();

        return this.listingRepository.findAdminListings(ListingStatus.ACTIVE);
    }

    @Transactional
    public void deleteListing(Integer id) {
        this.checkAdmin();

        Listing listing = this.listingService.findListingById(id);

        if (listing.getListingStatus() != ListingStatus.ACTIVE) {
            throw new ConflictException("El anuncio no está activo");
        }

        listing.setListingStatus(ListingStatus.INACTIVE);

        this.listingRepository.save(listing);
    }

    private void checkAdmin() {
        User currentUser = this.userService.findCurrentUser();

        if (currentUser.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("No tienes permisos de administrador");
        }
    }
}