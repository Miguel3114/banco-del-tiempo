package es.tfg.bancodeltiempo.review;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.tfg.bancodeltiempo.chat.Chat;
import es.tfg.bancodeltiempo.exceptions.ConflictException;
import es.tfg.bancodeltiempo.exceptions.ResourceNotOwnedException;
import es.tfg.bancodeltiempo.exchange.Exchange;
import es.tfg.bancodeltiempo.exchange.ExchangeService;
import es.tfg.bancodeltiempo.exchange.ExchangeStatus;
import es.tfg.bancodeltiempo.user.User;
import es.tfg.bancodeltiempo.user.UserService;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ExchangeService exchangeService;
    private final UserService userService;

    @Autowired
    public ReviewService(ReviewRepository reviewRepository, ExchangeService exchangeService,
            UserService userService) {
        this.reviewRepository = reviewRepository;
        this.exchangeService = exchangeService;
        this.userService = userService;
    }

    @Transactional(readOnly = true)
    public List<Review> findReviewsByUser(Integer userId) {
        this.userService.findUser(userId);

        return this.reviewRepository.findByUser(userId);
    }

    @Transactional(readOnly = true)
    public Boolean hasReviewed(Integer exchangeId, Integer authorId) {
        return this.reviewRepository.countReview(exchangeId, authorId) > 0;
    }

    @Transactional
    public Review createReview(Integer exchangeId, ReviewCreateRequest request) {
        Exchange exchange = this.exchangeService.findExchange(exchangeId);
        User currentUser = this.userService.findCurrentUser();
        Chat chat = exchange.getChat();

        boolean isAuthor = chat.getListing().getAuthor().getId().equals(currentUser.getId());
        boolean isInterestedUser = chat.getInterestedUser().getId().equals(currentUser.getId());

        if (!isAuthor && !isInterestedUser) {
            throw new ResourceNotOwnedException("No puedes valorar este intercambio");
        }

        if (exchange.getStatus() != ExchangeStatus.ACCEPTED) {
            throw new ConflictException("Solo puedes valorar un intercambio aceptado");
        }

        if (this.hasReviewed(exchange.getId(), currentUser.getId())) {
            throw new ConflictException("Ya has valorado este intercambio");
        }

        User reviewedUser = isAuthor
                ? chat.getInterestedUser()
                : chat.getListing().getAuthor();

        if (reviewedUser.getId().equals(currentUser.getId())) {
            throw new ConflictException("No puedes valorarte a ti mismo");
        }

        Review review = new Review();
        review.setExchange(exchange);
        review.setAuthor(currentUser);
        review.setReviewedUser(reviewedUser);
        review.setRating(request.getRating());

        if (request.getComment() != null && !request.getComment().isBlank()) {
            review.setComment(request.getComment().trim());
        } else {
            review.setComment(null);
        }

        Review savedReview = this.reviewRepository.save(review);

        this.updateAverageRating(reviewedUser);

        return savedReview;
    }

    private void updateAverageRating(User user) {
        Double average = this.reviewRepository.findAverageRating(user.getId());

        if (average == null) {
            user.setAverageRating(null);
        } else {
            user.setAverageRating(
                    BigDecimal.valueOf(average)
                            .setScale(2, RoundingMode.HALF_UP));
        }

        this.userService.saveUser(user);
    }
}