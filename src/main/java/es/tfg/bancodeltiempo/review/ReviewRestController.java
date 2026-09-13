package es.tfg.bancodeltiempo.review;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/reviews")
public class ReviewRestController {

    private final ReviewService reviewService;

    @Autowired
    public ReviewRestController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping("/exchanges/{exchangeId}")
    public ResponseEntity<ReviewDTO> createReview(@PathVariable Integer exchangeId,
            @Valid @RequestBody ReviewCreateRequest request) {

        Review review = this.reviewService.createReview(exchangeId, request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ReviewDTO(review));
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<List<ReviewDTO>> findReviewsByUser(@PathVariable Integer userId) {
        List<ReviewDTO> reviews = this.reviewService.findReviewsByUser(userId)
                .stream()
                .map(ReviewDTO::new)
                .toList();

        return ResponseEntity.ok(reviews);
    }
}