package es.tfg.bancodeltiempo.admin.statistics;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import es.tfg.bancodeltiempo.exchange.ExchangeRepository;
import es.tfg.bancodeltiempo.exchange.ExchangeStatus;
import es.tfg.bancodeltiempo.listing.ListingRepository;
import es.tfg.bancodeltiempo.listing.ListingStatus;
import es.tfg.bancodeltiempo.user.Role;
import es.tfg.bancodeltiempo.user.User;
import es.tfg.bancodeltiempo.user.UserRepository;
import es.tfg.bancodeltiempo.user.UserService;

@ExtendWith(MockitoExtension.class)
class AdminStatisticsServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ListingRepository listingRepository;

    @Mock
    private ExchangeRepository exchangeRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private AdminStatisticsService adminStatisticsService;

    private User admin;
    private User member;

    @BeforeEach
    void setUp() {
        admin = new User();
        admin.setId(1);
        admin.setRole(Role.ADMIN);

        member = new User();
        member.setId(2);
        member.setRole(Role.MEMBER);
    }

    @Test
    void shouldFindStatisticsWhenCurrentUserIsAdmin() {
        when(userService.findCurrentUser())
                .thenReturn(admin);

        when(userRepository.countByRole(
                Role.MEMBER))
                .thenReturn(10L);

        when(listingRepository.countByStatus(
                ListingStatus.ACTIVE))
                .thenReturn(7L);

        when(exchangeRepository.sumHoursByStatus(
                ExchangeStatus.ACCEPTED))
                .thenReturn(25L);

        AdminStatisticsDTO statistics =
                adminStatisticsService.findStatistics();

        assertEquals(
                10L,
                statistics.getTotalUsers());

        assertEquals(
                7L,
                statistics.getActiveListings());

        assertEquals(
                25L,
                statistics.getTotalHours());

        verify(userRepository)
                .countByRole(Role.MEMBER);

        verify(listingRepository)
                .countByStatus(
                        ListingStatus.ACTIVE);

        verify(exchangeRepository)
                .sumHoursByStatus(
                        ExchangeStatus.ACCEPTED);
    }

    @Test
    void shouldReturnZeroStatisticsWhenThereIsNoActivity() {
        when(userService.findCurrentUser())
                .thenReturn(admin);

        when(userRepository.countByRole(
                Role.MEMBER))
                .thenReturn(0L);

        when(listingRepository.countByStatus(
                ListingStatus.ACTIVE))
                .thenReturn(0L);

        when(exchangeRepository.sumHoursByStatus(
                ExchangeStatus.ACCEPTED))
                .thenReturn(0L);

        AdminStatisticsDTO statistics =
                adminStatisticsService.findStatistics();

        assertEquals(
                0L,
                statistics.getTotalUsers());

        assertEquals(
                0L,
                statistics.getActiveListings());

        assertEquals(
                0L,
                statistics.getTotalHours());
    }

    @Test
    void shouldNotFindStatisticsWhenCurrentUserIsNotAdmin() {
        when(userService.findCurrentUser())
                .thenReturn(member);

        assertThrows(
                AccessDeniedException.class,
                () -> adminStatisticsService.findStatistics());

        verify(userRepository, never())
                .countByRole(Role.MEMBER);

        verify(listingRepository, never())
                .countByStatus(
                        ListingStatus.ACTIVE);

        verify(exchangeRepository, never())
                .sumHoursByStatus(
                        ExchangeStatus.ACCEPTED);
    }
}