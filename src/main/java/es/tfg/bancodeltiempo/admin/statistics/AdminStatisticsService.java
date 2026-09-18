package es.tfg.bancodeltiempo.admin.statistics;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.tfg.bancodeltiempo.exchange.ExchangeRepository;
import es.tfg.bancodeltiempo.exchange.ExchangeStatus;
import es.tfg.bancodeltiempo.listing.ListingRepository;
import es.tfg.bancodeltiempo.listing.ListingStatus;
import es.tfg.bancodeltiempo.user.Role;
import es.tfg.bancodeltiempo.user.User;
import es.tfg.bancodeltiempo.user.UserRepository;
import es.tfg.bancodeltiempo.user.UserService;

@Service
public class AdminStatisticsService {

    private final UserRepository userRepository;
    private final ListingRepository listingRepository;
    private final ExchangeRepository exchangeRepository;
    private final UserService userService;

    @Autowired
    public AdminStatisticsService(UserRepository userRepository,
            ListingRepository listingRepository,
            ExchangeRepository exchangeRepository,
            UserService userService) {
        this.userRepository = userRepository;
        this.listingRepository = listingRepository;
        this.exchangeRepository = exchangeRepository;
        this.userService = userService;
    }

    @Transactional(readOnly = true)
    public AdminStatisticsDTO findStatistics() {
        this.checkAdmin();

        long totalUsers = this.userRepository.countByRole(Role.MEMBER);
        long activeListings = this.listingRepository.countByStatus(ListingStatus.ACTIVE);
        long totalHours = this.exchangeRepository.sumHoursByStatus(ExchangeStatus.ACCEPTED);

        return new AdminStatisticsDTO(totalUsers, activeListings, totalHours);
    }

    private void checkAdmin() {
        User currentUser = this.userService.findCurrentUser();

        if (currentUser.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("No tienes permisos de administrador");
        }
    }
}