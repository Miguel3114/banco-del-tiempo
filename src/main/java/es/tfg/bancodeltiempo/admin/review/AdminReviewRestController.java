package es.tfg.bancodeltiempo.admin.review;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/reviews")
public class AdminReviewRestController {

    private final AdminReviewService adminReviewService;

    @Autowired
    public AdminReviewRestController(AdminReviewService adminReviewService) {
        this.adminReviewService = adminReviewService;
    }

    @GetMapping
    public ResponseEntity<List<AdminReviewDTO>> findReviews() {
        List<AdminReviewDTO> reviews = this.adminReviewService.findReviews()
                .stream()
                .map(AdminReviewDTO::new)
                .toList();

        return ResponseEntity.ok(reviews);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable Integer id) {
        this.adminReviewService.deleteReview(id);

        return ResponseEntity.noContent().build();
    }
}