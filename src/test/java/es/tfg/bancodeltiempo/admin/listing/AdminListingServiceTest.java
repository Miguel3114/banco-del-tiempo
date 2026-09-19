package es.tfg.bancodeltiempo.admin.listing;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
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

import es.tfg.bancodeltiempo.exceptions.ConflictException;
import es.tfg.bancodeltiempo.listing.Listing;
import es.tfg.bancodeltiempo.listing.ListingRepository;
import es.tfg.bancodeltiempo.listing.ListingService;
import es.tfg.bancodeltiempo.listing.ListingStatus;
import es.tfg.bancodeltiempo.user.Role;
import es.tfg.bancodeltiempo.user.User;
import es.tfg.bancodeltiempo.user.UserService;

@ExtendWith(MockitoExtension.class)
class AdminListingServiceTest {

    @Mock
    private ListingRepository listingRepository;

    @Mock
    private ListingService listingService;

    @Mock
    private UserService userService;

    @InjectMocks
    private AdminListingService adminListingService;

    private User admin;
    private User member;
    private Listing listing;

    @BeforeEach
    void setUp() {
        admin = new User();
        admin.setId(1);
        admin.setRole(Role.ADMIN);

        member = new User();
        member.setId(2);
        member.setRole(Role.MEMBER);

        listing = new Listing();
        listing.setId(1);
        listing.setListingStatus(ListingStatus.ACTIVE);
    }

    @Test
    void shouldFindListingsWhenCurrentUserIsAdmin() {
        when(userService.findCurrentUser())
                .thenReturn(admin);

        when(listingRepository.findAdminListings(
                ListingStatus.ACTIVE))
                .thenReturn(List.of(listing));

        List<Listing> listings =
                adminListingService.findListings();

        assertEquals(1, listings.size());
        assertSame(listing, listings.get(0));

        verify(listingRepository)
                .findAdminListings(
                        ListingStatus.ACTIVE);
    }

    @Test
    void shouldNotFindListingsWhenCurrentUserIsNotAdmin() {
        when(userService.findCurrentUser())
                .thenReturn(member);

        assertThrows(
                AccessDeniedException.class,
                () -> adminListingService.findListings());

        verify(listingRepository, never())
                .findAdminListings(
                        ListingStatus.ACTIVE);
    }

    @Test
    void shouldDeleteActiveListing() {
        when(userService.findCurrentUser())
                .thenReturn(admin);

        when(listingService.findListingById(1))
                .thenReturn(listing);

        adminListingService.deleteListing(1);

        assertEquals(
                ListingStatus.INACTIVE,
                listing.getListingStatus());

        verify(listingRepository)
                .save(listing);
    }

    @Test
    void shouldNotDeleteInactiveListing() {
        listing.setListingStatus(
                ListingStatus.INACTIVE);

        when(userService.findCurrentUser())
                .thenReturn(admin);

        when(listingService.findListingById(1))
                .thenReturn(listing);

        assertThrows(
                ConflictException.class,
                () -> adminListingService.deleteListing(1));

        assertEquals(
                ListingStatus.INACTIVE,
                listing.getListingStatus());

        verify(listingRepository, never())
                .save(listing);
    }

    @Test
    void shouldNotDeleteListingWhenCurrentUserIsNotAdmin() {
        when(userService.findCurrentUser())
                .thenReturn(member);

        assertThrows(
                AccessDeniedException.class,
                () -> adminListingService.deleteListing(1));

        verify(listingService, never())
                .findListingById(1);

        verify(listingRepository, never())
                .save(listing);
    }
}